import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { PROPCO, FAULT_STAGES } from './../../../shared/constants';

@Component({
  selector: 'app-arranging-contractor',
  templateUrl: './arranging-contractor.component.html',
  styleUrls: ['./arranging-contractor.component.scss'],
})
export class ArrangingContractorComponent implements OnInit {
  raiseQuoteForm: FormGroup;
  addContractorForm: FormGroup;
  contractorListForm: FormGroup;
  @Input() quoteId;
  @Input() faultDetails: FaultModels.IFaultResponse;
  @Output() public btnAction: EventEmitter<any> = new EventEmitter();
  faultMaintenanceDetails: FaultModels.IMaintenanceQuoteResponse;
  contractors: Observable<FaultModels.IContractorResponse>;
  private subject: Subject<string> = new Subject();
  resultsAvailable = false;
  contractorList: any;
  lookupdata: any;
  contractorSkill: any;
  faultCategories: any;
  categoryMap = new Map();

  constructor(
    private fb: FormBuilder,
    private faultService: FaultsService,
    private commonService: CommonService

  ) { }

  ngOnInit() {
    this.initiateArrangingContractors();
  }

  private initiateArrangingContractors(): void {
    this.getLookupData();
    this.initForms();
    this.initApiCalls();
  }

  private initForms(): void {
    this.initQuoteForm();
    this.initAddContractorForm();
    this.initContractorListForm();
  }

  private initQuoteForm(): void {
    this.raiseQuoteForm = this.fb.group({
      worksOrderNumber: [this.faultDetails.reference, Validators.required],
      paidBy: ['LANDLORD', Validators.required],
      propertyId: [this.faultDetails.propertyId, Validators.required],
      category: [{ value: Number(this.faultDetails.category), disabled: true }, Validators.required],
      description: ['', Validators.required],
      orderedBy: [{ value: '', disabled: true }, Validators.required],
      requiredStartDate: ['', Validators.required],
      contactOnSite: '',
      accessDetails: [{ value: '', disabled: true }],
      contractorForm:
        this.fb.group({
          contractor: ['', Validators.required],
          skillSet: '',
          contractorObj: ''
        }),
      contractorList: this.fb.array([]),
      contractorIds: [],
      selectedContractorId: ['', Validators.required]
    });

    this.contractors = this.raiseQuoteForm.get('contractorForm.contractor').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.faultService.searchContractor(value) :
        new Observable())
    );
  }

  createContractorsList(): FormGroup {
    const val = this.raiseQuoteForm?.get('contractorForm').value;
    return this.fb.group({
      company: { value: val ? val.contractor : '', disabled: true },
      contactTel: { value: '', disabled: true },
      trade: { value: val ? val.skillSet : '', disabled: true },
      select: 0
    });
  }

  addContractor(): void {
    this.contractorList = this.raiseQuoteForm.get('contractorList') as FormArray;
    this.contractorList.push(this.createContractorsList());
    this.raiseQuoteForm.get('contractorForm').reset();
  }

  removeContractor(index: any) {
    this.contractorList.removeAt(index);
  }

  private initAddContractorForm(): void {
    this.addContractorForm = this.fb.group({
    });
  }

  private initContractorListForm(): void {
    this.addContractorForm = this.fb.group({
    });
  }

  private async initApiCalls() {
    this.faultMaintenanceDetails = await this.getFaultMaintenance() as FaultModels.IMaintenanceQuoteResponse;
    if (this.faultMaintenanceDetails) { this.initPatching(); }
  }

  private getFaultMaintenance() {
    const promise = new Promise((resolve, reject) => {
      this.faultService.getQuoteDetails(this.faultDetails.faultId).subscribe((res) => {
        resolve(res ? res.data[0] : undefined);
      }, error => {
        this.commonService.showMessage('Something went wrong', 'Arranging Contractor', 'error');
        resolve(false);
      });
    });
    return promise;
  }

  initPatching(): void {
    this.raiseQuoteForm.patchValue(
      {
        worksOrderNumber: this.faultMaintenanceDetails.worksOrderNumber,
        description: this.faultMaintenanceDetails.description,
        orderedBy: this.faultMaintenanceDetails.orderedBy,
        requiredStartDate: this.faultMaintenanceDetails.requiredStartDate,
        accessDetails: this.faultMaintenanceDetails.accessDetails,
        selectedContractorId: this.faultMaintenanceDetails.selectedContractorId
      }
    );
  }


  onSearch(event: any) {
    const searchString = event.target.value;
    if (searchString.length > 2) {
      this.resultsAvailable = true;
    } else {
      this.resultsAvailable = false;
    }
  }

  selectContractor(selected) {
    this.raiseQuoteForm.get('contractorForm').patchValue({
      contractor: selected ? selected.fullName + ','
        + ' ' + selected.reference : undefined, contractorObj: selected ? selected : undefined
    });
    this.resultsAvailable = false;
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }
  }

  private setLookupData(data) {
    this.contractorSkill = data.contractorSkills;
    this.faultCategories = data.faultCategories;
    this.setCategoryMap();
  }

  private setCategoryMap() {
    this.faultCategories.map((cat, index) => {
      this.categoryMap.set(cat.index, cat.value);
      // cat.imgPath = this.categoryIconList[index];
    });
  }

  _btnHandler(type: string) {
    switch (type) {
      case 'save': {
        this.saveForLater();
        break;
      }
      case 'proceed': {
        this.proceed();
        break;
      }
      default: {
        this.btnAction.emit(type);
        break;
      }
    }
  }

  private async saveForLater() {
    if (!this.faultMaintenanceDetails) {
      // if (!this.raiseQuoteForm.valid && this.raiseQuoteForm.value.contractorList.length == 0) {
      //   this.commonService.showMessage('Please fill all required fields.', 'Raise a Quote', 'error');
      //   return;
      // }
      /*raise a quote*/
      const quoteRaised = await this.raiseQuote();
      if (quoteRaised) {
        await this.getFaultMaintenance();
        this.updateFault();
      }
    } else {
      /*update a quote*/
      const quoteUpdated = await this.updateQuote();
      const faultContUpdated = await this.updateFaultQuoteContractor();
      if (quoteUpdated && faultContUpdated) {
        this.updateFault();
      }
    }
  }

  private raiseQuote() {
    const promise = new Promise((resolve, reject) => {
      this.faultService.raiseQuote(this.prepareQuoteData(), this.faultDetails.faultId).subscribe((res) => {
        resolve(res);
        this.commonService.showMessage('Successfully Raised', 'Raise a Quote', 'success');
      }, error => {
        resolve(false);
        this.commonService.showMessage('Something went wrong', 'Raise a Quote', 'error');
      });
    });
    return promise;
  }

  private updateQuote() {
    const promise = new Promise((resolve, reject) => {
      this.faultService.updateQuoteDetails(
        this.prepareQuoteData(), this.faultMaintenanceDetails.maintenanceId).subscribe((res) => {
          resolve(true);
          this.commonService.showMessage('Successfully Updated', 'Update Quote', 'success');
        }, error => {
          resolve(false);
          this.commonService.showMessage('Something went wrong', 'Update Quote', 'error');
        });
    });
    return promise;
  }

  private updateFaultQuoteContractor() {
    const promise = new Promise((resolve, reject) => {
      this.faultService.updateFaultQuoteContractor(
        { selectedContractorId: this.raiseQuoteForm.value.selectedContractorId },
        this.faultDetails.faultId,
        this.faultMaintenanceDetails.maintenanceId).subscribe((res) => {
          resolve(true);
          this.commonService.showMessage('Successfully Updated', 'Update Quote Contractor', 'success');
        }, error => {
          resolve(false);
          this.commonService.showMessage('Something went wrong', 'Update Quote Contractor', 'error');
        });
    });
    return promise;
  }

  private updateFault(isSubmit = false) {
    const promise = new Promise((resolve, reject) => {
      this.faultService.updateFault(
        this.faultDetails.faultId, this.prepareFaultData(isSubmit)).subscribe((res) => {
          resolve(true);
        }, error => {
          resolve(false);
          this.commonService.showMessage('Something went wrong', 'Update Fault', 'error');
        });
    });
    return promise;
  }

  private prepareQuoteData() {
    const quoteReqObj = JSON.parse(JSON.stringify(this.raiseQuoteForm.value));
    quoteReqObj.requiredStartDate = this.commonService.getFormatedDate(new Date(quoteReqObj.requiredStartDate));
    // quoteReqObj.contractorList = [{contractorId:'df33ad85-c600-4298-a72a-d572d93dbddb'}]
    // quoteReqObj.selectedContractorId = 'df33ad85-c600-4298-a72a-d572d93dbddb';
    // quoteReqObj.descption = "test";
    delete quoteReqObj.contractorForm;
    if (!this.faultMaintenanceDetails) {
      quoteReqObj.contractorIds = quoteReqObj.contractorList.map(x => x.contractorId).filter(x => x);
    } else {
      delete quoteReqObj.contractorIds;
    }
    delete quoteReqObj.contractorList;
    return quoteReqObj;
  }

  private prepareFaultData(isSubmit: boolean) {
    const faultReqObj: any = {};
    faultReqObj.isDraft = isSubmit ? false : true;
    faultReqObj.stage = isSubmit ? FAULT_STAGES.JOB_COMPLETION : this.faultDetails.stage;
    return faultReqObj;
  }

  private async proceed() {
    if (!this.raiseQuoteForm.valid) {
      this.commonService.showMessage('Please fill all required fields.', 'Raise a Quote', 'error');
      return;
    }
    if (!this.faultMaintenanceDetails) {
      /*raise a quote*/
      const quoteRaised = await this.raiseQuote();
      if (quoteRaised) {
        this.updateFault(true);
      }
    } else {
      /*update a quote*/
      const quoteUpdated = await this.updateQuote();
      const faultContUpdated = await this.updateFaultQuoteContractor();
      if (quoteUpdated && faultContUpdated) {
        this.updateFault(true);
      }
    }
  }

}
