import { WorksorderModalPage } from 'src/app/shared/modals/worksorder-modal/worksorder-modal.page';
import { HttpParams } from '@angular/common/http';
import { RejectionModalPage } from './../../../shared/modals/rejection-modal/rejection-modal.page';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, delay, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { PROPCO, FAULT_STAGES, ARRANING_CONTRACTOR_ACTIONS, ACCESS_INFO_TYPES, SYSTEM_CONFIG, MAINTENANCE_TYPES, LL_INSTRUCTION_TYPES, ERROR_CODE } from './../../../shared/constants';
import { AppointmentModalPage } from 'src/app/shared/modals/appointment-modal/appointment-modal.page';
import { ModalController } from '@ionic/angular';
import { QuoteModalPage } from 'src/app/shared/modals/quote-modal/quote-modal.page';
import { IonicSelectableComponent } from 'ionic-selectable';
import { DatePipe } from '@angular/common';
import { PaymentReceivedModalComponent } from 'src/app/shared/modals/payment-received-modal/payment-received-modal.component';
import { WithoutPrepaymentModalComponent } from 'src/app/shared/modals/without-prepayment-modal/without-prepayment-modal.component';
import { PendingNotificationModalPage } from 'src/app/shared/modals/pending-notification-modal/pending-notification-modal.page';

@Component({
  selector: 'app-arranging-contractor',
  templateUrl: './arranging-contractor.component.html',
  styleUrls: ['./arranging-contractor.component.scss', '../details.page.scss'],
})
export class ArrangingContractorComponent implements OnInit {
  raiseQuoteForm: FormGroup;
  workOrderForm: FormGroup;
  addContractorForm: FormGroup;
  contractorListForm: FormGroup;
  userSelectedActionControl = new FormControl();
  @Input() quoteId;
  @Input() faultDetails: FaultModels.IFaultResponse;
  @Output() public btnAction: EventEmitter<any> = new EventEmitter();
  @Input() leadTenantId: any;
  @Input() quoteDocuments: any;
  @Input() propertyDetails;
  @Input() propertyLandlords;
  @Input() categoryName;
  faultMaintenanceDetails: FaultModels.IMaintenanceQuoteResponse;
  contractors: Observable<FaultModels.IContractorResponse>;
  resultsAvailable = false;
  contractorList: any;
  lookupdata: any;
  contractorSkill: any;
  faultCategories: any;
  categoryMap = new Map();
  isSelected = false;
  contratctorArr: string[] = [];
  isContratorSelected = false;
  iacNotification;
  iacStageActions = LL_INSTRUCTION_TYPES;
  otherStageActions = LL_INSTRUCTION_TYPES.filter(action => { return (action.index == 'OBTAIN_QUOTE' || action.index == 'PROCEED_WITH_WORKSORDER') });

  accessInfoList = ACCESS_INFO_TYPES;
  isMaintenanceDetails = false;
  nominalCodes;
  quoteStatuses;
  rejectionReason: string = null;
  restrictAction: boolean = false;
  private MAX_QUOTE_REJECTION = 2;
  private disableAnotherQuote: boolean = false;
  isUserActionChange: boolean = false;
  faultMaintRejectionReasons: any;
  woResultsAvailable = false;
  woContractors: Observable<FaultModels.IContractorResponse>;
  nominalCodeSubscription: Subscription;
  page = 2;
  codes: FaultModels.NominalCode[];
  currentDate = this.commonService.getFormatedDate(new Date());
  isWorksOrder: boolean = false;
  isFormsReady: boolean = false;
  pendingNotification: any;

  constructor(
    private fb: FormBuilder,
    private faultsService: FaultsService,
    private commonService: CommonService,
    private modalController: ModalController,
    public datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.initiateArrangingContractors();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.leadTenantId && changes.leadTenantId.currentValue) {
      this.checkMaintenanceDetail();
    }
    if (changes.faultDetails && !changes.faultDetails.firstChange) {
      this.initiateArrangingContractors();
    }
  }

  private async initiateArrangingContractors() {
    this.faultMaintenanceDetails = await this.getFaultMaintenance() as FaultModels.IMaintenanceQuoteResponse;
    if (this.faultDetails.status === 19 || (this.faultMaintenanceDetails && this.faultMaintenanceDetails.itemType === MAINTENANCE_TYPES.WORKS_ORDER)) {
      /*19: Worksorder Pending*/
      this.isWorksOrder = true;
    }
    this.getLookupData();
    this.initForms();
    this.initApiCalls();
  }

  private initForms(): void {
    if (!this.isWorksOrder) {
      this.initQuoteForm();
      this.initAddContractorForm();
    } else {
      this.initWorkOrderForms();
    }
    this.isFormsReady = true;
  }

  private initQuoteForm(): void {
    this.raiseQuoteForm = this.fb.group({
      worksOrderNumber: [this.faultDetails.reference, Validators.required],
      paidBy: ['LANDLORD', Validators.required],
      propertyId: [this.faultDetails.propertyId, Validators.required],
      quoteCategory: [{ value: this.categoryMap.get(this.faultDetails.category), disabled: true }],
      description: [this.faultDetails.notes, Validators.required],
      orderedBy: [{ value: '', disabled: true }, Validators.required],
      requestStartDate: ['', Validators.required],
      contact: '',
      accessDetails: [{ value: this.getAccessDetails(this.faultDetails.isTenantPresenceRequired), disabled: true }],
      contractorList: this.fb.array([]),
      contractorIds: [],
      selectedContractorId: '',
      quoteStatus: [{ value: 1, disabled: true }],
      nominalCode: ['', Validators.required]
    });
  }

  private initWorkOrderForms(): void {
    this.workOrderForm = this.fb.group({
      propertyId: [this.faultDetails.propertyId, Validators.required],
      contractorId: ['', Validators.required],
      contractorName: ['', Validators.required],
      company: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
      repairCost: [this.faultDetails.confirmedEstimate, Validators.required],
      worksOrderNumber: [{ value: this.faultDetails.reference, disabled: true }],
      postdate: [{ value: this.currentDate, disabled: true }],
      nominalCode: ['', Validators.required],
      description: [this.categoryName + " " + this.faultDetails.title, Validators.required],
      paidBy: [{ value: 'LANDLORD', disabled: true }, Validators.required],
      mgntHoldKey: [{ value: 'No', disabled: true }],
      keysLocation: this.faultDetails.doesBranchHoldKeys ? 'Return to Branch' : '',
      accessDetails: [this.getAccessDetails(this.faultDetails.isTenantPresenceRequired), Validators.required],
      requiredDate: '',
      fullDescription: [this.faultDetails.notes, Validators.required],
      orderedBy: { value: '', disabled: true },
      agentReference: [{ value: '', disabled: true }],
      defaultCommissionPercentage: [{ value: '', disabled: true }],
      defaultCommissionAmount: [{ value: '', disabled: true }],
      businessTelephone: [{ value: '', disabled: true }]
    });
    if (this.faultDetails.doesBranchHoldKeys) {
      this.officeDetails();
    }
    if (!this.faultMaintenanceDetails && this.faultDetails.contractorId) {
      this.woSelectContractor(this.faultDetails.contractorId);
    }
    this.woContractors = this.workOrderForm.get('contractorName').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.faultsService.searchContractor(value) :
        new Observable())
    );
  }

  private getAccessDetails(tenantPresence): string {
    if (tenantPresence != null) {
      let data = this.accessInfoList.filter(data => data.value == tenantPresence);
      return data && data[0] ? data[0].title : '';
    }
  }

  async addContractor(data, isNew = true, isPreferred = false) {
    if (this.contratctorArr.includes(data?.contractorObj?.entityId)) {
      this.isContratorSelected = true;
      return;
    }
    if (isNew) {
      this.getContractorDetails(data?.contractorObj?.entityId, 'quote');
    } else {
      this.patchContartorList(data, isNew, isPreferred);
    }
  }

  async removeContractor(i: any, isRejected: boolean) {
    if (this.restrictAction) { return; }
    if (isRejected) {
      this.commonService.showAlert('Delete Contractor', 'Deleting the rejected contractor is restricted.');
      return;
    }
    const contractorList = this.raiseQuoteForm.get('contractorList') as FormArray;
    const deleteContractor = await this.commonService.showConfirm('Delete Contrator', 'Do you want to delete contractor from the list?');
    if (deleteContractor) {
      const deleteConId = contractorList.at(i).get('contractorId').value;
      const index = this.contratctorArr.indexOf(deleteConId);

      if (!this.faultMaintenanceDetails) {
        this.resetSelectedContractor(deleteConId);
        contractorList.removeAt(i);
        this.contratctorArr.splice(index, 1);
        return;
      }
      const isDeleted = await this.deleteContrator(this.faultMaintenanceDetails.maintenanceId,
        deleteConId);
      if (isDeleted) {
        this.resetSelectedContractor(deleteConId);
        contractorList.removeAt(i);
        this.contratctorArr.splice(index, 1);
      }
    }
  }

  private resetSelectedContractor(deleteConId): void {
    if (deleteConId === this.raiseQuoteForm.get('selectedContractorId').value) {
      this.raiseQuoteForm.get('selectedContractorId').setValue('');
    }
  }

  private initAddContractorForm(): void {
    this.addContractorForm = this.fb.group({
      contractor: '',
      skillSet: '',
      contractorObj: ''
    });

    this.contractors = this.addContractorForm.get('contractor').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.faultsService.searchContractor(value) :
        new Observable())
    );
  }

  private async initApiCalls() {
    if (this.faultMaintenanceDetails) {
      if (!this.isWorksOrder) {
        await this.getMaxQuoteRejection();
      }
      this.initPatching();
      await this.faultNotification(this.faultDetails.stageAction);
    } else {
      if (!this.isWorksOrder) {
        this.propertyLandlords.map((x) => { this.getPreferredSuppliers(x.landlordId) });
        this.checkMaintenanceDetail();
      }
      let userDetails: any = await this.getUserDetails();
      if (userDetails) {
        this.isWorksOrder ? this.workOrderForm.get('orderedBy').setValue(userDetails.name) : this.raiseQuoteForm.get('orderedBy').setValue(userDetails.name);
      }
    }
  }

  private getFaultMaintenance() {
    const promise = new Promise((resolve, reject) => {
      const params: any = new HttpParams().set('showCancelled', 'false');
      this.faultsService.getQuoteDetails(this.faultDetails.faultId, params).subscribe((res) => {
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
    if (!this.isWorksOrder) {
      this.raiseQuoteForm.patchValue(
        {
          worksOrderNumber: this.faultMaintenanceDetails.worksOrderNumber,
          description: this.faultMaintenanceDetails.description,
          orderedBy: this.faultMaintenanceDetails.orderedBy,
          requestStartDate: this.faultMaintenanceDetails.requiredStartDate,
          accessDetails: this.faultMaintenanceDetails.accessDetails,
          selectedContractorId: this.faultMaintenanceDetails.selectedContractorId,
          contact: this.faultMaintenanceDetails.contact,
          quoteStatus: this.faultMaintenanceDetails.quoteStatus,
        }
      );
      this.faultMaintenanceDetails.quoteContractors.map((x) => { this.addContractor(x, false, false) });
    } else {
      this.workOrderForm.patchValue(
        {
          worksOrderNumber: this.faultMaintenanceDetails.worksOrderNumber,
          description: this.faultMaintenanceDetails.description,
          orderedBy: this.faultMaintenanceDetails.orderedBy,
          postdate: this.faultMaintenanceDetails.postdate,
          accessDetails: this.faultMaintenanceDetails.accessDetails,
          contractorId: this.faultMaintenanceDetails.selectedContractorId,
          nominalCode: this.faultMaintenanceDetails.nominalCode,
          fullDescription: this.faultMaintenanceDetails.fullDescription,
          repairCost: this.faultMaintenanceDetails.amount,
          keysLocation: this.faultMaintenanceDetails.keysLocation,
          requiredDate: this.faultMaintenanceDetails.requiredCompletionDate
        }
      );
      this.workOrderForm.get('contractorName').disable();
      this.woSelectContractor(this.faultMaintenanceDetails.selectedContractorId);
    }
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
    let faultsLookupData = this.commonService.getItem(PROPCO.FAULTS_LOOKUP_DATA, true);
    if (faultsLookupData) {
      this.setFaultsLookupData(faultsLookupData);
    }
    else {
      this.commonService.getFaultsLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.FAULTS_LOOKUP_DATA, data);
        this.setFaultsLookupData(data);
      });
    }
    this.faultsService.getNominalCodes().subscribe(data => {
      this.nominalCodes = data ? data : [];
      this.codes = this.getCodes();

    });
  }

  private setLookupData(data) {
    this.contractorSkill = data.contractorSkills;
    this.quoteStatuses = data.maintenanceQuoteStatuses;
  }

  private setFaultsLookupData(data) {
    this.faultCategories = data.faultCategories;
    this.faultMaintRejectionReasons = data.faultMaintRejectionReasons;
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
    if (this.iacNotification && (this.iacNotification.responseReceived == null || this.iacNotification.responseReceived?.isAccepted == null) && !this.isUserActionChange) {
      this._btnHandler('saveLater');
      return;
    }
    if (this.iacNotification && this.iacNotification.responseReceived == null && this.isUserActionChange) {
      this.voidNotification('saveForLater');
    }
    else {
      if (!this.isWorksOrder) {
        if (this.validateReq()) {
          return;
        }
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
      } else {
        // if (this.validateReq()) {
        //   return;
        // }
        if (!this.faultMaintenanceDetails) {
          /*raise a worksorder*/
          if (!this.workOrderForm.get('contractorId').value) { this.commonService.showMessage('Please select a contractor.', 'Works Order', 'error'); return; }
          const woRaised = await this.raiseWorksOrder();
          if (woRaised) { this._btnHandler('cancel'); }
        } else {
          /*update a worksorder*/
          const woUpdated = await this.updateWorksOrder();
          if (woUpdated) { this._btnHandler('cancel'); }
        }
      }
    }
  }

  private raiseQuote() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.raiseQuote(this.prepareQuoteData(), this.faultDetails.faultId).subscribe((res) => {
        resolve(res);
        this.commonService.showMessage('Successfully Raised', 'Quote', 'success');
      }, error => {
        resolve(false);
        this.commonService.showMessage('Something went wrong', 'Quote', 'error');
      });
    });
    return promise;
  }

  private updateQuote() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateQuoteDetails(
        this.prepareQuoteData(), this.faultMaintenanceDetails.maintenanceId).subscribe((res) => {
          resolve(true);
          this.commonService.showMessage('Successfully Updated', 'Quote', 'success');
        }, error => {
          resolve(false);
          this.commonService.showMessage('Something went wrong', 'Quote', 'error');
        });
    });
    return promise;
  }

  private raiseWorksOrder(isDraft: boolean = true) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.createFaultMaintenaceWorksOrder(this.prepareWorksOrderData(isDraft), this.faultDetails.faultId).subscribe((res) => {
        resolve(res);
        this.commonService.showMessage('Successfully Raised', 'Works Order', 'success');
      }, error => {
        resolve(false);
        this.commonService.showMessage('Something went wrong', 'Works Order', 'error');
      });
    });
    return promise;
  }

  private updateWorksOrder() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateQuoteDetails(
        this.prepareWorksOrderData(), this.faultMaintenanceDetails.maintenanceId).subscribe((res) => {
          resolve(true);
          this.commonService.showMessage('Successfully Updated', 'Works Order', 'success');
        }, error => {
          resolve(false);
          this.commonService.showMessage('Something went wrong', 'Works Order', 'error');
        });
    });
    return promise;
  }

  private validateReq() {
    let invalid = true;
    if (!this.isWorksOrder) {
      if (!this.raiseQuoteForm.valid) {
        this.commonService.showMessage('Please fill all required fields.', 'Quote', 'error');
        this.raiseQuoteForm.markAllAsTouched();
        return invalid;
      }
      if (this.raiseQuoteForm.value.contractorList.length == 0) {
        this.commonService.showMessage('Atleast one contractor is required for raising quote.', 'Quote', 'error');
        return invalid;
      }
      if (!this.raiseQuoteForm.get('selectedContractorId').value) {
        this.commonService.showMessage('Select atleast one contractor for raising quote.', 'Quote', 'error');
        return invalid;
      }
    } else {
      if (!this.workOrderForm.valid) {
        this.commonService.showMessage('Please fill all required fields.', 'Works Order', 'error');
        this.workOrderForm.markAllAsTouched();
        return invalid;
      }
    }
    return invalid = false;
  }

  private updateFaultQuoteContractor() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFaultQuoteContractor(
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
      this.faultsService.updateFault(
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
    const quoteReqObj: any = JSON.parse(JSON.stringify(this.raiseQuoteForm.getRawValue()));
    quoteReqObj.descption = quoteReqObj.description;
    quoteReqObj.nominalCode = typeof quoteReqObj.nominalCode === 'object' ? quoteReqObj.nominalCode.nominalCode : quoteReqObj.nominalCode;
    delete quoteReqObj.contractorForm;
    if (!this.faultMaintenanceDetails) {
      quoteReqObj.contractorIds = quoteReqObj.contractorList.map(x => x.contractorId).filter(x => x);
      quoteReqObj.requestStartDate = this.commonService.getFormatedDate(new Date(quoteReqObj.requestStartDate));
    } else {
      quoteReqObj.requiredStartDate = this.commonService.getFormatedDate(new Date(quoteReqObj.requestStartDate));
      delete quoteReqObj.contractorIds;
    }
    delete quoteReqObj.contractorList;

    return quoteReqObj;
  }

  private prepareWorksOrderData(isDraft: boolean = true) {
    const quoteReqObj: any = JSON.parse(JSON.stringify(this.workOrderForm.getRawValue()));
    delete quoteReqObj.postdate;
    quoteReqObj.nominalCode = typeof quoteReqObj.nominalCode === 'object' ? quoteReqObj.nominalCode.nominalCode : quoteReqObj.nominalCode;
    if (!this.faultMaintenanceDetails) {
      quoteReqObj.isDraft = isDraft;
      quoteReqObj.requiredDate = quoteReqObj.requiredDate ? this.commonService.getFormatedDate(new Date(quoteReqObj.requiredDate)) : null;
    } else {
      quoteReqObj.requiredCompletionDate = quoteReqObj.requiredDate ? this.commonService.getFormatedDate(new Date(quoteReqObj.requiredDate)) : null;
    }
    return quoteReqObj;
  }

  private prepareFaultData(isSubmit: boolean) {
    const faultReqObj: any = {};
    faultReqObj.isDraft = isSubmit ? false : true;
    faultReqObj.stage = this.faultDetails.stage;
    return faultReqObj;
  }

  private async proceed() {
    if (this.iacNotification) {
      if (!this.isUserActionChange) {
        this.commonService.showAlert('Warning', 'Please choose one option to proceed.');
        return;
      }
      if (this.iacNotification.responseReceived == null || this.iacNotification.responseReceived.isAccepted == null) {
        if (this.isUserActionChange) {
          this.voidNotification(null);
        }
      }
      if (!this.iacNotification.responseReceived.isAccepted) {
        if (this.isUserActionChange) {
          let faultRequestObj: any = {};
          faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
          const isFaultUpdated = await this.updateFaultSummary(faultRequestObj);
          if (isFaultUpdated) {
            this._btnHandler('refresh');
          }
        }
      }
    }
    else {
      if (!this.isWorksOrder) {
        if (this.validateReq()) {
          return;
        }
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
                  // await this.faultNotification('OBTAIN_QUOTE');
                  this.initiateArrangingContractors();
                }, 1000);
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
                  const faultUpdated = await this.updateFault(true);
                  this.faultDetails = await this.getFaultDetails(this.faultDetails.faultId);
                  if (faultUpdated) {
                    this.commonService.showLoader();
                    setTimeout(async () => {
                      // await this.faultNotification('OBTAIN_QUOTE');
                      this.initiateArrangingContractors();
                    }, 1000);
                  }
                }
              }
            }
          }
        }
      } else {
        if (this.validateReq()) {
          return;
        }
        /*raise a worksorder & check paymentRules*/
        const rules = await this.getWorksOrderPaymentRules('manual') as FaultModels.IFaultWorksorderRules as any;
        if (!rules) { return; }
        if (rules === 'saveWorksorder') {
          this.saveForLater();
        } else {
          const paymentRequired = await this.checkForPaymentRules(rules);
          const submit = await this.raiseWorksOrderAndNotification(paymentRequired, 'manual');
          if (submit) {
            this._btnHandler('refresh');
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
        this.faultsService.addContractors(this.faultMaintenanceDetails.maintenanceId, { contractorIds: contractIds }).subscribe(
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
      this.faultsService.deleteContractor(maintenanceId, contractorId).subscribe(
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
      this.faultsService.getUserDetails().subscribe((res) => {
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
      this.faultsService.getPreferredSuppliers(landlordId).subscribe(
        res => {
          res && res.data ? res.data.map((x) => { this.addContractor(x, false, true) }) : [];
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
      this.faultsService.getFaultNotifications(faultId).subscribe(async (response) => {
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
      // filtereData = data.filter((x => x.faultStage === stage)).filter((x => x.faultStageAction === action)).filter((x => x.isResponseExpected));
      filtereData = data.filter((x => x.faultStage === stage)).filter((x => x.isResponseExpected));
      if (filtereData.length === 0) {
        resolve(null);
      }
      filtereData = filtereData.sort((a, b) => {
        return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
      });
      if (filtereData && filtereData[0]) {
        if (!this.isWorksOrder) {
          this.disableQuoteDetail();
          this.disableContractorsList(filtereData[0]);
        } else {
          this.disableWorksOrderDetail();
        }
        resolve(filtereData[0]);
      } else {
        resolve(null);
      }
    });
    return promise;
  }

  private disableQuoteDetail() {
    this.raiseQuoteForm.get('worksOrderNumber').disable();
    this.raiseQuoteForm.get('description').disable();
    this.raiseQuoteForm.get('requestStartDate').disable();
    this.raiseQuoteForm.get('contact').disable();
    this.raiseQuoteForm.get('nominalCode').disable();
  }

  private disableWorksOrderDetail() {
    this.workOrderForm.get('worksOrderNumber').disable();
    this.workOrderForm.get('description').disable();
    this.workOrderForm.get('fullDescription').disable();
    this.workOrderForm.get('postdate').disable();
    this.workOrderForm.get('contractorName').disable();
    this.workOrderForm.get('nominalCode').disable();
    this.workOrderForm.get('repairCost').disable();
    this.workOrderForm.get('requiredDate').disable();
    this.workOrderForm.get('keysLocation').disable();
    this.workOrderForm.get('accessDetails').disable();
  }

  private disableContractorsList(notification) {
    if (notification.responseReceived != null && notification.responseReceived.isAccepted === false && notification.templateCode === 'LAR-L-E') {
      this.restrictAction = false;
      this.raiseQuoteForm.get('selectedContractorId').setValue('');
    } else {
      this.restrictAction = true;
    }
    if (this.faultMaintenanceDetails && this.faultMaintenanceDetails.quoteContractors) {
      const data = this.faultMaintenanceDetails.quoteContractors.filter(x => x.isRejected);
      if (data && data[0]) {
        this.rejectionReason = data[0].rejectionReason;
      }
      this.disableAnotherQuote = false;
      if ((data.length + 1) >= this.MAX_QUOTE_REJECTION) {
        this.disableAnotherQuote = true;
      }
    }
  }

  setUserAction(index) {
    this.isUserActionChange = true;
    // if (this.iacNotification && !this.iacNotification.responseReceived) {
    //   this.commonService.showAlert('Arrangig Contractor', 'Please select response before proceeding with other action.');
    //   return;
    // }
    this.userSelectedActionControl.setValue(index);
  }

  private getTenantDetail(tenantId) {
    if (tenantId) {
      this.faultsService.getTenantDetails(tenantId).subscribe((res) => {
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

  async questionAction(data) {
    if (this.iacNotification && this.iacNotification.responseReceived != null) {
      return;
    }

    // if (this.iacNotification.faultStageAction === ARRANING_CONTRACTOR_ACTIONS[1].index || this.iacNotification.faultStageAction === ARRANING_CONTRACTOR_ACTIONS[3].index) {
    if (this.faultMaintenanceDetails.itemType === MAINTENANCE_TYPES.QUOTE) {
      if (this.iacNotification.templateCode === 'CQ-NA-C-E' || this.iacNotification.templateCode === 'CQ-A-C-E') {
        this.questionActionAcceptRequest(data);
      } else if (this.iacNotification.templateCode === 'CDT-C-E' || this.iacNotification.templateCode === 'CDT-T-E') {
        this.questionActionVisitTime(data);
      } else if (this.iacNotification.templateCode === 'CQ-C-E') {
        this.questionActionQuoteUpload(data);
      } else if (this.iacNotification.templateCode === 'LAR-L-E') {
        this.questionActionLLAuth(data);
      }
    } else if (this.faultMaintenanceDetails.itemType === MAINTENANCE_TYPES.WORKS_ORDER) {
      if (this.iacNotification.templateCode === 'LNP-L-E') {
        this.questionActionWOPayment(data);
      } else if (this.iacNotification.templateCode === 'CWO-A-C-E' || this.iacNotification.templateCode === 'CWO-NA-C-E') {
        this.questionActionAcceptRequest(data);
      } else if (this.iacNotification.templateCode === 'CDT-C-E (WO)'
        || this.iacNotification.templateCode === 'CDT-T-E (WO)'
        || this.iacNotification.templateCode === 'CWO-NA-T-E-2') {
        this.worksOrderActionVisitTime(data);
      } else if (this.iacNotification.templateCode === 'CWO-C-E') {
        this.questionActionJobCompleted(data)
      }
    }
    // }
  }

  private questionActionAcceptRequest(data) {
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isAccepted = data.value;
    notificationObj.submittedByType = 'SECUR_USER';
    const titleText = this.isWorksOrder ? 'works order' : 'quote request';
    if (data.value) {
      this.commonService.showConfirm(data.text, `Are you sure, you want to accept the ${titleText}?`, '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
          this.commonService.showLoader();
          await this.faultNotification(this.isWorksOrder ? 'PROCEED_WITH_WORKSORDER' : 'OBTAIN_QUOTE');
        }
      });
    } else if (!data.value) {
      this.commonService.showConfirm(data.text, `Are you sure, you want to reject the ${titleText}?`, '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
          this.commonService.showLoader();
          this.faultDetails = await this.getFaultDetails(this.faultDetails.faultId);
          await this.faultNotification(this.isWorksOrder ? 'PROCEED_WITH_WORKSORDER' : 'OBTAIN_QUOTE');
        }
      });
    }
  }

  private async questionActionVisitTime(data) {
    if (!data.value) {
      this.commonService.showConfirm(data.text, 'Are you sure?', '', 'Yes', 'No').then(async res => {
        if (res) {
          let notificationObj = {} as FaultModels.IUpdateNotification;
          notificationObj.isAccepted = data.value;
          notificationObj.submittedByType = 'SECUR_USER';
          if (this.iacNotification.templateCode === 'CDT-T-E') {
            notificationObj.isEscalateFault = true;
          }
          await this.saveContractorVisitResponse(this.iacNotification.faultNotificationId, notificationObj);
          this._btnHandler('refresh');

        }
      });
    } else if (data.value) {
      const modal = await this.modalController.create({
        component: AppointmentModalPage,
        cssClass: 'modal-container',
        componentProps: {
          faultNotificationId: this.iacNotification.faultNotificationId,
          title: "Arranging Contractor",
          headingOne: "You have selected 'Yes, agreed Date/Time with Tenant.'",
          headingTwo: "Please input the appointment date and time that the Contractor has agreed with the occupants.",
          type: "quote"
        },
        backdropDismiss: false
      });

      modal.onDidDismiss().then(async res => {
        if (res.data && res.data == 'success') {
          await this.faultNotification('OBTAIN_QUOTE');
        }
      });

      await modal.present();

    }
  }

  private async questionActionQuoteUpload(data) {
    if (data.value) {
      const modal = await this.modalController.create({
        component: QuoteModalPage,
        cssClass: 'modal-container upload-container',
        componentProps: {
          faultNotificationId: this.iacNotification.faultNotificationId,
          faultId: this.faultDetails.faultId,
          maintenanceId: this.faultMaintenanceDetails.maintenanceId
        },
        backdropDismiss: false
      });

      modal.onDidDismiss().then(async res => {
        if (res.data && res.data == 'success') {
          this.faultDetails = await this.getFaultDetails(this.faultDetails.faultId);
          await this.faultNotification(this.faultDetails.stageAction);
        }
      });
      await modal.present();
    } else {
      this.commonService.showConfirm(data.text, `You have selected 'No, couldn't carry out the Quote'. The fault will be escalated tor manual intervention. Do you want to proceed?`, '', 'Yes', 'No').then(async res => {
        if (res) {
          const submit = await this.submitQuoteAmout();
          if (submit) {
            this.commonService.showLoader();
            await this.faultNotification('OBTAIN_QUOTE');
          }
        }
      });
    }
  }

  private async questionActionLLAuth(data) {
    if (!data.value) {
      const modal = await this.modalController.create({
        component: RejectionModalPage,
        cssClass: 'modal-container',
        componentProps: {
          faultNotificationId: this.iacNotification.faultNotificationId,
          faultMaintRejectionReasons: this.faultMaintRejectionReasons,
          disableAnotherQuote: this.disableAnotherQuote
        },
        backdropDismiss: false
      });

      modal.onDidDismiss().then(async res => {
        if (res.data && res.data == 'success') {
          this._btnHandler('refresh');
        }
      });
      await modal.present();
    } else {
      const rules = await this.getWorksOrderPaymentRules() as FaultModels.IFaultWorksorderRules;
      if (!rules) { return; }
      const paymentRequired = await this.checkForPaymentRules(rules);
      const submit = await this.raiseWorksOrderAndNotification(paymentRequired);
      if (submit) {
        this._btnHandler('refresh');
      }
    }
  }

  private async questionActionWOPayment(data) {
    if (data.value) {
      const modal = await this.modalController.create({
        component: PaymentReceivedModalComponent,
        cssClass: 'modal-container',
        componentProps: {
          faultNotificationId: this.iacNotification.faultNotificationId,
        },
        backdropDismiss: false
      });

      modal.onDidDismiss().then(async res => {
        if (res.data && res.data == 'success') {
          this.faultDetails = await this.getFaultDetails(this.faultDetails.faultId);
          this.initiateArrangingContractors();
        }
      });
      await modal.present();
    } else if (!data.value) {
      const rules = await this.getWorksOrderPaymentRules() as FaultModels.IFaultWorksorderRules;
      if (!rules) {
        return null;
      }
      const modal = await this.modalController.create({
        component: WithoutPrepaymentModalComponent,
        cssClass: 'modal-container',
        componentProps: {
          faultNotificationId: this.iacNotification.faultNotificationId,
          paymentRules: rules
        },
        backdropDismiss: false
      });

      modal.onDidDismiss().then(async res => {
        if (res.data && res.data == 'success') {
          this.faultDetails = await this.getFaultDetails(this.faultDetails.faultId);
          this.initiateArrangingContractors();
        }
      });
      await modal.present();
    }
  }
  private async questionActionJobCompleted(data) {
    if (data.value) {
      this.openWOJobCompletionModal();
    } else {
      this.commonService.showConfirm(data.text, `You have selected 'No, Couldn't Complete the Job'. The fault will be escalated for manual intervention. Do you want to proceed?`, '', 'YES', 'NO').then(async res => {
        if (res) {
          const submit = await this.submitJobCompletion();
          if (submit) {
            this.btnAction.emit('refresh');
          }
        }
      });
    }
  }

  async openWOJobCompletionModal() {
    const modal = await this.modalController.create({
      component: WorksorderModalPage,
      cssClass: 'modal-container upload-container',
      componentProps: {
        faultNotificationId: this.iacNotification.faultNotificationId,
        faultId: this.faultDetails.faultId,
        maintenanceId: this.faultMaintenanceDetails.maintenanceId,
        actionType: this.enableMarkCompletedBtn() ? 'advance' : 'regular'
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this.btnAction.emit('refresh');
      }
    });
    await modal.present();
  }

  async submitQuoteAmout() {
    let notificationObj = {} as any;
    notificationObj.isAccepted = false;
    notificationObj.submittedByType = 'SECUR_USER';
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveNotificationQuoteAmount(notificationObj, this.iacNotification.faultNotificationId).subscribe(
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

  saveFaultLLAuth() {
    const requestObj: any = {};
    requestObj.rejectionReason = '';
    requestObj.isAccepted = true;
    requestObj.submittedByType = 'SECUR_USER';
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveFaultLLAuth(requestObj, this.iacNotification.faultNotificationId).subscribe(res => {
        resolve(true);
      }, error => {
        this.commonService.showMessage('No Authorisation', 'Something went wrong', 'error');
        resolve(false);
      })
    });
    return promise;
  }

  private getContractorDetails(contractId, type) {
    return new Promise((resolve, reject) => {
      this.faultsService.getContractorDetails(contractId).subscribe((res) => {
        let data = res ? res : '';
        if (type === 'quote') {
          this.patchContartorList(data, true, false);
        } else if (type === 'wo') {
          const addressArray = new Array();
          if (data && data.address) {
            if (data.address.addressLine1 != null && data.address.addressLine1 != '') { addressArray.push(data.address.addressLine1) }
            if (data.address.addressLine2 != null && data.address.addressLine2 != '') { addressArray.push(data.address.addressLine2) }
            if (data.address.addressLine3 != null && data.address.addressLine3 != '') { addressArray.push(data.address.addressLine3) }
            if (data.address.town != null && data.address.town != '') { addressArray.push(data.address.town) }
            if (data.address.postcode != null && data.address.postcode != '') { addressArray.push(data.address.postcode) }
          }
          const addressString = addressArray.length ? addressArray.join(', ') : '';
          this.workOrderForm.patchValue({
            company: data ? data.companyName : undefined, agentReference: data ? data.agentReference : undefined,
            defaultCommissionPercentage: data ? data.defaultCommissionPercentage : undefined,
            defaultCommissionAmount: data ? data.defaultCommissionAmount : undefined,
            businessTelephone: data ? data.businessTelephone : undefined,
            contractorName: data ? data.fullName : undefined, address: addressString,
            contractorId: data ? data.contractorId : undefined
          });
        }
      }, error => {
      });
    });
  }

  patchContartorList(data, isNew, isPreferred) {
    const contractorList = this.raiseQuoteForm.get('contractorList') as FormArray;
    const contGrup = this.fb.group({
      reference: [{ value: data.skills ? data.skills.toString() : data.occupation, disabled: true }],
      name: '',
      company: [{ value: data.company ? data.company : data.companyName, disabled: true }],
      email: '',
      mobile: [{ value: data.mobile ? data.mobile : '', disabled: true }],
      address: '',
      contractorId: data.contractorId ? data.contractorId : data.contractorObj.entityId,
      select: '',
      isPreferred,
      isNew: isNew,
      checked: isNew ? false : (data.contractorId == this.raiseQuoteForm.get('selectedContractorId').value && !data.isRejected ? true : false),
      isRejected: !isNew ? data.isRejected : false,
      rejectionReason: !isNew ? data.rejectionReason : ''
    });
    contractorList.push(contGrup);
    this.contratctorArr.push(data.contractorId ? data.contractorId : data.contractorObj.entityId);

    if (isNew) {
      this.addContractorForm.reset();
      this.isSelected = false;
    }
  }

  private async updateFaultNotification(notificationObj, faultNotificationId): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateNotification(faultNotificationId, notificationObj).subscribe(
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

  private async saveContractorVisitResponse(faultNotificationId, notificationObj): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveContractorVisit(faultNotificationId, notificationObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          reject(error)
        }
      );
    });
    return promise;
  }

  getFileType(name): boolean {
    if (name != null) {
      let data = name.split('.')[1] === 'pdf';
      if (data) {
        return true;
      }
    }
  }

  downloadDocumentByURl(url) {
    this.commonService.downloadDocumentByUrl(url);
  }

  async deleteDocument(documentId, i: number) {
    const response = await this.commonService.showConfirm('Delete Media/Document', 'Do you want to delete the media/document?', '', 'YES', 'NO');
    if (response) {
      this.faultsService.deleteDocument(documentId).subscribe(response => {
        this.removeFile(i);
      });
    }
  }

  private removeFile(i) {
    this.quoteDocuments.splice(i, 1);
  }

  async voidNotification(value) {
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isVoided = true;
    notificationObj.submittedByType = 'SECUR_USER';
    const updated = await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
    if (updated) {
      let faultRequestObj: any = {};
      faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
      const isFaultUpdated = await this.updateFaultSummary(faultRequestObj);
      if (isFaultUpdated) {
        if (value) {
          this._btnHandler('cancel');
        }
        else {
          this._btnHandler('refresh');
        }
      }
    }
  }

  updateFaultSummary(faultRequestObj) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFault(this.faultDetails.faultId, faultRequestObj).subscribe(
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

  onSearchContractor(event: any) {
    const searchString = event.target.value;
    this.workOrderForm.patchValue({ company: '', address: '', contractorId: '' });
    if (searchString.length > 2) {
      this.woResultsAvailable = true;
    } else {
      this.woResultsAvailable = false;
    }
  }

  woSelectContractor(contractorId) {
    if (contractorId) {
      this.getContractorDetails(contractorId, 'wo');
      this.woResultsAvailable = false;
    }
  }

  private async getMaxQuoteRejection(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.commonService.getSystemConfig(SYSTEM_CONFIG.MAXIMUM_FAULT_QUOTE_REJECTION).subscribe(res => {
        this.MAX_QUOTE_REJECTION = res ? parseInt(res.MAXIMUM_FAULT_QUOTE_REJECTION, 10) : this.MAX_QUOTE_REJECTION;
        resolve(true);
      }, error => {
        resolve(false);
      });
    });
    return promise;
  }

  getMoreCodes(event: {
    component: IonicSelectableComponent,
    text: string
  }) {
    if (event) {
      let text = (event.text || '').trim().toLowerCase();
      this.getCodesAsync(this.page, 10).subscribe(codes => {
        codes = event.component.items.concat(codes);

        if (text) {
          codes = this.filterCodes(codes, text);
        }

        event.component.items = codes;
        event.component.endInfiniteScroll();
        this.page++;
      });
    }

  }

  getCodes(page?: number, size?: number) {
    let codes = [];

    this.nominalCodes.forEach(code => {
      code.concat = code.nominalCode + " - " + code.description;
      if (this.faultMaintenanceDetails?.nominalCode && this.faultMaintenanceDetails.nominalCode === code.nominalCode && this.faultMaintenanceDetails.itemType === 4) {
        this.raiseQuoteForm.get('nominalCode').setValue(code);
      }

      if (this.faultMaintenanceDetails?.nominalCode && this.faultMaintenanceDetails.nominalCode === code.nominalCode && this.faultMaintenanceDetails.itemType === 6) {
        this.workOrderForm.get('nominalCode').setValue(code);
      }
      codes.push(code);
    });

    if (page && size) {
      codes = this.nominalCodes.slice((page - 1) * size, ((page - 1) * size) + size);
    }

    return codes;
  }

  getCodesAsync(page?: number, size?: number, timeout = 2000): Observable<FaultModels.NominalCode[]> {
    return new Observable<FaultModels.NominalCode[]>(observer => {
      observer.next(this.getCodes(page, size));
      observer.complete();
    }).pipe(delay(timeout));
  }

  filterCodes(codes: FaultModels.NominalCode[], text: string) {
    return codes.filter(code => {
      return code.description.toLowerCase().indexOf(text) !== -1
    });
  }


  searchCodes(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();

    // Close any running subscription.
    if (this.nominalCodeSubscription) {
      this.nominalCodeSubscription.unsubscribe();
    }

    if (!text) {
      // Close any running subscription.
      if (this.nominalCodeSubscription) {
        this.nominalCodeSubscription.unsubscribe();
      }

      event.component.items = this.getCodes(1, 15);

      // Enable and start infinite scroll from the beginning.
      this.page = 2;
      event.component.endSearch();
      event.component.enableInfiniteScroll();
      return;
    }

    this.nominalCodeSubscription = this
      .getCodesAsync()
      .subscribe(ports => {
        // Subscription will be closed when unsubscribed manually.
        if (this.nominalCodeSubscription.closed) {
          return;
        }
        event.component.items = this.filterCodes(ports, text);
        event.component.endSearch();
      });
  }

  endLoading() {
    this.commonService.hideLoader();
  }

  startLoading() {
    this.commonService.showLoader();
  }

  officeDetails() {
    return new Promise((resolve, reject) => {
      this.faultsService.getOfficeDetails(this.propertyDetails.office).subscribe((res) => {
        let data = res ? res : '';
        if (data) {
          this.workOrderForm.patchValue({
            mgntHoldKey: "Contact Branch - " + data.branding.phone
          });
        }
      }, error => {
      });
    });
  }

  private getFaultDetails(faultId): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getFaultDetails(faultId).subscribe(
        res => {
          if (res) {
            resolve(res);
          }
        },
        error => {
          resolve(null);
        }
      );
    });
    return promise;
  }

  private async worksOrderActionVisitTime(data) {
    if (data.value) {
      const modal = await this.modalController.create({
        component: AppointmentModalPage,
        cssClass: 'modal-container',
        componentProps: {
          faultNotificationId: this.iacNotification.faultNotificationId,
          title: "Appointment Date/Time",
          headingOne: "You have selected 'Yes, agreed Date/Time with Tenant'.",
          headingTwo: "Please add the appointment date & time the contractor has agreed with the occupants.",
          type: "wo"
        },
        backdropDismiss: false
      });

      modal.onDidDismiss().then(async res => {
        if (res.data && res.data == 'success') {
          this.commonService.showLoader();
          this.faultDetails = await this.getFaultDetails(this.faultDetails.faultId);
          await this.faultNotification(this.faultDetails.stageAction);
        }
      });
      await modal.present();
    } else {
      const confirm = await this.commonService.showConfirm(data.text, 'Are you sure?', '', 'Yes', 'No');
      if (confirm) {
        this.commonService.showLoader();
        let requestObj = {} as any;
        requestObj.isAccepted = data.value;
        requestObj.submittedByType = 'SECUR_USER';
        if (this.iacNotification.templateCode === 'CWO-NA-T-E-2') {
          requestObj.isEscalateFault = true;
        }
        const updateNotf = await this.saveWOContractorVisitResponse(this.iacNotification.faultNotificationId, requestObj);
        if (updateNotf) {
          this.faultDetails = await this.getFaultDetails(this.faultDetails.faultId);
          await this.faultNotification('PROCEED_WITH_WORKSORDER');
          this.commonService.hideLoader();
        }

      }
    }
  }

  private async saveWOContractorVisitResponse(faultNotificationId, requestObj): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateWOContractorVisit(faultNotificationId, requestObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          resolve(false)
        }
      );
    });
    return promise;
  }

  /*iac004 iac007.2*/
  private async checkForPaymentRules(rules) {
    const paymentRequired = await this.isPaymentRequired(rules);
    const stageAction = this.isWorksOrder ? 'Proceed with Worksorder' : 'Landlord accepted the quote';
    if (paymentRequired) {
      const response = await this.commonService.showConfirm(this.isWorksOrder ? 'Proceed with Worksorder' : 'Arranging Contractor',
        `You have selected "${stageAction}".<br/><br/>
         Since the Landlord account doesn't have sufficient balance to pay for the works, a payment request will be generated and the Landlord will be notified to make an online payment via the portal.<br/>
         <br/>Do you want to proceed? <br/><br/>
         <small>NB:The landlord can also make an offline payment which can be processed manually via landlord accounts.</small>`, '', 'Yes', 'No');
      if (response) {
        return paymentRequired;
      }
    } else {
      const response = await this.commonService.showConfirm(this.isWorksOrder ? 'Proceed with Worksorder' : 'Arranging Contractor',
        `You have selected "${stageAction}".<br/><br/>
         A notification will be sent out to the Contractor to carry out the job.<br/>
         <br/> Are you sure?`, '', 'Yes', 'No');
      if (response) {
        return paymentRequired;
      }
    }
  }

  private async raiseWorksOrderAndNotification(paymentRequired: boolean, actionType = 'auto') {
    if (typeof paymentRequired === 'undefined') {
      /*if user selected "No" from the popup*/
      return false;
    }

    let submit: boolean;
    if (actionType === 'auto') {
      submit = await this.saveFaultLLAuth() as boolean;
    } else {
      if (!this.faultMaintenanceDetails) {
        const isDraft = false;
        submit = await this.raiseWorksOrder(isDraft) as boolean;
      } else {
        const updateWO = await this.updateWorksOrder() as boolean;
        if (!updateWO) return false;
        submit = await this.updateFault(true) as boolean;
      }


    }
    if (!submit) return false;
    if (submit) {
      if (paymentRequired) {
        const success = await this.sendLandlordPaymentRequest() as boolean;
        return success;
      } else {
        const success = await this.issueWorksOrderContractor() as boolean;
        return success;
      }
    }
  }

  private getWorksOrderPaymentRules(actionType = 'auto') {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getWorksOrderPaymentRules(this.faultDetails.faultId).subscribe(
        res => {
          resolve(res);
        },
        error => {
          if (error.error && error.error.hasOwnProperty('errorCode')) {
            this.commonService.showMessage(error.error ? error.error.message : 'Something went wrong', 'Arranging Contractor', 'error');
            if (error.error.errorCode === ERROR_CODE.PAYMENT_RULES_CHECKING_FAILED && actionType !== 'auto') {
              resolve('saveWorksorder');
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        }
      );
    });
    return promise;
  }

  private issueWorksOrderContractor() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.issueWorksOrderoContractor(this.faultDetails.faultId).subscribe(
        res => {
          resolve(true);
        },
        error => {
          this.commonService.showMessage('Something went wrong', 'Arranging Contractor', 'error');
          resolve(false);
        }
      );
    });
    return promise;
  }

  private sendLandlordPaymentRequest() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.sendLandlordPaymentRequest(this.faultDetails.faultId).subscribe(
        res => {
          resolve(true);
        },
        error => {
          this.commonService.showMessage('Something went wrong', 'Arranging Contractor', 'error');
          resolve(false);
        }
      );
    });
    return promise;
  }

  async faultNotification(action) {
    let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
    this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, action);
    this.getPendingHours();
  }

  private isPaymentRequired(rules: FaultModels.IFaultWorksorderRules): boolean {
    let paymentNeeded = false;
    if (rules && rules.hasOwnProperty('hasSufficientReserveBalance')) {
      if (rules.hasSufficientReserveBalance === true) {
        paymentNeeded = false;
      } else {
        if (rules.hasOtherInvoicesToBePaid === true) {
          paymentNeeded = true;
        }
        else if (rules.hasRentArrears === true) {
          paymentNeeded = true;
        }
        else if (rules.hasRentPaidUpFront === true) {
          paymentNeeded = true;
        }
        else if (rules.hasTenantPaidRentOnTime === false) {
          paymentNeeded = true;
        }
        else if (rules.isFaultEstimateLessThanHalfRentOrThresHoldValue === false) {
          paymentNeeded = true;
        }
        else if (rules.isTenancyGivenNoticeOrInLastMonth === true) {
          paymentNeeded = true;
        }
      }
    }
    return paymentNeeded;
  }
  async viewNotification() {
    await this.fetchPendingNotification(this.faultDetails.faultId);
    await this.notificationModal();
  }

  async fetchPendingNotification(faultId): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.fetchPendingNotification(faultId).subscribe(
        res => {
          this.pendingNotification = res ? res : '';
          resolve(true);
        },
        error => {
          reject(error)
        }
      );
    });
    return promise;
  }

  async notificationModal() {
    const modal = await this.modalController.create({
      component: PendingNotificationModalPage,
      cssClass: 'modal-container',
      componentProps: {
        notificationHistoryId: this.pendingNotification ? this.pendingNotification.notificationHistoryId : '',
        notificationSubject: this.pendingNotification ? this.pendingNotification.subject : '',
        notificationBody: this.pendingNotification ? this.pendingNotification.body : '',
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this._btnHandler('refresh');
      }
    });

    await modal.present();
  }


  private submitJobCompletion() {
    let notificationObj = {} as any;
    notificationObj.isAccepted = false;
    notificationObj.submittedByType = 'SECUR_USER';
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveWorksOrderCompletion(notificationObj, this.iacNotification.faultNotificationId).subscribe(
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

  enableMarkCompletedBtn(): boolean {
    let enable = false;
    if (this.iacNotification &&
      (this.iacNotification.responseReceived != null) &&
      this.iacNotification.templateCode === 'CDT-C-E (WO)' &&
      this.iacNotification.responseReceived.isAccepted) {
      const woAgreedDateTime = this.commonService.getFormatedDate(this.faultDetails.contractorWoPropertyVisitAt, 'yyyy-MM-dd HH:mm:ss');
      const today = this.commonService.getFormatedDate(new Date(), 'yyyy-MM-dd HH:mm:ss');
      if (today >= woAgreedDateTime) {
        enable = true;
      }
    }
    return enable;
  }

  getPendingHours() {
    let hours = 0;
    const currentDateTime = this.commonService.getFormatedDateTime(new Date());
    if (this.iacNotification && this.faultDetails.status !== 18 && this.iacNotification.nextChaseDueAt) {
      let msec = new Date(this.iacNotification.nextChaseDueAt).getTime() - new Date(currentDateTime).getTime();
      let mins = Math.floor(msec / 60000);
      let hrs = Math.floor(mins / 60);
      this.iacNotification.hoursLeft = hrs != 0 ? `${hrs} hours` : `${mins} minutes`;
    }
  }
}