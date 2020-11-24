import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { PROPCO } from './../../../shared/constants';

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
  faultMaintenanceDetails;
  contractors: Observable<FaultModels.IContractorResponse>;
  private subject: Subject<string> = new Subject();
  resultsAvailable = false;
  contractorList: any;
  lookupdata: any;
  contractorSkill: any;
  faultCategories: any;
  categoryMap = new Map();

  constructor(private fb: FormBuilder, private faultService: FaultsService, private commonService: CommonService,

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
      quotationNum: ['', Validators.required],
      category: [{ value: this.categoryMap.get(this.faultDetails.category), disabled: true }, Validators.required],
      status: ['', Validators.required],
      descption: ['', Validators.required],
      orderedBy: [{ value: '', disabled: true }, Validators.required],
      requiredBy: '',
      contactOnSite: '',
      accessDetails: [{ value: '', disabled: true }],
      // nominalCode: ['', Validators.required],
      contractorForm:
        this.fb.group({
          contractor: ['', Validators.required],
          skillSet: '',
          contractorObj: ''
        }),
      contractorList: this.fb.array([this.createContractorsList()]),
    });

    this.contractors = this.raiseQuoteForm.get('contractorForm.contractor').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.faultService.searchContractor(value) :
        new Observable())
    );
  }

  createContractorsList(): FormGroup {
    let val = this.raiseQuoteForm?.get('contractorForm').value;
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
    this.faultMaintenanceDetails = await this.getFaultMaintenance();
    this.initPatching();
  }

  private getFaultMaintenance() {
    const promise = new Promise((resolve, reject) => { });
    return promise;
  }

  initPatching(): void {
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
    this.raiseQuoteForm.get('contractorForm').patchValue({ contractor: selected ? selected.fullName + ',' + ' ' + selected.reference : undefined, contractorObj: selected ? selected : undefined });
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
}
