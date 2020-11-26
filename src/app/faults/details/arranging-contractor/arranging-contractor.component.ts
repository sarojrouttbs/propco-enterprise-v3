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
  @Input() preferredSuppliers;
  isSelected = false;
  contratctorArr: string[] = [];
  isContratorSelected = false;

  constructor(
    private fb: FormBuilder,
    private faultService: FaultsService,
    private commonService: CommonService

  ) { }

  ngOnInit() {
    this.initiateArrangingContractors();
  }

  ngOnChanges() {
    this.preferredSuppliers.map((x) => { this.addContractor(x, true) });
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
      category: [{ value: Number(this.faultDetails.category), disabled: true }],
      description: ['', Validators.required],
      orderedBy: [{ value: '', disabled: true }, Validators.required],
      requiredStartDate: ['', Validators.required],
      contactOnSite: '',
      accessDetails: [{ value: '', disabled: true }],
      contractorForm:
        this.fb.group({
          contractor: '',
          skillSet: '',
          contractorObj: ''
        }),
      contractorList: this.fb.array([]),
      contractorIds: [],
      selectedContractorId: ''
    });

    this.contractors = this.raiseQuoteForm.get('contractorForm.contractor').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.faultService.searchContractor(value) :
        new Observable())
    );
  }

  addContractor(data, isPatching = false): void {
    if (this.contratctorArr.includes(data?.contractorObj?.entityId)) {
      this.isContratorSelected = true;
      return;
    }
    const contractorList = this.raiseQuoteForm.get('contractorList') as FormArray;
    let grup = {
      reference: [{ value: data ? data.reference : '', disabled: true }],
      name: '',
      company: [{ value: data ? data.company : '', disabled: true }],
      email: '',
      mobile: [{ value: '', disabled: true }],
      address: '',
      contractorId: data.contractorId ? data.contractorId : data.contractorObj.entityId,
      select: '',
      isPreferred: isPatching,
      prefered: '',
      checked: !isPatching ? false : (data.contractorId == this.raiseQuoteForm.get('selectedContractorId').value ? true : false)
    }
    contractorList.push(this.fb.group(grup));
    this.contratctorArr.push(data.contractorId ? data.contractorId : data.contractorObj.entityId);

    if (!isPatching) {
      this.raiseQuoteForm.get('contractorForm').reset();
      this.isSelected = false;
    }
  }

  async removeContractor(i: any) {
    const contractorList = this.raiseQuoteForm.get('contractorList') as FormArray;
    const deleteContractor = await this.commonService.showConfirm('Delete Contrator', 'Do you want to delete contractor from the list?');
    if (deleteContractor) {
      var index = this.contratctorArr.indexOf(contractorList.at(i).get('contractorId').value);
      this.contratctorArr.splice(index, 1);

      if (!this.faultMaintenanceDetails) {
        contractorList.removeAt(i);
        return;
      }
      const isDeleted = await this.deleteContrator(this.faultMaintenanceDetails.maintenanceId, contractorList.at(i).get('contractorId').value);
      if (isDeleted) {
        contractorList.removeAt(i);
      }
    }
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
    await this.getUserDetails();
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
        // orderedBy: this.faultMaintenanceDetails.orderedBy,
        requiredStartDate: this.faultMaintenanceDetails.requiredStartDate,
        accessDetails: this.faultMaintenanceDetails.accessDetails,
        selectedContractorId: this.faultMaintenanceDetails.selectedContractorId
      }
    );
    this.faultMaintenanceDetails.quoteContractors.map((x) => { this.addContractor(x, true) });
  }


  onSearch(event: any) {
    this.isSelected = false;
    this.isContratorSelected = false;
    const searchString = event.target.value;
    if (searchString.length > 2) {
      this.resultsAvailable = true;
    } else {
      this.resultsAvailable = false;
    }
  }

  selectContractor(selected) {
    this.raiseQuoteForm.get('contractorForm').patchValue({ contractor: selected ? selected.fullName : undefined, contractorObj: selected ? selected : undefined });
    this.resultsAvailable = false;
    this.isSelected = true;
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
      /*raise a quote*/
      const quoteRaised = await this.raiseQuote();
      if (quoteRaised) {
        await this.getFaultMaintenance();
        this.updateFault();
      }
    } else {
      /*update a quote*/
      const quoteUpdated = await this.updateQuote();
      if (quoteUpdated) {
        const addContractors = await this.addContractors();
        if (addContractors) {
          const faultContUpdated = await this.updateFaultQuoteContractor();
          if (faultContUpdated) {
            this.updateFault();
          }
        }
      }
    }
  }

  private raiseQuote() {
    if (!this.raiseQuoteForm.valid) {
      this.commonService.showMessage('Please fill all required fields.', 'Raise a Quote', 'error');
      this.raiseQuoteForm.markAllAsTouched();
      return;
    }
    if (this.raiseQuoteForm.value.contractorList.length == 0) {
      this.commonService.showMessage('Add atleast 1 contractor', 'Raise a Quote', 'error');
      return;
    }
    if (!this.raiseQuoteForm.get('selectedContractorId').value) {
      this.commonService.showMessage('Select atleast 1 contractor.', 'Raise a Quote', 'error');
      return;
    }
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
    if (!this.raiseQuoteForm.valid) {
      this.commonService.showMessage('Please fill all required fields.', 'Update a Quote', 'error');
      this.raiseQuoteForm.markAllAsTouched();
      return false;
    }
    if (this.raiseQuoteForm.value.contractorList.length == 0) {
      this.commonService.showMessage('Add atleast 1 contractor', 'Update a Quote', 'error');
      return false;
    }
    if (!this.raiseQuoteForm.get('selectedContractorId').value) {
      this.commonService.showMessage('Select atleast 1 contractor.', 'Update a Quote', 'error');
      return false;
    }
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
    // quoteReqObj.descption = "kitchen management task";

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

  addContractors() {
    const promise = new Promise((resolve, reject) => {
      let contractIds = [];
      this.raiseQuoteForm.get('contractorList').value.forEach(info => {
        if (info.isPreferred === false) {
          contractIds.push(info.contractorId);
        }
      });
      if (contractIds.length) {
        this.faultService.addContractor(this.faultMaintenanceDetails.maintenanceId, {contractorIds:contractIds}).subscribe(
          res => {
            resolve(true);
          },
          error => {
            resolve(false);
          }
        );
      } else {
        resolve(true);
      }
    });
    return promise;
  }

  private deleteContrator(maintenanceId: string, contractorId: string) {
    const promise = new Promise((resolve, reject) => {
      this.faultService.deleteContractor(maintenanceId, contractorId).subscribe(
        res => {
          resolve(true);
        },
        error => {
          console.log(error);
          resolve(false);
        }
      );
    });
    return promise;
  }

  getUserDetails() {
    this.faultService.getUserDetails().subscribe((res) => {
      let data = res ? res.data[0] : '';
      if (data) {
        this.raiseQuoteForm.get('orderedBy').setValue(data.name);
      }
    }, error => {
    });
  }

  updateSelection(item, i) {
    this.raiseQuoteForm.get('selectedContractorId').setValue('');
    const contlistArray = this.raiseQuoteForm.get('contractorList') as FormArray;
    if (!item.checked) {
      this.raiseQuoteForm.get('selectedContractorId').setValue(item.contractorId);
      contlistArray.controls.forEach((element, index) => {
        if (i != index) {
          element.get('checked').setValue(false);
        }
      });
    }
  }
}
