import { ContractorSelectionComponent } from './../../../shared/modals/contractor-selection/contractor-selection.component';
import { CloseFaultModalPage } from './../../../shared/modals/close-fault-modal/close-fault-modal.page';
import { WorksorderModalPage } from 'src/app/shared/modals/worksorder-modal/worksorder-modal.page';
import { RejectionModalPage } from './../../../shared/modals/rejection-modal/rejection-modal.page';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, delay, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { PROPCO, FAULT_STAGES, ACCESS_INFO_TYPES, SYSTEM_CONFIG, MAINTENANCE_TYPES, LL_INSTRUCTION_TYPES, ERROR_CODE, KEYS_LOCATIONS, FILE_IDS, MAINT_CONTACT, APPOINTMENT_MODAL_TYPE, REJECTED_BY_TYPE, SYSTEM_OPTIONS, WORKSORDER_RAISE_TYPE, FAULT_STATUSES, LL_PAYMENT_CONFIG, QUOTE_CC_STATUS_ID } from './../../../shared/constants';
import { AppointmentModalPage } from 'src/app/shared/modals/appointment-modal/appointment-modal.page';
import { ModalController } from '@ionic/angular';
import { QuoteModalPage } from 'src/app/shared/modals/quote-modal/quote-modal.page';
import { IonicSelectableComponent } from 'ionic-selectable';
import { DatePipe } from '@angular/common';
import { PaymentReceivedModalComponent } from 'src/app/shared/modals/payment-received-modal/payment-received-modal.component';
import { WithoutPrepaymentModalComponent } from 'src/app/shared/modals/without-prepayment-modal/without-prepayment-modal.component';
import { PendingNotificationModalPage } from 'src/app/shared/modals/pending-notification-modal/pending-notification-modal.page';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpParams } from '@angular/common/http';
import { PaymentRequestModalPage } from 'src/app/shared/modals/payment-request-modal/payment-request-modal.page';

@Component({
  selector: 'app-arranging-contractor',
  templateUrl: './arranging-contractor.component.html',
  styleUrls: ['./arranging-contractor.component.scss', '../details.page.scss'],
})
export class ArrangingContractorComponent implements OnInit {
  @ViewChild("outsideElement", { static: true }) outsideElement: ElementRef;
  @ViewChild('modalView', { static: true }) modalView$: ElementRef;
  raiseQuoteForm: FormGroup;
  workOrderForm: FormGroup;
  addContractorForm: FormGroup;
  contractorListForm: FormGroup;
  userSelectedActionControl = new FormControl();
  @Input() describeFaultForm;
  @Input() quoteId;
  @Input() faultDetails: FaultModels.IFaultResponse;
  @Output() public btnAction: EventEmitter<any> = new EventEmitter();
  @Input() leadTenantId: any;
  @Input() quoteDocuments: any;
  @Input() propertyDetails;
  @Input() propertyLandlords;
  @Input() categoryName;
  @Input() MAX_DOC_UPLOAD_LIMIT;
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
  REJECTED_BY_TYPE = REJECTED_BY_TYPE;
  otherStageActions = LL_INSTRUCTION_TYPES.filter(action => { return (action.index == 'OBTAIN_QUOTE' || action.index == 'PROCEED_WITH_WORKSORDER') });
  FAULT_STAGES = FAULT_STAGES;

  accessInfoList = ACCESS_INFO_TYPES;
  isMaintenanceDetails = false;
  nominalCodes;
  quoteStatuses;
  // rejectionReason: string = null;
  restrictAction: boolean = false;
  addMoreCCrestrictAction: boolean = false;
  private MAX_QUOTE_REJECTION = 2;
  private MAX_ACTIVE_QUOTE_CONTRACTOR = 3;
  private disableAnotherQuote: boolean = false;
  isUserActionChange: boolean = false;
  landlordMaintRejectionReasons: any;
  contractorMaintRejectionReasons: any;
  woResultsAvailable = false;
  woContractors: Observable<FaultModels.IContractorResponse>;
  nominalCodeSubscription: Subscription;
  page = 2;
  codes: FaultModels.NominalCode[];
  currentDate = this.commonService.getFormatedDate(new Date());
  isWorksOrder: boolean = false;
  isFormsReady: boolean = false;
  showSkeleton: boolean = true;
  pendingNotification: any;
  isContractorSearch = false;
  saving: boolean = false;
  proceeding: boolean = false;
  quoteArray = [];
  modalData: any;
  fileIds = FILE_IDS;
  maintenanceJobTypesMap = new Map();
  maintenanceRepairSourcesMap = new Map();
  faultReportedByThirdParty;
  occupiersVulnerableMap = new Map();
  maintenanceJobTypes;
  maintenanceRepairSources;
  quoteContractorStatuses;
  isCCSelected;
  isContractorSelected: boolean = false;
  faultNotifications: any = [];
  ccQuoteDocuments: any;
  filteredCCDetails: any = {};
  activeContractorCount: number = 0;

  constructor(
    private fb: FormBuilder,
    private faultsService: FaultsService,
    private commonService: CommonService,
    private modalController: ModalController,
    public datepipe: DatePipe,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.initiateArrangingContractors();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.leadTenantId && changes.leadTenantId.currentValue) {
      this.checkMaintenanceDetail();
    }
    if (changes.faultDetails && !changes.faultDetails.firstChange) {
      this.restrictAction = false;
      this.iacNotification = null;
      this.faultMaintenanceDetails = null;
      this.isUserActionChange = false;
      this.addMoreCCrestrictAction = false;
      this.userSelectedActionControl = new FormControl();
      this.showSkeleton = true;
      this.initiateArrangingContractors();
    }
  }

  ngOnDestroy() {
    this.commonService.removeItem('contractorId');
  }

  private async initiateArrangingContractors() {
    this.faultMaintenanceDetails = await this.getFaultMaintenance() as FaultModels.IMaintenanceQuoteResponse;
    if (this.faultDetails.status === FAULT_STATUSES.WORKSORDER_PENDING
      || (this.faultMaintenanceDetails && this.faultMaintenanceDetails.itemType === MAINTENANCE_TYPES.WORKS_ORDER)
      || (this.faultDetails.stageAction === 'PROCEED_WITH_WORKSORDER')) {
      /*19: Worksorder Pending*/
      this.isWorksOrder = true;
    } else this.isWorksOrder = false;
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
      description: [(this.faultDetails.sourceType === 'FAULT' ? (this.categoryName + " " + this.faultDetails.title) : (this.faultDetails.fixfloCategory + " " + this.faultDetails.title)), [Validators.required, Validators.maxLength(70)]],
      orderedBy: [{ value: '', disabled: true }, Validators.required],
      requiredDate: ['', Validators.required],
      contact: '',
      keysLocation: this.faultDetails.doesBranchHoldKeys ? KEYS_LOCATIONS.KEY_IN_BRANCH : KEYS_LOCATIONS.DO_NOT_HOLD_KEY,
      accessDetails: [this.faultDetails.isTenantPresenceRequired ? 'Tenant Presence Required' : 'Access with management keys'],
      contractorList: this.fb.array([]),
      contractorIds: [],
      quoteStatus: [{ value: 1, disabled: true }],
      nominalCode: ['', Validators.required],
      fullDescription: [this.faultDetails.notes, Validators.required],
      jobType: this.maintenanceJobTypesMap.get('repair'),
      repairSource: this.getRepairSource(this.faultDetails.sourceType),
      thirdPartySource: this.faultDetails.reportedBy === 'THIRD_PARTY' ? Number(this.faultDetails.reportedById) : '',
      doesBranchHoldKeys: [{ value: this.faultDetails.doesBranchHoldKeys ? 'Yes' : 'No', disabled: true }],
      quoteContractors: []
    });
    if (!this.faultMaintenanceDetails && this.faultDetails.contractorId) {
      this.getContractorDetails(this.faultDetails.contractorId, 'quote');
    }
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
      description: [(this.faultDetails.sourceType === 'FAULT' ? (this.categoryName + " " + this.faultDetails.title) : (this.faultDetails.fixfloCategory + " " + this.faultDetails.title)), [Validators.required, Validators.maxLength(70)]],
      paidBy: [{ value: 'LANDLORD', disabled: true }, Validators.required],
      keysLocation: this.faultDetails.doesBranchHoldKeys ? KEYS_LOCATIONS.KEY_IN_BRANCH : KEYS_LOCATIONS.DO_NOT_HOLD_KEY,
      returnKeysTo: this.faultDetails.doesBranchHoldKeys ? 'Return to Branch' : '',
      accessDetails: [this.faultDetails.isTenantPresenceRequired ? 'Tenant Presence Required' : 'Access with management keys'],
      requiredDate: '',
      fullDescription: [this.faultDetails.notes, Validators.required],
      orderedBy: { value: '', disabled: true },
      agentReference: [{ value: '', disabled: true }],
      defaultCommissionPercentage: '',
      defaultCommissionAmount: '',
      useCommissionRate: '',
      daytime: [{ value: '', disabled: true }],
      contact: this.getAccessDetails(this.faultDetails.isTenantPresenceRequired),
      jobType: this.maintenanceJobTypesMap.get('repair'),
      repairSource: this.getRepairSource(this.faultDetails.sourceType),
      requestStartDate: this.currentDate,
      usefulInstruction: this.faultDetails.tenantNotes,
      vulnerableOccupier: this.faultDetails.areOccupiersVulnerable ? this.occupiersVulnerableMap.get('yes') : this.occupiersVulnerableMap.get('no'),
      thirdPartySource: this.faultDetails.reportedBy === 'THIRD_PARTY' ? Number(this.faultDetails.reportedById) : '',
      mobile: [{ value: '', disabled: true }]
    });

    if (this.faultDetails.doesBranchHoldKeys) {
      this.officeDetails();
    }
    if (!this.faultMaintenanceDetails && this.faultDetails.contractorId) {
      this.woSelectContractor(this.faultDetails.contractorId);
      this.isContractorSearch = false;
    }
    if (this.faultDetails.contractorId) {
      this.woSelectContractor(this.faultDetails.contractorId);
      this.isContractorSearch = false;
    }
    this.woContractors = this.workOrderForm.get('contractorName').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.faultsService.searchContractor(value) :
        new Observable())
    );
  }

  private getAccessDetails(tenantPresence): string {
    return (tenantPresence ? MAINT_CONTACT.CONTACT_TENANT : MAINT_CONTACT.ACCESS_VIA_KEY);
    // if (tenantPresence != null) {
    //   let data = this.accessInfoList.filter(data => data.value == tenantPresence);
    //   return data && data[0] ? data[0].title : '';
    // }

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
    // if (this.restrictAction) { return; }
    if (isRejected) {
      this.commonService.showAlert('Delete Contractor', 'Deleting the rejected contractor is restricted.');
      return;
    }
    const contractorList = this.raiseQuoteForm.get('contractorList') as FormArray;
    const deleteContractor = await this.commonService.showConfirm('Delete Contrator', 'Do you want to delete contractor from the list?');
    if (deleteContractor) {
      const deleteConId = contractorList.at(i).get('contractorId').value;
      const index = this.contratctorArr.indexOf(deleteConId);

      if (contractorList.at(i).get('isNew').value) {
        contractorList.removeAt(i);
        this.contratctorArr.splice(index, 1);
        this.enableCCAddform();
        return;
      }
      const isDeleted = await this.deleteContrator(this.faultMaintenanceDetails.maintenanceId,
        deleteConId);
      if (isDeleted) {
        contractorList.removeAt(i);
        this.contratctorArr.splice(index, 1);
        this.enableCCAddform();
      }
    }
  }

  async updateContractorState(e, item) {
    if (this.isWorksOrder) return;
    if (e.target.checked) {
      this.activeContractorCount = await this.getActiveContractorCount() as number;
      if (this.activeContractorCount > this.MAX_ACTIVE_QUOTE_CONTRACTOR) {
        this.commonService.showAlert('Active Contractor', `Please note you can request only ${this.MAX_ACTIVE_QUOTE_CONTRACTOR} quotes at a time`);
        e.target.checked = false;
      }
    }
  }

  async getActiveContractorCount() {
    const contractorList = this.raiseQuoteForm.get('contractorList').value;
    let count = contractorList.filter(x => x.isActive && x.quoteContractorStatus !== QUOTE_CC_STATUS_ID.REJECTED);
    return count ? count.length : 0
  }

  private initAddContractorForm(): void {
    this.addContractorForm = this.fb.group({
      contractor: '',
      skillSet: '',
      contractorObj: ''
    });
  }

  private async initApiCalls() {
    this.MAX_ACTIVE_QUOTE_CONTRACTOR = await this.getSystemConfigs(SYSTEM_CONFIG.MAX_ACTIVE_QUOTE_CONTRACTOR);
    if (this.faultMaintenanceDetails) {
      if (!this.isWorksOrder) {
        this.MAX_QUOTE_REJECTION = await this.getSystemConfigs(SYSTEM_CONFIG.MAXIMUM_FAULT_QUOTE_REJECTION);
        const ccId = this.commonService.getItem('contractorId');
        this.isContractorSelected = ccId ? true : false;
        this.filteredCCDetails.contractorId = ccId ? ccId : null;
      }
      else {
        this.isContractorSelected = true;
        this.filteredCCDetails = {};
      }
      await this.faultNotification(this.faultDetails.stageAction, this.filteredCCDetails.contractorId);
      this.initPatching();
      this.setQuoteCCDetail();
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
    this.showSkeleton = false;
    this.getNominalCodes();
  }

  private async enableCCAddform() {
    this.activeContractorCount  = await this.getActiveContractorCount() as number;
    this.activeContractorCount < this.MAX_ACTIVE_QUOTE_CONTRACTOR ? this.addMoreCCrestrictAction = false : this.addMoreCCrestrictAction = true;
  }

  private getFaultMaintenance() {
    const promise = new Promise((resolve, reject) => {
      const params: any = new HttpParams().set('showCancelled', 'true');
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
      /*patching Quote Form*/
      this.raiseQuoteForm.patchValue(
        {
          worksOrderNumber: this.faultMaintenanceDetails.worksOrderNumber,
          description: this.faultMaintenanceDetails.description,
          orderedBy: this.faultMaintenanceDetails.orderedBy,
          requiredDate: this.faultMaintenanceDetails.requiredCompletionDate,
          accessDetails: this.faultMaintenanceDetails.accessDetails,
          contact: this.faultMaintenanceDetails.contact,
          quoteStatus: this.faultMaintenanceDetails.quoteStatus,
          fullDescription: this.faultMaintenanceDetails.fullDescription,
          jobType: this.faultMaintenanceDetails.jobType,
          repairSource: this.faultMaintenanceDetails.repairSource,
          thirdPartySource: this.faultMaintenanceDetails.thirdPartySource
        }
      );
      if (this.faultMaintenanceDetails.quoteContractors) {
        this.faultMaintenanceDetails.quoteContractors.map((x) => { this.addContractor(x, false, false) });
      }
      this.enableCCAddform();
    } else {
      if (!this.iacNotification && this.faultMaintenanceDetails.isCancelled) {
        //Note : special case : empty fault Maint var if cancelled
        this.faultMaintenanceDetails = null;
      } else {
        //Note : if creating new WO then skip patching old values  
        this.workOrderForm.patchValue(
          {
            worksOrderNumber: this.faultMaintenanceDetails.worksOrderNumber,
            description: this.faultMaintenanceDetails.description,
            orderedBy: this.faultMaintenanceDetails.orderedBy,
            postdate: this.faultMaintenanceDetails.postdate,
            // accessDetails: this.faultMaintenanceDetails.accessDetails,
            contractorId: this.faultMaintenanceDetails.contractorId,
            nominalCode: this.faultMaintenanceDetails.nominalCode,
            fullDescription: this.faultMaintenanceDetails.fullDescription,
            repairCost: this.faultMaintenanceDetails.amount,
            keysLocation: this.faultMaintenanceDetails.keysLocation,
            requiredDate: this.faultMaintenanceDetails.requiredCompletionDate,
            returnKeysTo: this.faultMaintenanceDetails.returnKeysTo,
            requestStartDate: this.faultMaintenanceDetails.requiredStartDate,
            jobType: this.faultMaintenanceDetails.jobType,
            repairSource: this.faultMaintenanceDetails.repairSource,
            thirdPartySource: this.faultMaintenanceDetails.thirdPartySource
          }
        );
        this.workOrderForm.get('contractorName').disable();
        this.woSelectContractor(this.faultMaintenanceDetails.contractorId);
        this.isContractorSearch = false;
      }
    }
  }


  onSearch(event: any) {
    this.isSelected = false;
    this.isContratorSelected = false;
    const searchString = event.target.value;
    const skillSet = this.addContractorForm.get('skillSet').value;
    if (skillSet || searchString.length > 2) {
      this.resultsAvailable = true;
    } else {
      this.resultsAvailable = false;
    }
    if (skillSet && !searchString) {
      this.contractors = this.faultsService.searchContractor(searchString, skillSet);
    } else {
      this.contractors = this.addContractorForm.get('contractor').valueChanges.pipe(debounceTime(300),
        switchMap((value: string) =>
          this.addContractorForm.get('skillSet').value ? this.faultsService.searchContractor(value, this.addContractorForm.get('skillSet').value) :
            (value && value.length > 2) ? this.faultsService.searchContractor(value, this.addContractorForm.get('skillSet').value) :
              new Observable())
      );
    }
  }

  onBlurContractorSearch(event: any) {
    this.resultsAvailable = false;
  }

  selectContractor(selected) {
    this.addContractorForm.patchValue({ contractor: selected ? selected.fullName : undefined, contractorObj: selected ? selected : undefined });
    this.resultsAvailable = false;
    this.isSelected = true;

    const currentDate = this.commonService.getFormatedDate(new Date());

    if (selected?.employerLiabilityExpiryDate === null || selected?.employerLiabilityExpiryDate < currentDate) {
      this.commonService.showAlert('Landlord Instructions', 'Does not have valid Employer\'s Liability');
    }

    if (selected?.employerLiabilityExpiryDate !== null && selected?.employerLiabilityExpiryDate === currentDate) {
      this.commonService.showAlert('Landlord Instructions', 'Employer\'s Liability is expiring today');
    }

    if (selected?.supplierLiabilityExpiryDate !== null && selected?.supplierLiabilityExpiryDate === currentDate) {
      this.commonService.showAlert('Landlord Instructions', 'Supplier liability insurance is expiring today');
    }

    if (!selected?.isAgentContractorApproved) {
      this.addContractorForm.controls['contractor'].setErrors({ invalidContractor: true, message: 'An Agreement with the Contractor doesn’t exist' });
    }

    if (selected?.supplierLiabilityExpiryDate === null || selected?.supplierLiabilityExpiryDate < currentDate) {
      this.addContractorForm.controls['contractor'].setErrors({ invalidContractor: true, message: 'Supplier liability insurance date is not active' });
    }
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
  }

  private getNominalCodes() {
    this.faultsService.getNominalCodes().subscribe(data => {
      this.nominalCodes = data ? data : [];
      this.codes = this.getCodes();
    });
  }

  private setLookupData(data) {
    this.contractorSkill = data.contractorSkills;
    this.quoteStatuses = data.maintenanceQuoteStatuses;
    this.setMaintJobTypeMap(data.maintenanceJobTypes);
    this.setRepairResMap(data.maintenanceRepairSources);
    this.setMaintVulMap(data.maintenanceVulOccupiers);
  }

  private setFaultsLookupData(data) {
    this.faultCategories = data.faultCategories;
    this.landlordMaintRejectionReasons = data.landlordQuoteRejectionReasons;
    this.contractorMaintRejectionReasons = data.contractorQuoteRejectionReasons;
    this.faultReportedByThirdParty = data.faultReportedByThirdParty;
    this.quoteContractorStatuses = data.quoteContractorStatuses;
    this.setCategoryMap();
  }

  private setCategoryMap() {
    this.faultCategories.map((cat, index) => {
      this.categoryMap.set(cat.index, cat.value);
    });
  }

  private setMaintVulMap(data) {
    if (data) {
      data.map((occ, index) => {
        this.occupiersVulnerableMap.set(occ.value.toLowerCase(), occ.index);
      });
    }
  }

  private setRepairResMap(data) {
    if (data) {
      this.maintenanceRepairSources = data;
      data.map((occ, index) => {
        this.maintenanceRepairSourcesMap.set(occ.value.toLowerCase(), occ.index);
      });
    }
  }

  private setMaintJobTypeMap(data) {
    if (data) {
      this.maintenanceJobTypes = data;
      data.map((occ, index) => {
        this.maintenanceJobTypesMap.set(occ.value.toLowerCase(), occ.index);
      });
    }
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  _btnHandler(type: string) {
    switch (type) {
      case 'save': {
        this.saving = true;
        this.saveForLater();
        break;
      }
      case 'proceed': {
        this.proceeding = true;
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
    // const isCompleted = await this.sendQuoteTonewCC();
    // if (isCompleted) { this.saving = false; return; }
    if (this.iacNotification && (this.iacNotification.responseReceived == null || this.iacNotification.responseReceived?.isAccepted == null) && !this.isUserActionChange) {
      this._btnHandler('saveLater');
      return;
    }
    if (this.iacNotification && this.iacNotification.responseReceived == null && this.isUserActionChange) {
      this.voidNotification('saveForLater');
    }
    else {
      if (!this.isWorksOrder) {
        const skipReqValidation = true;
        if (this.validateReq(skipReqValidation)) {
          this.saving = false;
          return;
        }
        if (!this.faultMaintenanceDetails) {
          /*raise a quote*/
          const isDraft = true;
          const quoteRaised = await this.raiseQuote(isDraft);
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
            // const updateQuoteCC = await this.updateFaultQuoteContractor();
            // if (updateQuoteCC) {
              const addContractors = await this.addContractors();
              if (addContractors) {
                const faultUpdated = await this.updateFault();
                if (faultUpdated) {
                  this._btnHandler('cancel');
                }
              }
            // }
          }
        }
      } else {
        // if (this.validateReq()) {
        //   return;
        // }
        if (!this.faultMaintenanceDetails) {
          /*raise a worksorder*/
          if (!this.workOrderForm.get('contractorId').value) { this.commonService.showMessage('Please select a contractor.', 'Works Order', 'error'); this.saving = false; return; }
          const woRaised = await this.raiseWorksOrder();
          if (woRaised) { this._btnHandler('cancel'); }
        } else {
          /*update a worksorder*/
          const woUpdated = await this.updateWorksOrder();
          if (woUpdated) { this._btnHandler('cancel'); }
        }
      }
    }
    this.saving = false;
  }

  private raiseQuote(isDraft: boolean = false) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.raiseQuote(this.prepareQuoteData(isDraft), this.faultDetails.faultId).subscribe((res) => {
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

  private validateReq(skipReqValidation: boolean = false) {
    let invalid = true;
    if (!this.isWorksOrder) {
      /*Quote form validations*/
      if (!skipReqValidation) {
        if (!this.raiseQuoteForm.valid) {
          this.commonService.showMessage('Please fill all required fields.', 'Quote', 'error');
          this.raiseQuoteForm.markAllAsTouched();
          return invalid;
        }
        if (this.raiseQuoteForm.value.contractorList.length == 0) {
          this.commonService.showMessage('Atleast one contractor is required for raising quote.', 'Quote', 'error');
          return invalid;
        }
        if (this.raiseQuoteForm.get('contractorList').value) {
          const anyActiveContractor = this.raiseQuoteForm.get('contractorList').value.find(x => x.isActive);
          if (!anyActiveContractor) {
            this.commonService.showMessage('Select atleast one contractor for raising quote.', 'Quote', 'error');
            return invalid;
          }
        }
      }
      if(skipReqValidation) {
        if (this.raiseQuoteForm.get('contractorList').value) {
          const anyActiveContractor = this.raiseQuoteForm.get('contractorList').value.find(x => x.isActive);
          if (!anyActiveContractor) {
            this.commonService.showMessage('Select atleast one contractor for raising quote.', 'Quote', 'error');
            return invalid;
          }
        }
      }
      if (this.iacNotification && this.iacNotification.responseReceived != null && this.iacNotification.responseReceived.isAccepted === false && this.iacNotification.templateCode === 'QC-L-E') {
        if (this.faultMaintenanceDetails.quoteContractors) {
          const defaulter = this.faultMaintenanceDetails.quoteContractors.find(x => x.isRejected && x.contractorId === this.filteredCCDetails.contractorId);
          if (defaulter) {
            this.commonService.showMessage('Selected contractor is rejected.Please select another one', 'Quote', 'error');
            return invalid;
          }
        }
      }
    } else {
      if (!this.workOrderForm.valid) {
        if (this.workOrderForm.controls['contractorName'].invalid) {
          this.commonService.showMessage('Invalid Contractor.', 'Works Order', 'error');
          return invalid;
        }
        this.commonService.showMessage('Please fill all required fields.', 'Works Order', 'error');
        this.workOrderForm.markAllAsTouched();
        return invalid;
      }
    }
    return invalid = false;
  }

  private updateFaultQuoteContractor() {
    let items = this.getChangedCCList();
    if (!items.length) return true;
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFaultQuoteContractor(
        items,
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

  private getNewCCList() {
    let contractors = [];
    this.raiseQuoteForm.get('contractorList').value.forEach(info => {
      if ((info.isNew || info.isPreferred) && info.isActive) {
        contractors.push(info);
      }
    });
    return contractors;
  }

  private getChangedCCList() {
    let preQuoteCCvalues = this.faultMaintenanceDetails.quoteContractors;
    let items = [];
    items = this.raiseQuoteForm.get('contractorList').value.filter((x) => {
      if (!x.isNew) {
        let isChanged = preQuoteCCvalues.find(xy => (xy.isActive !== x.isActive && xy.contractorId === x.contractorId));
        if (isChanged) {
          return true;
        }
      }
    });
    return items;
  }

  private updateFault(isSubmit = false, stageAction = '') {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFault(
        this.faultDetails.faultId, this.prepareFaultData(isSubmit, stageAction)).subscribe((res) => {
          resolve(true);
        }, error => {
          resolve(false);
          this.commonService.showMessage('Something went wrong', 'Update Fault', 'error');
        });
    });
    return promise;
  }

  private prepareQuoteData(isDraft: boolean = false) {
    const quoteReqObj: any = JSON.parse(JSON.stringify(this.raiseQuoteForm.getRawValue()));
    if (isDraft) {
      quoteReqObj.isDraft = isDraft;
    }
    quoteReqObj.descption = quoteReqObj.description;
    quoteReqObj.nominalCode = typeof quoteReqObj.nominalCode === 'object' ? quoteReqObj.nominalCode.nominalCode : quoteReqObj.nominalCode;
    delete quoteReqObj.contractorForm;
    if (!this.faultMaintenanceDetails) {
      quoteReqObj.quoteContractors = this.getNewCCList().map((list) => {
        // return { contractorId: list.contractorId, isActive: list.isActive };
        return { contractorId: list.contractorId };
      });
      if (!quoteReqObj.selectedContractorId) {
        delete quoteReqObj.selectedContractorId;
      }
      if (Array.isArray(quoteReqObj.contractorIds) && quoteReqObj.contractorIds.length !== 0) {
        quoteReqObj.contractorIds = quoteReqObj.contractorList.map(x => x.contractorId).filter(x => x);
      } else {
        delete quoteReqObj.contractorIds;
      }
      if (quoteReqObj.requiredDate) { quoteReqObj.requiredDate = this.commonService.getFormatedDate(new Date(quoteReqObj.requiredDate)); } else { delete quoteReqObj.requiredDate; }
    } else {
      if (quoteReqObj.requiredDate) { quoteReqObj.requiredCompletionDate = this.commonService.getFormatedDate(new Date(quoteReqObj.requiredDate)); }
      delete quoteReqObj.contractorIds;
    }
    delete quoteReqObj.contractorList;
    return quoteReqObj;
  }

  private prepareWorksOrderData(isDraft: boolean = true) {
    const quoteReqObj: any = JSON.parse(JSON.stringify(this.workOrderForm.getRawValue()));
    delete quoteReqObj.postdate;
    quoteReqObj.nominalCode = typeof quoteReqObj.nominalCode === 'object' ? quoteReqObj.nominalCode.nominalCode : quoteReqObj.nominalCode;
    /*setting true if user selecting rate field : BE requirement*/
    quoteReqObj.useCommissionRate = quoteReqObj.useCommissionRate;
    quoteReqObj.thirdPartySource = !quoteReqObj.thirdPartySource ? null : quoteReqObj.thirdPartySource;
    quoteReqObj.commissionAmount = quoteReqObj.defaultCommissionAmount;
    quoteReqObj.commissionRate = quoteReqObj.defaultCommissionPercentage;
    if (!this.faultMaintenanceDetails) {
      quoteReqObj.isDraft = isDraft;
      quoteReqObj.requiredDate = quoteReqObj.requiredDate ? this.commonService.getFormatedDate(new Date(quoteReqObj.requiredDate)) : null;
      quoteReqObj.requestStartDate = quoteReqObj.requestStartDate ? this.commonService.getFormatedDate(new Date(quoteReqObj.requestStartDate)) : null;
    } else {
      quoteReqObj.requiredCompletionDate = quoteReqObj.requiredDate ? this.commonService.getFormatedDate(new Date(quoteReqObj.requiredDate)) : null;
      quoteReqObj.requiredStartDate = quoteReqObj.requestStartDate ? this.commonService.getFormatedDate(new Date(quoteReqObj.requestStartDate)) : null;
    }
    return quoteReqObj;
  }

  private prepareFaultData(isSubmit: boolean, stageAction: string = '') {
    const faultReqObj: any = {};
    faultReqObj.isDraft = isSubmit ? false : true;
    faultReqObj.stage = this.faultDetails.stage;
    faultReqObj.submittedByType = 'SECUR_USER';
    faultReqObj.submittedById = '';
    faultReqObj.category = this.describeFaultForm.value.category;
    faultReqObj.title = this.describeFaultForm.value.title;

    if (stageAction) {
      faultReqObj.stageAction = stageAction;
    }
    return faultReqObj;
  }

  private async proceed() {
    const isCompleted = await this.sendQuoteTonewCC();
    if (isCompleted) { this.proceeding = false; return; }
    if (this.iacNotification && !this.isWorksOrder) {
      this.handleNotificationAndSelectedAction();
    }
    else if (this.iacNotification && this.isWorksOrder) {
      this.handleNotificationAndSelectedAction();
    }
    else {
      await this.proceedWithQuoteAndWO();
    }
    this.proceeding = false;
  }

  private async sendQuoteTonewCC() {
      if (this.faultMaintenanceDetails && !this.isWorksOrder && !this.isUserActionChange && this.faultNotifications.length) {
        if(!this.addMoreCCrestrictAction) {
          const checkForNewActiveandChangedActiveCC = this.raiseQuoteForm.get('contractorList').value.filter((x) => {
            if(x.isNew && x.isActive){
              return true
            }
      });
        if(checkForNewActiveandChangedActiveCC.length === 0) {
          this.commonService.showMessage('Please select a Contractor for raising a Quote.', 'Quote', 'error');
          return true;
        }
      }
      const newList = this.getNewCCList();
      if (newList.length === 0) return false;
      const proceed = await this.commonService.showConfirm('Raise a quote', 'Are you sure you want to send a quote request to the selected contractor(s) ?');
      if (!proceed) return true;
      if (newList.length) {
        await this.addContractors();
      }
      const faultUpdated = await this.updateFault(true, 'OBTAIN_QUOTE');
      if (faultUpdated) {
        this._btnHandler('refresh');
        return true;
      }
    }
  }

  private async proceedWithQuoteAndWO() {
    if (!this.isWorksOrder) {
      /*Create a Quote and Update Quote*/
      if (this.validateReq()) {
        /*Validate REQ before submitting*/
        this.proceeding = false;
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
              // this.commonService.showLoader();
              setTimeout(async () => {
                // await this.faultNotification('OBTAIN_QUOTE');
                this._btnHandler('refresh');
              }, 1000);
            }
          }
        } else {
          /*update a quote*/
          const quoteUpdated = await this.updateQuote();
          if (quoteUpdated) {
            // const updateQuoteCC = await this.updateFaultQuoteContractor();
            // if (updateQuoteCC) {
              const addContractors = await this.addContractors();
              if (addContractors) {
                const faultUpdated = await this.updateFault(true, 'OBTAIN_QUOTE');
                this.faultDetails = await this.getFaultDetails(this.faultDetails.faultId);
                if (faultUpdated) {
                  // this.commonService.showLoader();
                  setTimeout(async () => {
                    // await this.faultNotification('OBTAIN_QUOTE');
                    this._btnHandler('refresh');
                  }, 1000);
                }
              }
            // }
          }
        }
      }
    } else {
      if (this.validateReq()) {
        this.proceeding = false;
        return;
      }
      /*raise a worksorder & check paymentRules*/
      const rules = await this.getWorksOrderPaymentRules(WORKSORDER_RAISE_TYPE.MANUAL) as FaultModels.IFaultWorksorderRules as any;
      if (!rules) { return; }
      if (rules === 'saveWorksorder') {
        this.saveForLater();
      } else {
        const paymentRequired = await this.checkForPaymentRules(rules);
        const submit = await this.raiseWorksOrderAndNotification(paymentRequired, WORKSORDER_RAISE_TYPE.MANUAL);
        if (submit) {
          this._btnHandler('refresh');
        }
      }
    }
  }

  private async handleNotificationAndSelectedAction() {
    if (this.iacNotification) {
      if (this.iacNotification.responseReceived == null || this.iacNotification.responseReceived.isAccepted == null && !this.iacNotification.isVoided) {
        if (this.isUserActionChange) {
          let title = this.getLookupValue(this.userSelectedActionControl.value, this.iacStageActions);
          const proceed = await this.commonService.showConfirm(title, `You have selected ${title}. Are you sure?`)
            if (proceed) {
              this.voidNotification(null);
            }
        }
      }
      if (this.iacNotification.responseReceived != null) {
        if (!this.iacNotification.responseReceived.isAccepted && (this.iacNotification.templateCode === 'QC-L-E' || this.iacNotification.templateCode === 'CQ-NA-C-E' || this.iacNotification.templateCode === 'CQ-A-C-E' || this.iacNotification.templateCode === 'CDT-C-E')) {

          //show modal to select user to select contractor and proceed with WO
          if (this.iacNotification.templateCode === 'QC-L-E'
            && this.userSelectedActionControl.value === 'PROCEED_WITH_WORKSORDER') {
            const contractorList: any = JSON.parse(JSON.stringify(this.raiseQuoteForm.getRawValue())).contractorList;
            this.openContractorSelection(contractorList);
            return;
          } else {
            await this.proceedWithQuoteAndWO();
            this.proceeding = false;
            return;
          }
        }
        else {
          if (this.isUserActionChange) {
            let title = this.getLookupValue(this.userSelectedActionControl.value, this.iacStageActions);
            const proceed = await this.commonService.showConfirm(title, `You have selected ${title}. Are you sure?`)
            if (proceed) {
              let faultRequestObj: any = {};
              faultRequestObj.stageAction = this.userSelectedActionControl.value;
              faultRequestObj.isDraft = false;
              faultRequestObj.stage = this.faultDetails.stage;
              faultRequestObj.submittedById = '';
              faultRequestObj.submittedByType = 'SECUR_USER';
              const isFaultUpdated = await this.updateFaultSummary(faultRequestObj);
              if (isFaultUpdated) {
                this.proceeding = false;
                this._btnHandler('refresh');
                return;
              }
            }
          }
        }
      }

      if (!this.isUserActionChange) {
        this.proceeding = false;
        this.commonService.showAlert('Warning', 'Please choose one option to proceed.');
        return;
      }
    }
  }


  addContractors() {
    const promise = new Promise((resolve, reject) => {
      let contractIds = this.getNewCCList();
      if (contractIds.length) {
        this.faultsService.addContractors(this.faultMaintenanceDetails.maintenanceId, contractIds).subscribe(
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

  private filterNotifications(data, stage, action, contractorId) {
    const promise = new Promise((resolve, reject) => {
      let filteredData = null;
      if (data.length === 0) {
        resolve(null);
      }
      // filtereData = data.filter((x => x.faultStage === stage)).filter((x => x.faultStageAction === action)).filter((x => x.isResponseExpected));
      filteredData = data.filter((x => x.faultStage === stage)).filter((x => !x.isVoided));
      if (filteredData.length === 0) {
        resolve(null);
      }
      if (contractorId && !this.isWorksOrder) {
        filteredData = filteredData.filter((data) => {
          if (data.parameters.hasOwnProperty('contractorId') && data.parameters.contractorId == contractorId) {
            return data;
          }
          else if (data.recipientId == contractorId) {
            return data;
          }
        });
      }
      if (!contractorId && !this.isWorksOrder) {
        resolve(null);
      }
      filteredData = filteredData.sort((a, b) => {
        return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
      });
      if (filteredData && filteredData[0]) {
        filteredData[0].chase = filteredData[0].numberOfChasesDone + 1;
        if (!this.isWorksOrder) {
          this.disableContractorsList(filteredData[0]);
          this.disableQuoteDetail();
        } else {
          this.disableWorksOrderDetail();
        }
        resolve(filteredData[0]);
      } else {
        resolve(null);
      }
    });
    return promise;
  }

  private disableQuoteDetail() {
    if (this.restrictAction) {
      this.raiseQuoteForm.get('worksOrderNumber').disable();
      this.raiseQuoteForm.get('description').disable();
      this.raiseQuoteForm.get('requiredDate').disable();
      this.raiseQuoteForm.get('contact').disable();
      this.raiseQuoteForm.get('nominalCode').disable();
      this.raiseQuoteForm.get('fullDescription').disable();
      this.raiseQuoteForm.get('jobType').disable();
      this.raiseQuoteForm.get('repairSource').disable();
      this.raiseQuoteForm.get('thirdPartySource').disable();
    }
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
    this.workOrderForm.get('returnKeysTo').disable();
    // this.workOrderForm.get('accessDetails').disable();
    this.workOrderForm.get('jobType').disable();
    this.workOrderForm.get('repairSource').disable();
    this.workOrderForm.get('thirdPartySource').disable();
    this.workOrderForm.get('requestStartDate').disable();
  }

  private disableContractorsList(notification) {
    if (notification.responseReceived != null && notification.responseReceived.isAccepted === false && (notification.templateCode === 'QC-L-E' || notification.templateCode === 'CQ-NA-C-E' || notification.templateCode === 'CQ-A-C-E' || notification.templateCode === 'CDT-C-E')) {
      this.restrictAction = false;
    } else {
      this.restrictAction = true;
    }
    if (this.faultMaintenanceDetails && this.faultMaintenanceDetails.quoteContractors) {
      const data = this.faultMaintenanceDetails.quoteContractors.filter(x => x.isRejected);
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

  async openContractorSelection(contractorList) {
    const modal = await this.modalController.create({
      component: ContractorSelectionComponent,
      cssClass: 'modal-container property-certificates-list',
      componentProps: {
        contractorList: contractorList,
        faultId: this.faultDetails.faultId,
        faultDetails: this.faultDetails,
        title: this.getLookupValue(this.userSelectedActionControl.value, this.iacStageActions),
        stageAction: this.userSelectedActionControl.value,
        nominalCode: this.faultMaintenanceDetails.nominalCode
      },

      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this.proceeding = false;
        this._btnHandler('refresh');
      } else {
        this.proceeding = false;
      }
    });

    await modal.present();
  }

  private getTenantDetail(tenantId) {
    if (tenantId) {
      this.faultsService.getTenantDetails(tenantId).subscribe((res) => {
        const data = res ? res : '';
        if (data) {
          let contact = (data.fullName || '') + ' ' + (data.mobile || '');
          if (this.faultDetails.sourceType != 'FAULT' && data.mobile != this.faultDetails.fixfloTenantContact) {
            contact = (data.fullName || '') + ' ' + (data.mobile ? data.mobile + ',' : '') + `${this.faultDetails.fixfloTenantContact || ''}`;
          }
          this.raiseQuoteForm.get('contact').setValue(contact);
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
    if ((this.iacNotification && this.iacNotification.responseReceived != null) || this.faultDetails.isClosed) {
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
      } else if (this.iacNotification.templateCode === 'QC-L-E') {
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

  private async questionActionAcceptRequest(data) {
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isAccepted = data.value;
    notificationObj.submittedByType = 'SECUR_USER';
    const titleText = this.isWorksOrder ? 'works order' : 'quote request';
    if (data.value) {
      this.commonService.showConfirm(data.text, `Are you sure, you want to accept the ${titleText}?`, '', 'Yes', 'No').then(async res => {
        if (res) {
          this.commonService.showLoader();
          await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
          // await this.faultNotification(this.isWorksOrder ? 'PROCEED_WITH_WORKSORDER' : 'OBTAIN_QUOTE');
          this._btnHandler('refresh');
        }
      });
    }
    else if (!data.value) {
      if (this.isWorksOrder) {
        this.commonService.showConfirm(data.text, `Are you sure the Contractor doesn't want to accept the Works Order?`, '', 'Yes', 'No').then(async res => {
          if (res) {
            this.commonService.showLoader();
            await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
            this._btnHandler('refresh');
          }
        });
      }
      else if (!this.isWorksOrder) {
        this.questionActionRejectQuote();
      }
    }
  }

  private async questionActionRejectQuote() {
    const modal = await this.modalController.create({
      component: RejectionModalPage,
      cssClass: 'modal-container',
      componentProps: {
        faultNotificationId: this.iacNotification.faultNotificationId,
        faultMaintRejectionReasons: this.contractorMaintRejectionReasons,
        disableAnotherQuote: this.disableAnotherQuote,
        userType: 'contractor',
        title: 'No Acceptance',
        rejectedByType: REJECTED_BY_TYPE.CONTRACTOR,
        contractorId: this.filteredCCDetails.contractorId
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

  private async questionActionVisitTime(data) {
    if (!data.value) {
      this.commonService.showConfirm(data.text, 'Are you sure?', '', 'Yes', 'No').then(async res => {
        if (res) {
          let notificationObj = {} as FaultModels.IUpdateNotification;
          notificationObj.isAccepted = data.value;
          notificationObj.submittedByType = 'SECUR_USER';
          // if (this.iacNotification.templateCode === 'CDT-T-E') {
          notificationObj.isEscalateContractor = true;
          notificationObj.contractorId = this.filteredCCDetails.contractorId
          // }
          this.commonService.showLoader();
          await this.saveContractorVisitResponse(this.iacNotification.faultNotificationId, notificationObj);
          this._btnHandler('refresh');

        }
      });
    } else if (data.value) {
      let modalData = {
        faultId: this.faultDetails.faultId,
        faultNotificationId: this.iacNotification.faultNotificationId,
        title: "Arranging Contractor",
        headingOne: "You have selected 'Yes, agreed Date/Time with Tenant.'",
        headingTwo: "Please input the appointment date and time that the Contractor has agreed with the occupants.",
        type: APPOINTMENT_MODAL_TYPE.QUOTE,
        contractorId: this.filteredCCDetails.contractorId
      }
      this.openAppointmentModal(modalData);
    }
  }

  private async questionActionQuoteUpload(data) {
    if (data.value && this.filteredCCDetails.isDraft) {
      this.overrideQuote();
    }
    else if (data.value) {
      this.quoteUploadModal();
    }
    else {
      this.commonService.showConfirm(data.text, `You have selected 'No, couldn't carry out the Quote'. The fault will be escalated tor manual intervention. Do you want to proceed?`, '', 'Yes', 'No').then(async res => {
        if (res) {
          const submit = await this.submitQuoteAmout();
          if (submit) {
            // this.commonService.showLoader();
            // await this.faultNotification('OBTAIN_QUOTE');
            this._btnHandler('refresh');
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
          faultMaintRejectionReasons: this.landlordMaintRejectionReasons,
          disableAnotherQuote: this.disableAnotherQuote,
          userType: 'landlord',
          title: 'No Authorisation',
          rejectedByType: REJECTED_BY_TYPE.LANDLORD,
          contractorId: this.filteredCCDetails.contractorId
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
      this.commonService.showLoader();
      const actionType = WORKSORDER_RAISE_TYPE.AUTO;
      const paymentRequired = await this.checkForPaymentRules(rules, actionType);
      const submit = await this.raiseWorksOrderAndNotification(paymentRequired);
      if (submit) {
        this.commonService.removeItem('contractorId');
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
          // this.faultDetails = await this.getFaultDetails(this.faultDetails.faultId);
          // this.initiateArrangingContractors();
          this._btnHandler('refresh');
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
          // this.faultDetails = await this.getFaultDetails(this.faultDetails.faultId);
          // this.initiateArrangingContractors();
          this._btnHandler('refresh');
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
    if (this.faultDetails.isClosed) {
      return;
    }
    const modal = await this.modalController.create({
      component: WorksorderModalPage,
      cssClass: 'modal-container upload-container',
      componentProps: {
        faultNotificationId: this.iacNotification.faultNotificationId,
        faultId: this.faultDetails.faultId,
        maintenanceId: this.faultMaintenanceDetails.maintenanceId,
        actionType: this.enableMarkCompletedBtn() ? 'advance' : 'regular',
        MAX_DOC_UPLOAD_LIMIT: this.MAX_DOC_UPLOAD_LIMIT
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this.btnAction.emit('refresh_docs');
      }
    });
    await modal.present();
  }

  async submitQuoteAmout() {
    let notificationObj = {} as any;
    notificationObj.isAccepted = false;
    notificationObj.submittedByType = 'SECUR_USER';
    notificationObj.isDraft = false;
    notificationObj.contractorId = this.filteredCCDetails.contractorId;
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
    requestObj.contractorId = this.filteredCCDetails.contractorId;
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

  private getContractorDetails(contractor, type) {
    const contractId = typeof contractor === 'object' ? contractor.entityId : contractor;
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
            company: data ? data.companyName : undefined,
            agentReference: data ? data.agentReference : undefined,
            daytime: data ? data.businessTelephone : undefined,
            contractorName: data ? (data.fullName ? data.fullName : data.name) : undefined,
            address: addressString,
            contractorId: data ? data.contractorId : undefined,
            mobile: data ? data.mobile : undefined
          });
          if (!this.faultMaintenanceDetails) {
            this.workOrderForm.patchValue({
              useCommissionRate: data && data.isUseAmount ? false : true,
              defaultCommissionPercentage: data ? data.defaultCommissionPercentage : undefined,
              defaultCommissionAmount: data ? data.defaultCommissionAmount : undefined,
            });
          } else {
            this.workOrderForm.patchValue({
              useCommissionRate: this.faultMaintenanceDetails.useCommissionRate,
              defaultCommissionPercentage: this.faultMaintenanceDetails.commissionRate ? this.faultMaintenanceDetails.commissionRate : data.defaultCommissionPercentage,
              defaultCommissionAmount: this.faultMaintenanceDetails.commissionAmount ? this.faultMaintenanceDetails.commissionAmount : data.defaultCommissionAmount
            });
          }
          if (this.isContractorSearch && typeof contractor === 'object') {
            const currentDate = this.commonService.getFormatedDate(new Date());

            if (contractor?.employerLiabilityExpiryDate === null || contractor?.employerLiabilityExpiryDate < currentDate) {
              this.commonService.showAlert('Landlord Instructions', 'Does not have valid Employer\'s Liability');
            }

            if (contractor?.employerLiabilityExpiryDate !== null && contractor?.employerLiabilityExpiryDate === currentDate) {
              this.commonService.showAlert('Landlord Instructions', 'Employer\'s Liability is expiring today');
            }

            if (contractor?.supplierLiabilityExpiryDate !== null && contractor?.supplierLiabilityExpiryDate === currentDate) {
              this.commonService.showAlert('Landlord Instructions', 'Supplier liability insurance is expiring today');
            }

            if (!contractor?.isAgentContractorApproved) {
              this.workOrderForm.controls['contractorName'].setErrors({ invalidContractor: true, message: 'An Agreement with the Contractor doesn’t exist' });
            }

            if (contractor?.supplierLiabilityExpiryDate === null || contractor?.supplierLiabilityExpiryDate < currentDate) {
              this.workOrderForm.controls['contractorName'].setErrors({ invalidContractor: true, message: 'Supplier liability insurance date is not active' });
            }
          }
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
      // checked: isNew ? false : (data.isActive  ? true : false),
      // isActive: isNew ? false : (data.isActive ? true : false),
      isActive: isNew || isPreferred ? false : true,
      isRejected: !isNew ? data.isRejected : false,
      rejectionReason: !isNew ? data.rejectionReason : '',
      rejectedByType: !isNew ? data.rejectedByType : '',
      quoteContractorStatus: data.quoteContractorStatus,
      status: [{ value: this.getLookupValue(data.quoteContractorStatus, this.quoteContractorStatuses), disabled: true }],
    });
    contractorList.push(contGrup);
    if (this.contratctorArr.indexOf(data.contractorId ? data.contractorId : data.contractorObj.entityId) === -1) {
      this.contratctorArr.push(data.contractorId ? data.contractorId : data.contractorObj.entityId);
    }
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

  downloadDocumentByURl(url, name) {
    this.commonService.downloadDocumentByUrl(url, name);
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
      faultRequestObj.stageAction = this.userSelectedActionControl.value;
      faultRequestObj.submittedById = '';
      faultRequestObj.submittedByType = 'SECUR_USER';
      faultRequestObj.isDraft = false;
      faultRequestObj.stage = this.faultDetails.stage;
      const isFaultUpdated = await this.updateFaultSummary(faultRequestObj);
      let isStatusUpdated = false;
      if (this.userSelectedActionControl.value === 'PROCEED_WITH_WORKSORDER' && this.faultDetails.status !== FAULT_STATUSES.WORKSORDER_PENDING) {
        isStatusUpdated = await this.updateFaultStatus(FAULT_STATUSES.WORKSORDER_PENDING);
      } else {
        isStatusUpdated = true;
      }

      if (isFaultUpdated && isStatusUpdated) {
        if (value) {
          this._btnHandler('cancel');
        }
        else {
          this._btnHandler('refresh');
        }
      }
    }
  }

  private updateFaultStatus(status): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFaultStatus(this.faultDetails.faultId, status).subscribe(
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
    this.isContractorSearch = true
    const searchString = event.target.value;
    this.workOrderForm.patchValue({ company: '', address: '', contractorId: '' });
    if (searchString.length > 2) {
      this.woResultsAvailable = true;
    } else {
      this.woResultsAvailable = false;
    }
  }

  woSelectContractor(contractor) {
    if (contractor) {
      this.getContractorDetails(contractor, 'wo');
      this.woResultsAvailable = false;
    }
  }

  private async getSystemConfigs(key): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        resolve(parseInt(res[key], 10));
      }, error => {
        resolve(true);
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
      let heading = code.heading ? code.heading.toUpperCase() : '';
      code.concat = heading + ", " + code.nominalCode + ", " + code.description;
      //quote
      if (this.faultMaintenanceDetails?.nominalCode && this.faultMaintenanceDetails.nominalCode === code.nominalCode && this.faultMaintenanceDetails.itemType === 4) {
        this.raiseQuoteForm.get('nominalCode').setValue(code);
      }
      //wo
      if (this.faultMaintenanceDetails?.nominalCode && this.faultMaintenanceDetails.nominalCode === code.nominalCode && this.faultMaintenanceDetails.itemType === 6) {
        this.workOrderForm.get('nominalCode').setValue(code);
      }
      //canceled quote
      if (this.faultDetails?.nominalCode && this.faultDetails.nominalCode === code.nominalCode && this.faultDetails?.stageAction === 'PROCEED_WITH_WORKSORDER') {
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
      let modalData = {
        faultId: this.faultDetails.faultId,
        faultNotificationId: this.iacNotification.faultNotificationId,
        title: "Appointment Date/Time",
        headingOne: "You have selected 'Yes, agreed Date/Time with Tenant'.",
        headingTwo: "Please add the appointment date & time the contractor has agreed with the occupants.",
        type: APPOINTMENT_MODAL_TYPE.WO
      }
      this.openAppointmentModal(modalData);
    } else {
      const confirm = await this.commonService.showConfirm(data.text, 'Are you sure?', '', 'Yes', 'No');
      if (confirm) {
        this.commonService.showLoader();
        let requestObj = {} as any;
        requestObj.isAccepted = data.value;
        requestObj.submittedByType = 'SECUR_USER';
        if (this.iacNotification.templateCode === 'CWO-NA-T-E-2' || this.iacNotification.templateCode === 'CDT-C-E (WO)') {
          requestObj.isEscalateFault = true;
        }
        const updateNotf = await this.saveWOContractorVisitResponse(this.iacNotification.faultNotificationId, requestObj);
        if (updateNotf) {
          this._btnHandler('refresh');
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
  private async checkForPaymentRules(rules, actionType?) {
    const paymentRequired = this.faultsService.isWorksOrderPaymentRequired(rules);
    const stageAction = this.isWorksOrder ? 'Proceed with Worksorder' : 'Landlord accepted the quote';
    if (paymentRequired) {
      let amountThreshold = await this.getSystemOptions(SYSTEM_OPTIONS.REPAIR_ESTIMATE_QUOTE_THRESHOLD);
      let paymentWarnings = this.commonService.getPaymentWarnings(rules, amountThreshold);

      const isDraft: boolean = true
      let obj: any = {
        title: this.isWorksOrder ? 'Proceed with Worksorder' : 'Arranging Contractor',
        stageAction: stageAction,
        paymentWarnings: paymentWarnings,
        isWoRaised: this.faultMaintenanceDetails ? true : false,

        faultId: this.faultDetails.faultId,
        maintenanceId: this.faultMaintenanceDetails ? this.faultMaintenanceDetails.maintenanceId : '',
        isDraft: this.faultDetails.isDraft,
        stage: this.faultDetails.stage,
        actionType: actionType,
        faultNotificationId: this.iacNotification ? this.iacNotification.faultNotificationId : '',
        contractorId: !this.isWorksOrder ? this.filteredCCDetails.contractorId : ''
      }
      if (!actionType) {
        obj.woData = !this.faultMaintenanceDetails ? this.prepareWorksOrderData(isDraft) : this.prepareWorksOrderData();
      }

      let response: any = await this.paymentRequestModal(obj);

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

  private async getSystemOptions(key): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.commonService.getSystemOptions(key).subscribe(res => {
        resolve(res ? res['key'] : '');
      }, error => {
        resolve('');
      });
    });
    return promise;
  }

  private async raiseWorksOrderAndNotification(paymentRequired: boolean, actionType = WORKSORDER_RAISE_TYPE.AUTO) {
    if (typeof paymentRequired === 'undefined') {
      /*if user selected "No" from the popup*/
      return false;
    }

    let submit: boolean;
    if (actionType === WORKSORDER_RAISE_TYPE.AUTO) {
      submit = await this.saveFaultLLAuth() as boolean;
      return submit;
    } else {
      if (!this.faultMaintenanceDetails) {
        const isDraft = false;
        submit = await this.raiseWorksOrder(isDraft) as boolean;
      } else {
        //Note : removed update fault as per BE solution to avoid cancellation of active WO
        // submit = await this.updateFault(true) as boolean;
        submit = await this.updateWorksOrder() as boolean;
        if (!submit) return false;
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

  private getWorksOrderPaymentRules(actionType = WORKSORDER_RAISE_TYPE.AUTO) {
    const promise = new Promise((resolve, reject) => {
      const ccId = this.filteredCCDetails.contractorId ? this.filteredCCDetails.contractorId : null;
      this.faultsService.getWorksOrderPaymentRules(this.faultDetails.faultId, ccId).subscribe(
        res => {
          resolve(res);
        },
        error => {
          if (error.error && error.error.hasOwnProperty('errorCode')) {
            this.commonService.showMessage(error.error ? error.error.message : 'Something went wrong', 'Arranging Contractor', 'error');
            if (error.error.errorCode === ERROR_CODE.PAYMENT_RULES_CHECKING_FAILED && actionType !== WORKSORDER_RAISE_TYPE.AUTO) {
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
      let req: any = {};
      req.submittedById = '';
      req.submittedByType = 'SECUR_USER';
      this.faultsService.issueWorksOrderContractor(this.faultDetails.faultId, req).subscribe(
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
          if (error.error && error.error.hasOwnProperty('errorCode')) {
            this.commonService.showMessage('Something went wrong', 'Arranging Contractor', 'error');
            resolve(false);
          } else {
            resolve(true);
          }


        }
      );
    });
    return promise;
  }

  async faultNotification(action, ccId) {
    this.faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
    this.iacNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, action, (ccId ? ccId : undefined));
    this.getPendingHours();
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
      (this.iacNotification.responseReceived != null) && //this.iacNotification.responseReceived.isAccepted &&
      this.iacNotification.templateCode === 'CDT-C-E (WO)' && this.faultDetails.contractorWoPropertyVisitAt) {
      const woAgreedDateTime = this.commonService.getFormatedDate(this.faultDetails.contractorWoPropertyVisitAt, 'yyyy-MM-dd');
      const today = this.commonService.getFormatedDate(new Date(), 'yyyy-MM-dd');
      if (today >= woAgreedDateTime) {
        enable = true;
      }
    }
    return enable;
  }

  getPendingHours() {
    if (this.iacNotification?.templateCode === 'LNP-L-E') {
      this.getLLPaymentEsclationDue();
    }
    else {
      let hours = 0;
      const currentDateTime = this.commonService.getFormatedDateTime(new Date());
      if (this.iacNotification && !this.faultDetails.isEscalated && this.iacNotification.nextChaseDueAt) {
        let msec = new Date(this.iacNotification.nextChaseDueAt).getTime() - new Date(currentDateTime).getTime();
        let mins = Math.floor(msec / 60000);
        let hrs = Math.floor(mins / 60);
        if (hrs >= 0) {
          this.iacNotification.hoursLeft = hrs != 0 ? `${hrs} hours` : `${mins} minutes`;
        }
      }
    }
  }
  async quoteUploadModal(preUpload?) {
    const modal = await this.modalController.create({
      component: QuoteModalPage,
      cssClass: 'modal-container upload-container',
      componentProps: {
        faultNotificationId: this.iacNotification.faultNotificationId,
        faultId: this.faultDetails.faultId,
        stage: this.faultDetails.stage,
        maintenanceId: this.faultMaintenanceDetails.maintenanceId,
        confirmedEstimate: this.faultDetails.confirmedEstimate,
        preUpload: preUpload ? true : false,
        MAX_DOC_UPLOAD_LIMIT: this.MAX_DOC_UPLOAD_LIMIT,
        contractorId: this.filteredCCDetails.contractorId
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this._btnHandler('refresh_docs');
      }
    });
    await modal.present();
  }

  async modifyDateTime(templateCode) {
    if (this.faultDetails.isClosed) {
      return;
    }
    let modalData = {
      faultId: this.faultDetails.faultId,
      faultNotificationId: this.iacNotification.faultNotificationId,
      title: "Appointment Date/Time",
      headingOne: "You have selected 'Yes, agreed Date/Time with Tenant'.",
      headingTwo: "Please add the appointment date & time the contractor has agreed with the occupants.",
      type: templateCode === 'CDT-C-E' || templateCode === 'CQ-C-E' ? APPOINTMENT_MODAL_TYPE.MODIFY_QUOTE : APPOINTMENT_MODAL_TYPE.MODIFY_WO,
      contractorId: this.filteredCCDetails.contractorId
    }

    this.openAppointmentModal(modalData);
  }

  async openAppointmentModal(modalData) {
    const modal = await this.modalController.create({
      component: AppointmentModalPage,
      cssClass: 'modal-container',
      componentProps: modalData,
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this._btnHandler('refresh_docs');
      }
    });

    await modal.present();
  }

  getRepairSource(repairSource) {
    return repairSource === 'FIXFLO' ? this.maintenanceRepairSourcesMap.get('fixflo') : (this.faultDetails.reportedBy === 'THIRD_PARTY' ? this.maintenanceRepairSourcesMap.get('third party') : this.maintenanceRepairSourcesMap.get('customer report'));
  }

  async closeFault() {
    const modal = await this.modalController.create({
      component: CloseFaultModalPage,
      cssClass: 'modal-container close-fault-modal',
      componentProps: {
        faultId: this.faultDetails.faultId,
        maitenanceId: this.isMaintenanceDetails ? this.faultMaintenanceDetails.maintenanceId : null
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this._btnHandler('refresh');
        this.commonService.showMessage('Fault has been closed successfully.', 'Close a Fault', 'success');
        return;
      }
    });

    await modal.present();
  }

  onBlurCurrency(val: any, form: FormGroup) {
    if (!val) {
      if (form == this.workOrderForm) {
        this.workOrderForm.patchValue({
          repairCost: 0
        });
      }
    }
  }

  private async paymentRequestModal(data) {
    const modal = await this.modalController.create({
      component: PaymentRequestModalPage,
      cssClass: 'modal-container payment-request-modal',
      componentProps: data,
      backdropDismiss: false
    });
    await modal.present();

    return modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'skip-payment') {
        this._btnHandler('refresh');
      }
      if (res.data && res.data == 'success') {
        return true;
      }
    });
  }

  private getLLPaymentEsclationDue(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      let urgencyStatus = this.faultDetails.urgencyStatus == 2 ? LL_PAYMENT_CONFIG.URGENT : LL_PAYMENT_CONFIG.NON_URGENT;
      this.commonService.getSystemConfig(urgencyStatus).subscribe(res => {
        let minutes = res && this.faultDetails.urgencyStatus == 2 ? parseInt(res.FAULT_URGENT_LL_PAYMENT_UNSUCCESSFUL_EMAIL_NUDGE_MINUTES, 10) : parseInt(res.FAULT_NON_URGENT_LL_PAYMENT_UNSUCCESSFUL_EMAIL_NUDGE_MINUTES, 10);
        const currentDateTime = this.commonService.getFormatedDateTime(new Date());
        let firstEmailSentAt = new Date(this.iacNotification?.firstEmailSentAt);
        firstEmailSentAt.setMinutes(firstEmailSentAt.getMinutes() + minutes);
        let msec = new Date(firstEmailSentAt).getTime() - new Date(currentDateTime).getTime();
        let mins = Math.floor(msec / 60000);
        let hrs = Math.floor(mins / 60);
        if (hrs >= 0) {
          this.iacNotification.hoursLeft = hrs != 0 ? `${hrs} hours` : `${mins} minutes`;
        }
        resolve(true);
      }, error => {
        resolve(false);
      });
    });
    return promise;
  }

  selectedCCDetails(id) {
    this.commonService.setItem('contractorId', id);
    this.filteredCCDetails = this.faultMaintenanceDetails.quoteContractors.filter(data => data.contractorId == id)[0];
    if (this.quoteDocuments && this.quoteDocuments.length > 0) {
      this.ccQuoteDocuments = this.quoteDocuments.filter((data => data.contractorId == id)).filter((s => !s.isDraft));
      this.quoteArray = this.ccQuoteDocuments.filter(s => s.documentType === 'QUOTE');
    }
    this.filterNotifications(this.faultNotifications, this.faultDetails.stage, undefined, id).then(data => {
      this.iacNotification = data;
      this.isContractorSelected = true;
    });
  }

  // Auto select CC details if there is one one active cc
  private setQuoteCCDetail() {
    if (this.isWorksOrder) return;
    if (this.faultMaintenanceDetails.quoteContractors && this.faultMaintenanceDetails.quoteContractors.length) {
      // if (this.faultMaintenanceDetails.quoteContractors.filter(data => data.isActive).length == 1 || this.filteredCCDetails.contractorId) {
        if (this.faultMaintenanceDetails.quoteContractors.length == 1 || this.filteredCCDetails.contractorId) {
        // let ccId = this.filteredCCDetails.contractorId ? this.filteredCCDetails.contractorId : this.faultMaintenanceDetails.quoteContractors.filter(data => data.isActive)[0].contractorId;
        let ccId = this.filteredCCDetails.contractorId ? this.filteredCCDetails.contractorId : this.faultMaintenanceDetails.quoteContractors[0].contractorId;
        if (ccId) {
          this.selectedCCDetails(ccId);
        }
      }
    }
  }

  scrollToAddCC(): void {
    document.getElementById("addCCform").scrollIntoView({ behavior: "smooth" });
  }

  async overrideQuote(preUpload?) {
    const proceed = await this.commonService.showConfirm('Override Quote', `The Contractor ${this.filteredCCDetails.company}  is in process of submitting a response. This action will override the information they have saved from the Contractor Portal.<br/> Are you sure you want to proceed?`, '', 'Yes', 'No');
    if (proceed) {
      this.quoteUploadModal(preUpload ? preUpload : null);
    }
  }
  
  snoozeFault(){
    this._btnHandler('snooze');
  }
}