import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { PROPCO, FAULT_STAGES, ARRANING_CONTRACTOR_ACTIONS, ACCESS_INFO_TYPES } from './../../../shared/constants';

@Component({
  selector: 'app-arranging-contractor',
  templateUrl: './arranging-contractor.component.html',
  styleUrls: ['./arranging-contractor.component.scss', '../details.page.scss'],
})
export class ArrangingContractorComponent implements OnInit {
  raiseQuoteForm: FormGroup;
  addContractorForm: FormGroup;
  contractorListForm: FormGroup;
  userSelectedActionControl = new FormControl();
  @Input() quoteId;
  @Input() faultDetails: FaultModels.IFaultResponse;
  @Output() public btnAction: EventEmitter<any> = new EventEmitter();
  @Input() leadTenantId: any;
  faultMaintenanceDetails: FaultModels.IMaintenanceQuoteResponse;
  contractors: Observable<FaultModels.IContractorResponse>;
  private subject: Subject<string> = new Subject();
  resultsAvailable = false;
  contractorList: any;
  lookupdata: any;
  contractorSkill: any;
  faultCategories: any;
  categoryMap = new Map();
  @Input() propertyLandlords;
  isSelected = false;
  contratctorArr: string[] = [];
  isContratorSelected = false;
  iacNotification;
  iacStageActions = ARRANING_CONTRACTOR_ACTIONS.filter(action => { return action.index !== 'PROPERTY_VISIT_FOR_QUOTE' });
  accessInfoList = ACCESS_INFO_TYPES;
  isMaintenanceDetails = false;

  constructor(
    private fb: FormBuilder,
    private faultService: FaultsService,
    private commonService: CommonService

  ) { }

  ngOnInit() {
    this.initiateArrangingContractors();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.leadTenantId && changes.leadTenantId.currentValue) {
      this.checkMaintenanceDetail();
    }
  }

  private initiateArrangingContractors(): void {
    this.getLookupData();
    this.initForms();
    this.initApiCalls();
  }

  private initForms(): void {
    this.initQuoteForm();
    this.initAddContractorForm();
    // this.initContractorListForm();
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
      contact: '',
      accessDetails: [{ value: (this.faultDetails.isTenantPresenceRequired), disabled: true }],
      // contractorForm:
      // this.fb.group({
      //   contractor: '',
      //   skillSet: '',
      //   contractorObj: ''
      // }),
      contractorList: this.fb.array([]),
      contractorIds: [],
      selectedContractorId: ''
    });
  }

  async addContractor(data, isPatching, isPreferred) {
    if (this.contratctorArr.includes(data?.contractorObj?.entityId)) {
      this.isContratorSelected = true;
      return;
    }
    if (data?.contractorObj?.entityId) {
      let contarctorDetails = await this.getContractorDetails(data?.contractorObj?.entityId);
    } else {
      this.patchContartorList(data, isPatching, isPreferred);
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
      contractor: '',
      skillSet: '',
      contractorObj: ''
    });

    this.contractors = this.addContractorForm.get('contractor').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.faultService.searchContractor(value) :
        new Observable())
    );
  }

  private initContractorListForm(): void {
    // this.addContractorForm = this.fb.group({
    // });
  }

  private async initApiCalls() {
    this.faultMaintenanceDetails = await this.getFaultMaintenance() as FaultModels.IMaintenanceQuoteResponse;
    if (this.faultMaintenanceDetails) {
      this.initPatching();
      let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
      this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
    } else {
      this.propertyLandlords.map((x) => { this.getPreferredSuppliers(x.landlordId) });
      this.checkMaintenanceDetail();
      let userDetails: any = await this.getUserDetails();
      if (userDetails) {
        this.raiseQuoteForm.get('orderedBy').setValue(userDetails.name);
      }
    }
  }

  private getFaultMaintenance() {
    const promise = new Promise((resolve, reject) => {
      this.faultService.getQuoteDetails(this.faultDetails.faultId).subscribe((res) => {
        this.isMaintenanceDetails = true;
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
        selectedContractorId: this.faultMaintenanceDetails.selectedContractorId,
        contact: this.faultMaintenanceDetails.contact
      }
    );
    this.faultMaintenanceDetails.quoteContractors.map((x) => { this.addContractor(x, true, false) });
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
    console.log("selected", selected);

    this.addContractorForm.patchValue({ contractor: selected ? selected.fullName : undefined, contractorObj: selected ? selected : undefined });
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
    });
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
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
        const faultUpdated = await this.updateFault();
        if (faultUpdated) {
          this._btnHandler('cancel');
        }
      }
    } else {
      /*update a quote*/
      const quoteUpdated = await this.updateQuote();
      if (quoteUpdated) {
        const addContractors = await this.addContractors();
        if (addContractors) {
          const faultContUpdated = await this.updateFaultQuoteContractor();
          if (faultContUpdated) {
            const faultUpdated = await this.updateFault();
            if (faultUpdated) {
              this._btnHandler('cancel');
            }
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
      this.commonService.showMessage('Atleast one contractor is required for raising quote.', 'Raise a Quote', 'error');
      return;
    }
    if (!this.raiseQuoteForm.get('selectedContractorId').value) {
      this.commonService.showMessage('Select atleast one contractor for raising quote.', 'Raise a Quote', 'error');
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
      this.commonService.showMessage('Atleast one contractor is required for raising quote.', 'Update a Quote', 'error');
      return false;
    }
    if (!this.raiseQuoteForm.get('selectedContractorId').value) {
      this.commonService.showMessage('Select atleast one contractor for raising quote.', 'Update a Quote', 'error');
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
    const quoteReqObj = JSON.parse(JSON.stringify(this.raiseQuoteForm.getRawValue()));
    quoteReqObj.requiredStartDate = this.commonService.getFormatedDate(new Date(quoteReqObj.requiredStartDate));
    quoteReqObj.descption = quoteReqObj.description;

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
    const proceed = await this.commonService.showConfirm('Raise a quote', 'Are you sure you want to send a quote request to the selected contractor(s) ?');
    if (proceed) {
      if (!this.faultMaintenanceDetails) {
        /*raise a quote*/
        const quoteRaised = await this.raiseQuote();
        if (quoteRaised) {
          const faultUpdated = await this.updateFault(true);
          if (faultUpdated) {
            this.commonService.showLoader();
            setTimeout(async () => {
              let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
              this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
            }, 3000);
          }
        }
      } else {
        /*update a quote*/
        const quoteUpdated = await this.updateQuote();
        if (quoteUpdated) {
          const faultContUpdated = await this.updateFaultQuoteContractor();
          if (faultContUpdated) {
            const faultUpdated = await this.updateFault(true);
            if (faultUpdated) {
              this.commonService.showLoader();
              setTimeout(async () => {
                let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
                this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
              }, 3000);
            }
          }
        }
      }
    }
  }

  addContractors() {
    const promise = new Promise((resolve, reject) => {
      let contractIds = [];
      this.raiseQuoteForm.get('contractorList').value.forEach(info => {
        if (info.isNew === true) {
          contractIds.push(info.contractorId);
        }
      });
      if (contractIds.length) {
        this.faultService.addContractors(this.faultMaintenanceDetails.maintenanceId, { contractorIds: contractIds }).subscribe(
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
          resolve(false);
        }
      );
    });
    return promise;
  }

  private getUserDetails() {
    return new Promise((resolve, reject) => {
      this.faultService.getUserDetails().subscribe((res) => {
        let data = res ? res.data[0] : '';
        resolve(data);
      }, error => {
        reject(error)
      });
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

  private getPreferredSuppliers(landlordId) {
    const promise = new Promise((resolve, reject) => {
      this.faultService.getPreferredSuppliers(landlordId).subscribe(
        res => {
          res && res.data ? res.data.map((x) => { this.addContractor(x, true, true) }) : [];
          resolve(true);
        },
        error => {
          reject(false);
        }
      );
    });
    return promise;
  }

  async checkFaultNotifications(faultId) {
    return new Promise((resolve, reject) => {
      this.faultService.getFaultNotifications(faultId).subscribe(async (response) => {
        let notifications = response && response.data ? response.data : [];
        resolve(notifications);
      }, error => {
        reject(error)
      });
    });
  }

  private filterNotifications(data, stage, action) {
    const promise = new Promise((resolve, reject) => {
      let filtereData = null;
      if (data.length === 0) {
        resolve(null);
      }
      filtereData = data.filter((x => x.faultStage === stage)).filter((x => x.faultStageAction === action));
      if (filtereData.length === 0) {
        resolve(null);
      }
      filtereData = filtereData.sort((a, b) => {
        return <any>new Date(b.firstEmailSentAt) - <any>new Date(a.firstEmailSentAt);
      });
      resolve(filtereData[0]);
    });
    return promise;
  }

  setUserAction(index) {
    // if (this.iacNotification && !this.iacNotification.responseReceived) {
    //   this.commonService.showAlert('Arrangig Contractor', 'Please select response before proceeding with other action.');
    //   return;
    // }
    this.userSelectedActionControl.setValue(index);

  }

  private getTenantDetail(tenantId) {
    if (tenantId) {
      this.faultService.getTenantDetails(tenantId).subscribe((res) => {
        const data = res ? res : '';
        if (data) {
          this.raiseQuoteForm.get('contact').setValue(data.fullName + ' ' + data.mobile);
        }
      }, error => {
      });
    }
  }

  private checkMaintenanceDetail() {
    if (this.isMaintenanceDetails && !this.faultMaintenanceDetails) {
      if (this.leadTenantId) {
        this.getTenantDetail(this.leadTenantId)
      }
    }
  }

  questionAction(data) {

  }

  getContractorDetails(contractId) {
    this.faultService.getContractorDetails(contractId).subscribe((res) => {
      let data = res ? res : '';
      this.patchContartorList(data, false, false);

    }, error => {
    });
  }
  patchContartorList(data, isPatching, isPreferred) {
    const contractorList = this.raiseQuoteForm.get('contractorList') as FormArray;

    let grup = {
      reference: [{ value: data.skills ? data.skills.toString() : '', disabled: true }],
      name: '',
      company: [{ value: data.company ? data.company : data.companyName, disabled: true }],
      email: '',
      mobile: [{ value: data.businessTelephone ? data.businessTelephone : '', disabled: true }],
      address: '',
      contractorId: data.contractorId ? data.contractorId : data.contractorObj.entityId,
      select: '',
      isPreferred: isPreferred,
      isNew: !isPatching,
      checked: !isPatching ? false : (data.contractorId == this.raiseQuoteForm.get('selectedContractorId').value ? true : false)
    }
    contractorList.push(this.fb.group(grup));
    this.contratctorArr.push(data.contractorId ? data.contractorId : data.contractorObj.entityId);

    if (!isPatching) {
      this.addContractorForm.reset();
      this.isSelected = false;
    }
  }

}