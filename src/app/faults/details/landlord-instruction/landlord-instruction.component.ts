import { ContractorSelectionComponent } from './../../../shared/modals/contractor-selection/contractor-selection.component';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { debounceTime, delay, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { PROPCO, FAULT_STAGES, ACCESS_INFO_TYPES, SYSTEM_CONFIG, MAINTENANCE_TYPES, LL_INSTRUCTION_TYPES, FILE_IDS, MAINT_CONTACT, REJECTED_BY_TYPE, SYSTEM_OPTIONS, WORKSORDER_RAISE_TYPE, FAULT_STATUSES, REGEX, FAULT_STAGES_INDEX } from './../../../shared/constants';
import { ModalController, PopoverController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { DatePipe } from '@angular/common';
import { PendingNotificationModalPage } from 'src/app/shared/modals/pending-notification-modal/pending-notification-modal.page';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpParams } from '@angular/common/http';
import { PaymentRequestModalPage } from 'src/app/shared/modals/payment-request-modal/payment-request-modal.page';
import { JobCompletionModalPage } from 'src/app/shared/modals/job-completion-modal/job-completion-modal.page';
import { SimplePopoverPage } from 'src/app/shared/popover/simple-popover/simple-popover.page';
import { ContractorDetailsModalPage } from 'src/app/shared/modals/contractor-details-modal/contractor-details-modal.page';

@Component({
  selector: 'app-landlord-instruction',
  templateUrl: './landlord-instruction.component.html',
  styleUrls: ['./landlord-instruction.component.scss', '../details.page.scss']
})
export class LandlordInstructionComponent implements OnInit {
  @ViewChild("outsideElement", { static: true }) outsideElement: ElementRef;
  @ViewChild('modalView', { static: true }) modalView$: ElementRef;
  landlordInstFrom: FormGroup;
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
  resultsAvailable: boolean = false;
  contractorList: any;
  lookupdata: any;
  contractorSkill: any;
  faultCategories: any;
  categoryMap = new Map();
  isSelected = false;
  contratctorArr: string[] = [];
  isContratorSelected = false;
  cliNotification;
  iacStageActions = LL_INSTRUCTION_TYPES;
  REJECTED_BY_TYPE = REJECTED_BY_TYPE;
  otherStageActions = LL_INSTRUCTION_TYPES.filter(action => { return (action.index == 'OBTAIN_QUOTE' || action.index == 'PROCEED_WITH_WORKSORDER') });
  FAULT_STAGES = FAULT_STAGES;

  accessInfoList = ACCESS_INFO_TYPES;
  isMaintenanceDetails = false;
  nominalCodes;
  quoteStatuses;
  rejectionReason: string = null;
  restrictAction: boolean = false;
  isUserActionChange: boolean = false;
  landlordMaintRejectionReasons: any;
  contractorMaintRejectionReasons: any;
  woResultsAvailable = false;
  woContractors: Observable<FaultModels.IContractorResponse>;
  nominalCodeSubscription: Subscription;
  page = 2;
  codes: FaultModels.NominalCode[];
  currentDate = this.commonService.getFormatedDate(new Date());
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
  contractorEntityId: any;
  selectedContractor: Observable<FaultModels.IContractorResponse>;
  preferredSuppliers: any[] = [];
  faultNotifications: any;
  landlordInstructionTypes = LL_INSTRUCTION_TYPES;
  suggestedAction;
  oldUserSelectedAction;
  private QUOTE_THRESOLD = 500;
  landlordDetails: any;
  accessInfoForm: FormGroup;
  isMatch;
  isAuthorizationfields = false;
  isContractorModal = false;
  loggedInUserData: any;

  constructor(
    private fb: FormBuilder,
    private faultsService: FaultsService,
    private commonService: CommonService,
    private modalController: ModalController,
    public datepipe: DatePipe,
    public sanitizer: DomSanitizer,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.initiateLandlordInstructions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.faultDetails && !changes.faultDetails.firstChange) {
      this.proceeding = false;
      this.restrictAction = false;
      this.cliNotification = null;
      this.faultMaintenanceDetails = null;
      this.isUserActionChange = false;
      this.userSelectedActionControl = new FormControl();
      this.showSkeleton = true;
      this.initiateLandlordInstructions();
    }
  }

  private async initiateLandlordInstructions() {
    this.getLookupData();
    this.initForms();
    this.initApiCalls();
  }

  private initForms(): void {
    this.initLandLordInstForm()
    this.initAccessInfiForm()
  }

  private initLandLordInstForm(): void {
    this.landlordInstFrom = this.fb.group({
      contractor: '',
      confirmedEstimate: ['', Validators.pattern(REGEX.DECIMAL_REGEX)],
      userSelectedAction: '',
      estimationNotes: '',
      nominalCode: '',
      requiredStartDate: '',
      requiredCompletionDate: '',
      orderedBy: [{ value: '', disabled: true }],
    });
    this.selectedContractor = this.landlordInstFrom.get('contractor').valueChanges.pipe(debounceTime(1000),
      switchMap((value: string) => (value && value.length > 2) ? this.faultsService.searchContractor(value) :
        new Observable())
    );
  }

  private initAccessInfiForm(): void {
    this.accessInfoForm = this.fb.group({
      tenantNotes: '',
      areOccupiersVulnerable: false,
      isTenantPresenceRequired: ['', Validators.required]
    });
  }

  private async initApiCalls() {
    this.contractorEntityId = this.faultDetails.contractorId;
    if (this.contractorEntityId) {
      this.isContractorSearch = false;
      let contractorDetails: any = await this.getContractorDetails(this.contractorEntityId);
      if (contractorDetails) {
        contractorDetails.fullName = contractorDetails.name;
        // this.landlordInstFrom.patchValue({
        //   contractor: contractorDetails
        // });

        this.contractorSelected(contractorDetails);
      }
    }
    this.getNominalCodes();
    this.oldUserSelectedAction = this.faultDetails.userSelectedAction;
    this.userSelectedActionControl.setValue(this.faultDetails.userSelectedAction);
    // if (this.faultMaintenanceDetails) {
      await this.faultNotification(this.faultDetails.stageAction);
      this.initPatching();
      this.getUserDetails();
    // } else {
      // if (!this.isWorksOrder) {
      this.propertyLandlords.map((x) => { this.getPreferredSuppliers(x.landlordId) });
      // this.checkMaintenanceDetail();
      // }
      // let userDetails: any = await this.getUserDetails();
      // if (userDetails) {
        // this.isWorksOrder ? this.workOrderForm.get('orderedBy').setValue(userDetails.name) : this.raiseQuoteForm.get('orderedBy').setValue(userDetails.name);
      // }
    // }

    let landlordId;
    if (this.propertyLandlords.length > 1) {
      let landlord = this.getMaxRentShareLandlord(this.propertyLandlords);
      landlordId = landlord.landlordId
    } else {
      landlordId = this.propertyLandlords[0].landlordId;
    }
    await this.getLandlordDetails(landlordId);
    this.checkForLLSuggestedAction();
    this.matchCategory();
    this.showSkeleton = false;
  }

  private getLandlordDetails(landlordId) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getLandlordDetails(landlordId).subscribe(
        res => {
          let categoryNames = [];
          this.landlordDetails = res ? res : [];
          if (this.landlordDetails.repairCategories) {
            for (let category of this.landlordDetails.repairCategories) {
              categoryNames.push(this.commonService.getLookupValue(category, this.faultCategories));
            }
          }
          this.landlordDetails.repairCategoriesText = categoryNames;
          resolve(this.landlordDetails);
        },
        error => {
          reject(null);
        }
      );
    });
    return promise;
  }

  private getMaxRentShareLandlord(landlords) {
    let maxRent = 0;
    let mLandlord;
    landlords.forEach(landlord => {
      if (landlord.rentPercentage > maxRent) {
        maxRent = landlord.rentPercentage;
        mLandlord = landlord;
      }
    });
    return mLandlord;
  }

  private async checkForLLSuggestedAction() {

    this.suggestedAction = '';
    let confirmedEstimate = this.faultDetails.confirmedEstimate;

    if (this.landlordDetails.doesOwnRepairs) {
      this.suggestedAction = LL_INSTRUCTION_TYPES[0].index;
    }
    else if (confirmedEstimate == null || confirmedEstimate <= 0) {
      this.suggestedAction = LL_INSTRUCTION_TYPES[4].index;//
    }
    else if (this.landlordDetails.isAuthorizationRequired || this.propertyDetails.expenditureLimit == 0 || confirmedEstimate > this.propertyDetails.expenditureLimit) {
      this.suggestedAction = LL_INSTRUCTION_TYPES[3].index; //OBTAIN_AUTHORISATION
    }
    else if (confirmedEstimate > this.QUOTE_THRESOLD) {
      this.suggestedAction = LL_INSTRUCTION_TYPES[2].index;
    }
    else if (confirmedEstimate <= this.propertyDetails.expenditureLimit) {
      this.suggestedAction = LL_INSTRUCTION_TYPES[1].index;
    }

    // }
    let notifications = await this.checkFaultNotifications(this.faultDetails.faultId);
    this.cliNotification = await this.filterNotifications(notifications, FAULT_STAGES.LANDLORD_INSTRUCTION, this.faultDetails.userSelectedAction);
    this.getPendingHours();
    // if (this.faultDetails.userSelectedAction === LL_INSTRUCTION_TYPES[0].index) {
    //   if (this.cliNotification && this.cliNotification.responseReceived && this.cliNotification.responseReceived.isAccepted) {
    //     this.selectStageStepper(FAULT_STAGES.JOB_COMPLETION);
    //   }
    // } else 
    if (this.faultDetails.userSelectedAction === LL_INSTRUCTION_TYPES[3].index) {
      if (this.cliNotification && this.cliNotification.responseReceived) {
        if (this.cliNotification.responseReceived.isAccepted) {
          // this.userSelectedActionControl.setValue(LL_INSTRUCTION_TYPES[1].index);
        } else {
          this.isUserActionChange = true;
          this.userSelectedActionControl.setValue(LL_INSTRUCTION_TYPES[2].index);
        }
      }
    }

  }

  private matchCategory() {
    this.isMatch = false;
    if (this.landlordDetails.repairCategories) {
      this.landlordDetails.repairCategories.forEach(category => {
        if (category === this.faultDetails.category) {
          this.isMatch = true;
        }
      });
    }
  }

  initPatching(): void {
    this.landlordInstFrom.patchValue({
      // contractor: this.faultDetails.contractorId,
      confirmedEstimate: this.faultDetails.confirmedEstimate,
      userSelectedAction: this.faultDetails.userSelectedAction,
      estimationNotes: this.faultDetails.estimationNotes,
      requiredStartDate: this.faultDetails.requiredStartDate,
      requiredCompletionDate: this.faultDetails.requiredCompletionDate
    });
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
    this.updateFaultSummary();
  }

  async proceed() {
    document.querySelector('ion-content').scrollToTop(500);
    if (this.cliNotification) {
      if (!this.isUserActionChange) {
        // && !this.userSelectedActionControl.value    
        this.commonService.showAlert('Warning', 'Please choose one option to proceed.');
        this.proceeding = false;
        return;
      }
    } else {
      this.isUserActionChange = false;
    }
    this.proceedCliAction();
  }

  async proceedCliAction() {
    let faultRequestObj = {} as FaultModels.IFaultResponse;
    faultRequestObj.isDraft = false;
    Object.assign(faultRequestObj, this.landlordInstFrom.value);
    if (this.contractorEntityId) {
      faultRequestObj.contractorId = this.contractorEntityId;
    } else {
      delete faultRequestObj.contractorId;
    }

    switch (this.userSelectedActionControl.value) {
      case LL_INSTRUCTION_TYPES[1].index: //cli006b
        if (!this.landlordInstFrom.value.confirmedEstimate) {
          this.commonService.showAlert('Landlord Instructions', 'Please fill the confirmed estimate field.');
          this.proceeding = false;
          return;
        }
        if (this.landlordInstFrom.controls['contractor'].invalid) {
          this.proceeding = false;
          return;
        }
        var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Proceed with Worksorder" action.<br/> Are you sure?', '', 'Yes', 'No');
        if (response) {
          if (this.cliNotification && (this.cliNotification.responseReceived == null || this.cliNotification.responseReceived.isAccepted == null) && !this.cliNotification.isVoided && this.isUserActionChange) {
            let voidResponce = await this.voidNotification();
            if (!voidResponce) return;
          }
          faultRequestObj.stage = FAULT_STAGES.ARRANGING_CONTRACTOR;
          faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
          faultRequestObj.stageAction = this.userSelectedActionControl.value;
          const WORKS_ORDER_PENDING = 19;
          let requestArray = [];
          requestArray.push(this.updateFaultDetails(faultRequestObj));
          if (this.faultDetails.status !== WORKS_ORDER_PENDING) {
            requestArray.push(this.updateFaultStatus(WORKS_ORDER_PENDING));
          }
          forkJoin(requestArray).subscribe(data => {
            this._btnHandler('refresh');
          });
        } else {
          this.proceeding = false;
        }
        break;
      case LL_INSTRUCTION_TYPES[2].index: //cli006c
        var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Obtain Quote" action.<br/>  Are you sure?', '', 'Yes', 'No');
        if (response) {
          if (this.cliNotification && (this.cliNotification.responseReceived == null || this.cliNotification.responseReceived.isAccepted == null) && !this.cliNotification.isVoided && this.isUserActionChange) {
            let voidResponce = await this.voidNotification();
            if (!voidResponce) return;
          }
          faultRequestObj.stage = FAULT_STAGES.ARRANGING_CONTRACTOR;
          faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
          faultRequestObj.stageAction = this.userSelectedActionControl.value;
          const AWAITING_QUOTE = 14;
          let requestArray = [];
          requestArray.push(this.updateFaultDetails(faultRequestObj));
          if (this.faultDetails.status !== AWAITING_QUOTE) {
            requestArray.push(this.updateFaultStatus(AWAITING_QUOTE));
          }
          forkJoin(requestArray).subscribe(data => {
            this._btnHandler('refresh');
          });
        } else {
          this.proceeding = false;
        }
        break;
      case LL_INSTRUCTION_TYPES[5].index: //cli006e
        if (!this.landlordInstFrom.value.confirmedEstimate) {
          this.commonService.showAlert('Landlord Instructions', 'Please fill the confirmed estimate field.');
          this.proceeding = false;
          return;
        }
        if (this.landlordInstFrom.controls['contractor'].invalid) {
          this.proceeding = false;
          return;
        }
        var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "EMERGENCY/URGENT – proceed as agent of necessity" action.<br/> Are you sure?', '', 'Yes', 'No');
        if (response) {
          if (this.cliNotification && (this.cliNotification.responseReceived == null || this.cliNotification.responseReceived.isAccepted == null) && !this.cliNotification.isVoided && this.isUserActionChange) {
            let voidResponce = await this.voidNotification();
            if (!voidResponce) return;
          }
          faultRequestObj.stage = FAULT_STAGES.ARRANGING_CONTRACTOR;
          faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
          faultRequestObj.stageAction = this.userSelectedActionControl.value;
          const WORKS_ORDER_PENDING = 19;
          let requestArray = [];
          requestArray.push(this.updateFaultDetails(faultRequestObj));
          if (this.faultDetails.status !== WORKS_ORDER_PENDING) {
            requestArray.push(this.updateFaultStatus(WORKS_ORDER_PENDING));
          }
          forkJoin(requestArray).subscribe(data => {
            this._btnHandler('refresh');
          });
        } else {
          this.proceeding = false;
        }
        break;
      case LL_INSTRUCTION_TYPES[0].index: //cli006a
        var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Landlord does their own repairs" action. This will send out a notification to Landlord. <br/> Are you sure?', '', 'Yes', 'No');
        if (response) {
          if (this.cliNotification && (this.cliNotification.responseReceived == null || this.cliNotification.responseReceived.isAccepted == null) && !this.cliNotification.isVoided && this.isUserActionChange) {
            let voidResponce = await this.voidNotification();
            if (!voidResponce) return;
          }
          faultRequestObj.stage = FAULT_STAGES.LANDLORD_INSTRUCTION;
          faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
          faultRequestObj.stageAction = this.userSelectedActionControl.value;
          const AWAITING_RESPONSE_LANDLORD = 15;
          let requestArray = [];
          requestArray.push(this.updateFaultDetails(faultRequestObj));
          // if (this.faultDetails.status !== AWAITING_RESPONSE_LANDLORD) {
          //   requestArray.push(this.updateFaultStatus(AWAITING_RESPONSE_LANDLORD));
          // }
          forkJoin(requestArray).subscribe(data => {
            this._btnHandler('refresh');
            // this.commonService.showLoader();
            setTimeout(async () => {
              await this.checkFaultNotifications(this.faultDetails.faultId);
              this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
              this.getPendingHours();
              if (this.cliNotification && this.cliNotification.responseReceived && this.cliNotification.responseReceived.isAccepted) {
                // this.selectStageStepper(FAULT_STAGES.JOB_COMPLETION);
                this._btnHandler('changeStepToJobCompl');
              }
              this.proceeding = false;
            }, 3000);
          });
        } else {
          this.proceeding = false;
        }
        break;
      case LL_INSTRUCTION_TYPES[3].index: //cli006d
        if (this.landlordInstFrom.invalid) {
          this.landlordInstFrom.markAllAsTouched();
          this.proceeding = false;
          return;
        }
        var response = await this.commonService.showConfirm('Landlord Instructions', `You have selected the "Obtain Landlord's Authorisation" action. This will send out a notification to Landlord. <br/> Are you sure?`, '', 'Yes', 'No');
        if (response) {
          if (this.cliNotification && (this.cliNotification.responseReceived == null || this.cliNotification.responseReceived.isAccepted == null) && !this.cliNotification.isVoided && this.isUserActionChange) {
            let voidResponce = await this.voidNotification();
            if (!voidResponce) return;
          }
          faultRequestObj.stage = FAULT_STAGES.LANDLORD_INSTRUCTION;
          faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
          faultRequestObj.stageAction = this.userSelectedActionControl.value;
          faultRequestObj.nominalCode = this.landlordInstFrom.value.nominalCode.nominalCode;
          faultRequestObj.requiredStartDate = this.commonService.getFormatedDate(new Date(this.landlordInstFrom.value.requiredStartDate));
          faultRequestObj.requiredCompletionDate = this.commonService.getFormatedDate(new Date(this.landlordInstFrom.value.requiredCompletionDate));
          faultRequestObj.orderedById = this.loggedInUserData.userId;
          const AWAITING_RESPONSE_LANDLORD = 15;
          let requestArray = [];
          requestArray.push(this.updateFaultDetails(faultRequestObj));
          // if (this.faultDetails.status !== AWAITING_RESPONSE_LANDLORD) {
          //   requestArray.push(this.updateFaultStatus(AWAITING_RESPONSE_LANDLORD));
          // }
          forkJoin(requestArray).subscribe(data => {
            this._btnHandler('refresh');
            // this.commonService.showLoader();
            setTimeout(async () => {
              let notification = await this.checkFaultNotifications(this.faultDetails.faultId);
              this.cliNotification = await this.filterNotifications(notification, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[3].index);
              this.getPendingHours();
              if (this.cliNotification && this.cliNotification.responseReceived) {
                if (this.cliNotification.responseReceived.isAccepted) {
                  this.userSelectedActionControl.setValue(LL_INSTRUCTION_TYPES[1].index);
                } else {
                  this.userSelectedActionControl.setValue(LL_INSTRUCTION_TYPES[2].index);
                }
              }
            }, 3000);
          });
        } else {
          this.proceeding = false;
        }
        break;
      case LL_INSTRUCTION_TYPES[4].index: //cli006f
        if (this.landlordInstFrom.controls['contractor'].invalid) {
          this.proceeding = false;
          return;
        }
        if (this.cliNotification && (this.cliNotification.responseReceived == null || this.cliNotification.responseReceived.isAccepted == null) && !this.cliNotification.isVoided && this.isUserActionChange) {
          let voidResponce = await this.voidNotification();
          if (!voidResponce) return;
        }
        if (this.landlordInstFrom.get('confirmedEstimate').value > 0) {
          faultRequestObj.stage = FAULT_STAGES.LANDLORD_INSTRUCTION;
          faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
          faultRequestObj.stageAction = this.userSelectedActionControl.value;
          let res = await this.updateFaultDetails(faultRequestObj);
          if (res) {
            await this._btnHandler('refresh');
            this.checkForLLSuggestedAction();
          }
          this.proceeding = false;
        } else {
          this.proceeding = false;
          if (this.landlordInstFrom.get('confirmedEstimate').hasError('pattern')) {
            this.commonService.showAlert('Get an Estimate?', 'Please fill the valid confirmed estimate.');
          } else {
            this.commonService.showAlert('Get an Estimate?', 'Please fill the confirmed estimate.');
          }

        }
        break;
      default:
        this.proceeding = false;
        this.commonService.showAlert('Landlord Instructions', 'Please select any action');
        break;
    }
  }

  async voidNotification() {
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isVoided = true;
    notificationObj.submittedByType = 'SECUR_USER';
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateNotification(this.cliNotification.faultNotificationId, notificationObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          this.proceeding = false;
          resolve(false);
        }
      );
    });
    return promise;
  }

  private updateFaultDetails(requestObj): Promise<any> {
    requestObj.submittedByType = 'SECUR_USER';
    requestObj.submittedById = '';
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFault(this.faultDetails.faultId, requestObj).subscribe(
        res => {
          // this.commonService.showMessage('Fault details have been updated successfully.', 'Fault Summary', 'success');
          resolve(true);
        },
        error => {
          reject(error)
        }
      );
    });
    return promise;
  }

  private updateFaultStatus(status): Promise<any> {
    return this.faultsService.updateFaultStatus(this.faultDetails.faultId, status).toPromise();
  }


  private updateFaultSummary() {
    let faultRequestObj = this.createFaultFormValues();
    faultRequestObj.stage = this.faultDetails.stage;
    faultRequestObj.isDraft = true;
    faultRequestObj.submittedByType = 'SECUR_USER';
    faultRequestObj.submittedById = '';
    faultRequestObj.stage = this.faultDetails.stage;
    faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
    // Object.assign(faultRequestObj, this.landlordInstFrom.value);
    faultRequestObj.contractor = this.landlordInstFrom.value.contractor;
    faultRequestObj.confirmedEstimate = this.landlordInstFrom.value.confirmedEstimate;
    faultRequestObj.nominalCode = this.landlordInstFrom.value.nominalCode;
    faultRequestObj.requiredStartDate = this.commonService.getFormatedDate(new Date(this.landlordInstFrom.value.requiredStartDate));
    faultRequestObj.requiredCompletionDate = this.commonService.getFormatedDate(new Date(this.landlordInstFrom.value.requiredCompletionDate));
    faultRequestObj.estimationNotes = this.landlordInstFrom.value.estimationNotes;
    if (this.contractorEntityId) {
      faultRequestObj.contractorId = this.contractorEntityId;
    } else {
      delete faultRequestObj.contractorId;
    }

    this.faultsService.updateFault(this.faultDetails.faultId, faultRequestObj).subscribe(
      res => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Fault details have been updated successfully.', 'Fault Summary', 'success');
        this._btnHandler('cancel');
      },
      error => {
        this.saving = false;
      }
    );
  }

  private createFaultFormValues(): any {
    let faultDetails = {
      // urgencyStatus: this.landlordInstFrom.get('urgencyStatus').value,
      category: this.describeFaultForm.get('category').value,
      title: this.describeFaultForm.get('title').value,
      // notes: this.landlordInstFrom.get('notes').value,
      isTenantPresenceRequired: this.accessInfoForm.get('isTenantPresenceRequired').value,
      areOccupiersVulnerable: this.accessInfoForm.get('areOccupiersVulnerable').value,
      tenantNotes: this.accessInfoForm.get('tenantNotes').value,
      sourceType: "FAULT",
      // additionalInfo: this.landlordInstFrom.get('additionalInfo').value
    }
    return faultDetails;
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

  private getUserDetails() {
    return new Promise((resolve, reject) => {
      this.faultsService.getUserDetails().subscribe((res) => {
        let data = res ? res.data[0] : '';
        this.loggedInUserData = data;
        this.landlordInstFrom.get('orderedBy').setValue(data.name);
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
          this.preferredSuppliers = res && res.data ? res.data : [];
          resolve(this.preferredSuppliers);
        },
        error => {
          reject(null);
        }
      );
    });
    return promise;
  }

  async checkFaultNotifications(faultId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getFaultNotifications(faultId).subscribe(async (response) => {
        this.faultNotifications = response && response.data ? response.data : [];
        resolve(this.faultNotifications);
      }, error => {
        reject(error)
      });
    });
  }

  private filterNotifications(data, stage, action) {
    const promise = new Promise((resolve, reject) => {
      let filtereData = null;
      let currentStage = stage;
      let currentAction = action;
      if (data.length == 0)
        resolve(null);
      filtereData = data.filter((x => x.faultStage === currentStage)).filter((x => x.faultStageAction === currentAction)).filter((x => x.isResponseExpected));
      if (filtereData.length == 0)
        resolve(null);
      // if (filtereData[0].firstEmailSentAt) {
      filtereData = filtereData.sort((a, b) => {
        return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
      });
      filtereData[0].chase = filtereData[0].numberOfChasesDone + 1;
      resolve(filtereData[0]);
      // } else {
      //   resolve(filtereData[0]);
      // }
    });
    return promise;
  }

  setUserAction(index) {
    this.isUserActionChange = true;
    this.isAuthorizationfields = false;
    this.userSelectedActionControl.setValue(index);
    if (index === 'OBTAIN_AUTHORISATION') {
      this.addValidations();
    } else {
      this.removeValidation();
    }
  }

  private addValidations() {
    this.isAuthorizationfields = true;
    this.landlordInstFrom.get('nominalCode').setValidators(Validators.required);
    this.landlordInstFrom.get('nominalCode').updateValueAndValidity();
    this.landlordInstFrom.get('requiredStartDate').setValidators(Validators.required);
    this.landlordInstFrom.get('requiredStartDate').updateValueAndValidity();
    this.landlordInstFrom.get('requiredCompletionDate').setValidators(Validators.required);
    this.landlordInstFrom.get('requiredCompletionDate').updateValueAndValidity();
    this.landlordInstFrom.get('confirmedEstimate').setValidators(Validators.required);
    this.landlordInstFrom.get('confirmedEstimate').updateValueAndValidity();
    this.landlordInstFrom.get('contractor').setValidators(Validators.required);
    this.landlordInstFrom.get('contractor').updateValueAndValidity();
  }

  private removeValidation() {
    this.isAuthorizationfields = false;
    this.landlordInstFrom.clearValidators();
    this.landlordInstFrom.updateValueAndValidity()
    this.landlordInstFrom.patchValue({
      nominalCode: null,
      requiredStartDate: null,
      requiredCompletionDate: null
    })
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




  async questionAction(data) {
    if ((this.cliNotification && this.cliNotification.responseReceived != null) || this.faultDetails.isClosed) {
      return;
    }
    if (this.cliNotification.faultStageAction === LL_INSTRUCTION_TYPES[0].index) {
      if (this.cliNotification.templateCode === 'LC-L-E') {
        this.questionActionJobComplete(data);
      } else {
        this.questionActionDoesOwnRepair(data);
      }
    }
    else if (this.cliNotification.faultStageAction === LL_INSTRUCTION_TYPES[3].index) {
      this.questionActionLandlordAuth(data);
    }
  }

  private questionActionDoesOwnRepair(data) {
    if (!data.value) {
      this.commonService.showConfirm(data.text, 'The fault status will change to "Escalation". </br> Are you sure?', '', 'Yes', 'No').then(async res => {
        if (res) {
          this.commonService.showLoader();
          await this.updateFaultNotification(data.value, this.cliNotification.faultNotificationId);
          this._btnHandler('refresh');
          await this.checkFaultNotifications(this.faultDetails.faultId);
          this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
          this.getPendingHours();
        }
      });
    }
    else if (data.value) {
      this.commonService.showConfirm(data.text, 'This will change the status to "Work in Progress". </br> Are you sure?', '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(data.value, this.cliNotification.faultNotificationId);
          this._btnHandler('refresh');
          await this.checkFaultNotifications(this.faultDetails.faultId);
          this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
          this.getPendingHours();
        }
      });
    }
  }

  private async questionActionLandlordAuth(data) {
    if (!data.value) {
      this.commonService.showConfirm(data.text, 'Are you sure?', '', 'Yes', 'No').then(async res => {
        if (res) {
          this.commonService.showLoader();
          await this.updateFaultNotification(data.value, this.cliNotification.faultNotificationId);
          this._btnHandler('refresh');
          await this.checkFaultNotifications(this.faultDetails.faultId);
          this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[3].index);
          if (this.cliNotification && this.cliNotification.responseReceived) {
            if (this.cliNotification.responseReceived.isAccepted) {
              this.userSelectedActionControl.setValue(LL_INSTRUCTION_TYPES[1].index);
            } else {
              this.userSelectedActionControl.setValue(LL_INSTRUCTION_TYPES[2].index);
            }
          }
        }
      });
    }
    else if (data.value) {
      const rules = await this.getWorksOrderPaymentRules() as FaultModels.IFaultWorksorderRules;
      if (!rules) { return; }
      this.commonService.showLoader();
      const actionType = WORKSORDER_RAISE_TYPE.AUTO_LL_AUTH;
      const paymentRequired = await this.checkForPaymentRules(rules, actionType, data.text);
      if (paymentRequired !== undefined) {
        await this.updateFaultNotification(data.value, this.cliNotification.faultNotificationId);
        this._btnHandler('refresh');
        await this.checkFaultNotifications(this.faultDetails.faultId);
        this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[3].index);
      }
    }
  }

  private questionActionJobComplete(data) {
    if (!data.value) {
      this.commonService.showConfirm(data.text, 'Are you sure to arrange a contractor?', '', 'Yes', 'No').then(async res => {
        if (res) {
          this.commonService.showLoader();
          await this.updateFaultNotification(data.value, this.cliNotification.faultNotificationId);
          this._btnHandler('refresh');
          await this.checkFaultNotifications(this.faultDetails.faultId);
          this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
          this.getPendingHours();
        }
      });
    }
    else if (data.value) {
      this.openJobCompletionModal('Are you sure the repair is complete?');
    }
  }


  async openJobCompletionModal(title) {
    const modal = await this.modalController.create({
      component: JobCompletionModalPage,
      cssClass: 'modal-container',
      componentProps: {
        faultNotificationId: this.cliNotification.faultNotificationId,
        heading: 'Mark the Job Complete',
        title: title
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this._btnHandler('refresh');
        await this.checkFaultNotifications(this.faultDetails.faultId);
        this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
        this.getPendingHours();
      }
    });
    await modal.present();
  }





  private getContractorDetails(contractorId) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getContractorDetails(contractorId).subscribe(res => {
        resolve(res);
      }, error => {
        reject(null);
      });
    });
    return promise;
  }

  private async updateFaultNotification(data, faultNotificationId): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      let notificationObj = {} as FaultModels.IUpdateNotification;
      notificationObj.isAccepted = data;
      notificationObj.submittedByType = 'SECUR_USER';
      this.faultsService.updateNotification(faultNotificationId, notificationObj).subscribe(
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
      if (this.faultDetails.nominalCode) {
        this.landlordInstFrom.get('nominalCode').setValue(code);
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



  async faultNotification(action) {
    let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
    this.cliNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, action);
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
      this.faultsService.saveWorksOrderCompletion(notificationObj, this.cliNotification.faultNotificationId).subscribe(
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
    if (this.cliNotification &&
      (this.cliNotification.responseReceived != null) && //this.cliNotification.responseReceived.isAccepted &&
      this.cliNotification.templateCode === 'CDT-C-E (WO)' && this.faultDetails.contractorWoPropertyVisitAt) {
      const woAgreedDateTime = this.commonService.getFormatedDate(this.faultDetails.contractorWoPropertyVisitAt, 'yyyy-MM-dd');
      const today = this.commonService.getFormatedDate(new Date(), 'yyyy-MM-dd');
      if (today >= woAgreedDateTime) {
        enable = true;
      }
    }
    return enable;
  }

  getPendingHours() {
    let hours = 0;
    const currentDateTime = this.commonService.getFormatedDateTime(new Date());
    if (this.cliNotification && !this.faultDetails.isEscalated && this.cliNotification.nextChaseDueAt) {
      let msec = new Date(this.cliNotification.nextChaseDueAt).getTime() - new Date(currentDateTime).getTime();
      let mins = Math.floor(msec / 60000);
      let hrs = Math.floor(mins / 60);
      if (hrs >= 0) {
        this.cliNotification.hoursLeft = hrs != 0 ? `${hrs} hours` : `${mins} minutes`;
      }
    }
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
      if (res.data && res.data == 'success') {
        return true;
      } else {
        this._btnHandler('refresh');
      }
    });

  }


  onSearchChange(event: any) {
    this.isContractorSearch = true;
    const searchString = event.target.value;
    if (searchString.length > 2) {
      this.resultsAvailable = true;
    } else {
      this.resultsAvailable = false;
    }
  }

  contractorSelected(selected: any): void {
    const fullName = selected && selected?.fullName ? selected?.fullName + ',' : '';
    this.landlordInstFrom.get('contractor').setValue(selected ? fullName + selected?.reference : undefined);
    this.resultsAvailable = false;
    this.contractorEntityId = selected.entityId;

    //FF-712 - CONTRACTOR VALIDATIONS
    if (this.isContractorSearch) {
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
        this.landlordInstFrom.controls['contractor'].setErrors({ invalidContractor: true, message: 'An Agreement with the Contractor doesn’t exist' });
      }

      if (selected?.supplierLiabilityExpiryDate === null || selected?.supplierLiabilityExpiryDate < currentDate) {
        this.landlordInstFrom.controls['contractor'].setErrors({ invalidContractor: true, message: 'Supplier liability insurance date is not active' });
      }
    }
  }

  private async checkForPaymentRules(rules, actionType, title) {
    const paymentRequired = this.faultsService.isWorksOrderPaymentRequired(rules);
    const stageAction = title;
    if (paymentRequired) {
      let amountThreshold = await this.getSystemOptions(SYSTEM_OPTIONS.REPAIR_ESTIMATE_QUOTE_THRESHOLD);
      let paymentWarnings = this.commonService.getPaymentWarnings(rules, amountThreshold);

      let obj: any = {
        title: title,
        stageAction: stageAction,
        paymentWarnings: paymentWarnings,
        isWoRaised: false,
        faultId: this.faultDetails.faultId,
        maintenanceId: '',
        isDraft: this.faultDetails.isDraft,
        stage: this.faultDetails.stage,
        actionType: actionType,
        faultNotificationId: this.cliNotification ? this.cliNotification.faultNotificationId : ''
      }

      let response: any = await this.paymentRequestModal(obj);

      if (response) {
        return paymentRequired;
      }
    } else {
      const response = await this.commonService.showConfirm(stageAction,
        `You have selected "${stageAction}".<br/><br/>
         This will raise the worksorder. Are you sure?`, '', 'Yes', 'No');
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

  private getWorksOrderPaymentRules(actionType = WORKSORDER_RAISE_TYPE.AUTO) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getWorksOrderPaymentRules(this.faultDetails.faultId).subscribe(
        res => {
          resolve(res);
        },
        error => {
          if (error.error && error.error.hasOwnProperty('errorCode')) {
            resolve(null);
          } else {
            resolve(null);
          }
        }
      );
    });
    return promise;
  }

  async presentRepairCategories(ev: any) {
    if(this.landlordDetails.repairCategoriesText && !this.landlordDetails.repairCategoriesText.length){
      this.commonService.showAlert('Repair Categories', 'No data found');
      return;
    }
    const popover = await this.popoverController.create({
      component: SimplePopoverPage,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
      componentProps: {
        data: this.landlordDetails.repairCategoriesText
      },
    });
    return await popover.present();
  }

  async llContractor() {
    if (!this.isContractorModal) {
      this.isContractorModal = true;
      const modal = await this.modalController.create({
        component: ContractorDetailsModalPage,
        cssClass: 'modal-container ll-contractor-modal',
        componentProps: {
          faultId: this.faultDetails.faultId,
          landlordId: this.landlordDetails.landlordId,
          llContractorDetails: this.faultDetails.landlordOwnContractor,
          estimatedVisitAt: this.faultDetails.estimatedVisitAt
        },
        backdropDismiss: false
      });
      modal.onDidDismiss().then(async res => {
        this.isContractorModal = false;
        if (res.data && res.data == 'success') {
          this._btnHandler('refresh');
        }
      });

      await modal.present();
    }
  }

  snoozeFault(){
    this._btnHandler('snooze');
  }
}