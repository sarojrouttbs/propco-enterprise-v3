import { ModalController, PopoverController } from '@ionic/angular';
import { SearchPropertyPage } from './../../shared/modals/search-property/search-property.page';
import { REPORTED_BY_TYPES, PROPCO, FAULT_STAGES, ERROR_MESSAGE, ACCESS_INFO_TYPES, LL_INSTRUCTION_TYPES, FAULT_STAGES_INDEX, REGEX, FOLDER_NAMES, DOCUMENTS_TYPE, FILE_IDS, DPP_GROUP, MAX_DOC_UPLOAD_SIZE, SYSTEM_OPTIONS, WORKSORDER_RAISE_TYPE, FAULT_STAGES_ACTIONS, MAINT_SOURCE_TYPES, DEFAULTS, DATE_FORMAT } from './../../shared/constants';
import { Component, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../faults.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepper } from '@angular/material/stepper';
import { debounceTime, delay, switchMap } from 'rxjs/operators';
import { SimplePopoverPage } from 'src/app/shared/popover/simple-popover/simple-popover.page';
import { ContractorDetailsModalPage } from 'src/app/shared/modals/contractor-details-modal/contractor-details-modal.page';
import { PendingNotificationModalPage } from 'src/app/shared/modals/pending-notification-modal/pending-notification-modal.page';
import { DOCUMENT } from '@angular/common';
import { JobCompletionModalPage } from 'src/app/shared/modals/job-completion-modal/job-completion-modal.page';
import { IonicSelectableComponent } from 'ionic-selectable';
import { PaymentRequestModalPage } from 'src/app/shared/modals/payment-request-modal/payment-request-modal.page';
import { SnoozeFaultModalPage } from './details-modal/snooze-fault-modal/snooze-fault-modal.page';

@Component({
  selector: 'fault-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss', '../../shared/drag-drop.scss'],
})
export class DetailsPage {
  @ViewChild('stepper', { static: false }) stepper: MatStepper;
  currentStepperIndex = 0;
  faultCategories: any[] = [];
  pageNo = 1;
  propertyId = null;
  propertyDetails: any = {};
  propertyTenancyList: any[];
  propertyHMODetails: any[] = [];
  faultHistory;
  addtionalInfo;
  files: any = [];
  describeFaultForm: FormGroup;
  faultDetailsForm: FormGroup;
  addAdditionalDetForm: FormGroup;
  reportedByForm: FormGroup;
  accessInfoForm: FormGroup;
  uploadDocForm: FormGroup;
  landlordInstFrom: FormGroup;
  arrangeContractorForm: FormGroup;

  selectedContractor: Observable<FaultModels.IContractorResponse>;

  //MAT TABS//
  caseDetail: FormGroup;
  reported: FormGroup;
  accessInfo: FormGroup;
  manageMedia: FormGroup;
  selected = new FormControl(0);
  current = 0;
  previous;
  isCaseDetailSubmit;
  isReportedSubmit;
  isAccessInfoSubmit;
  isManageMediaSubmit;
  //MAT TABS//
  categoryMap = new Map();
  faultId: string;
  accessInfoList = ACCESS_INFO_TYPES;
  faultUrgencyStatuses: any[];
  reportedByTypes = REPORTED_BY_TYPES;
  lookupdata: any;
  agreementStatuses: any[];
  landlordsOfproperty: any[];
  faultReportedByThirdParty: any[];
  faultStatuses: any[];
  faultRoomTypes: any[];
  propertyTenants: any[] = [];
  allGuarantors: any[] = [];
  tenantIds: any[] = [];
  preferredSuppliers: any[] = [];
  tenantArrears: any;
  faultDetails: FaultModels.IFaultResponse;
  landlordDetails: any;
  landlordDppRepairDetails: any;
  isEditable = false;
  landlordInstructionTypes = LL_INSTRUCTION_TYPES;
  suggestedAction; oldUserSelectedAction;
  faultNotifications: any;
  cliNotification: any;
  isMatch;
  userSelectedActionControl = new FormControl();
  private QUOTE_THRESOLD = 500;
  quoteDocuments: any;

  resultsAvailable: boolean = false;
  results: string[] = [];
  leadTenantId: any;
  folderNames;
  filteredDocuments;
  mediaType: any;
  isUserActionChange = false;
  showSkeleton = true;
  MAX_DOC_UPLOAD_LIMIT;
  FAULT_STAGES = FAULT_STAGES;
  isAuthorizationfields = false;
  DEFAULTS = DEFAULTS;
  agreementDetails;

  categoryIconList = [
    'assets/images/fault-categories/alarms-and-smoke-detectors.svg',
    'assets/images/fault-categories/bathroom.svg',
    'assets/images/fault-categories/electricity.svg',
    'assets/images/fault-categories/fire.svg',
    'assets/images/fault-categories/floors-walls-and-ceilings .svg',
    'assets/images/fault-categories/garden.svg',
    'assets/images/fault-categories/hot-water.svg',
    'assets/images/fault-categories/kitchen.svg',
    'assets/images/fault-categories/lighting.svg',
    'assets/images/fault-categories/others.svg',
    'assets/images/fault-categories/smell-oil-or-gas.svg',
    'assets/images/fault-categories/toilet.svg',
    'assets/images/fault-categories/others.svg',
    'assets/images/fault-categories/water-and-leaks.svg'
  ];
  contractorEntityId: any;
  pendingNotification: any;
  isContractorSearch = false;
  folderName: any;
  saving: boolean = false;
  proceeding: boolean = false;
  submitting: boolean = false;
  progressing: boolean = false;
  isContractorModal = false;
  fileIds = FILE_IDS;
  nominalCodes;
  nominalCodeSubscription: Subscription;
  codes: FaultModels.NominalCode[];
  page = 2;
  currentDate = this.commonService.getFormatedDate(new Date());
  loggedInUserData: any;
  isPropertyCardReady: boolean = false;
  hasPropertyCheckedIn: any;
  faultNotificationDetails: any[];
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private faultsService: FaultsService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    public sanitizer: DomSanitizer,
    private popoverController: PopoverController,
    @Inject(DOCUMENT) private _document: Document
  ) {
  }

  ionViewDidEnter() {
    this.propertyId = this.route.snapshot.queryParamMap.get('pId');
    this.faultId = this.route.snapshot.paramMap.get('id');
    this.initiateFault();
    this.mediaType = 'upload'
  }

  initiateFault() {
    if (!this.propertyId && !this.faultId) {
      this.searchProperty();
    } else {
      this.getLookupData();
      this.initiateForms();
      this.initialApiCall();
    }
  }

  displayFn(subject) {
    return subject ? subject.fullName + ',' + ' ' + subject.reference : undefined;
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
    this.agreementStatuses = data.agreementStatuses;
  }

  private setFaultsLookupData(data) {
    this.faultReportedByThirdParty = data.faultReportedByThirdParty;
    this.faultCategories = data.faultCategories;
    this.faultUrgencyStatuses = data.faultUrgencyStatuses;
    this.faultStatuses = data.faultStatuses;
    this.faultRoomTypes = data.faultRoomTypes;
    this.setCategoryMap();
  }

  private initiateForms() {
    this.initDescribeFaultForm();
    this.initFaultDetailsForm();
    this.initaddAdditionalDetForm();
    this.initReportedByForm();
    this.initAccessInfiForm();
    this.initUploadDocForm();
    this.initLandLordInstForm();
    this.initArrangeContratorForm();
  }

  private initDescribeFaultForm(): void {
    this.describeFaultForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(70)]],
      category: ['', Validators.required]
    });
  }

  private initFaultDetailsForm(): void {
    this.faultDetailsForm = this.fb.group({
      notes: ['', Validators.required],
      urgencyStatus: [3, Validators.required],
      additionalInfo: this.fb.array([]),
      roomType: null,
    });
  }

  private initaddAdditionalDetForm(): void {
    this.addAdditionalDetForm = this.fb.group({
      label: ['', Validators.required],
      value: ['', Validators.required],
      id: ''
    });
  }

  private initAccessInfiForm(): void {
    this.accessInfoForm = this.fb.group({
      tenantNotes: '',
      areOccupiersVulnerable: false,
      isTenantPresenceRequired: ['', Validators.required]
    });
  }

  private initReportedByForm(): void {
    this.reportedByForm = this.fb.group({
      reportedBy: ['TENANT', Validators.required],
      agreementId: ['', Validators.required],
      reportedById: ['', Validators.required],
      propertyId: '',
      isDraft: false,
      // tenantId: ['', Validators.required],
      title: [{ value: '', disabled: true }],
      forename: [{ value: '', disabled: true }],
      surname: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      mobile: [{ value: '', disabled: true }],
      alternativeNo: [{ value: '', disabled: true }],
      selectedEntity: ['', Validators.required],
    });
  }

  private initUploadDocForm(): void {
    this.uploadDocForm = this.fb.group({
      photos: this.fb.array([])
    });
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

  private initArrangeContratorForm(): void {
    this.arrangeContractorForm = this.fb.group({
      quotationNum: ['', Validators.required],
      category: [{ value: '', disabled: true }, Validators.required],
      status: ['', Validators.required],
      descption: ['', Validators.required],
      orderedBy: [{ value: '', disabled: true }, Validators.required],
      requiredBy: '',
      contactOnSite: '',
      accessDetails: [{ value: '', disabled: true }],
      nominalCode: ['', Validators.required],
      contractor: '',
      skillSet: ''
    });
  }


  private async initialApiCall() {
    if (this.faultId) {
      this.goToPage(3);
      const details: any = await this.getFaultDetails();
      if (details) {
        this.selectStageStepper(details.stage);
        this.faultDetails = details;
        this.getStageIndex(this.faultDetails);
        this.propertyId = details.propertyId;
        this.contractorEntityId = details.contractorId;
        this.oldUserSelectedAction = this.faultDetails.userSelectedAction;
        this.userSelectedActionControl.setValue(this.faultDetails.userSelectedAction);
        this.files = await this.getFaultDocuments(this.faultId);
        this.filterDocsByStage(this.faultDetails);
        this.getFaultHistory();
        if (this.contractorEntityId) {
          this.isContractorSearch = false;
          let contractorDetails: any = await this.getContractorDetails(this.contractorEntityId);
          if (contractorDetails) {
            contractorDetails.fullName = contractorDetails.name;
            this.contractorSelected(contractorDetails);
          }
        }
        this.getNominalCodes();
      }
    } else {
      this.faultDetails = <FaultModels.IFaultResponse>{};
      this.faultDetails.status = 1;
      this.faultDetails.stageIndex = -1
    }
    forkJoin([
      this.getPropertyById(),
      this.getFaultAdditionalInfo(),
      this.getHMOLicenceDetails(),
      this.getMaxDocUploadLimit(),
      this.getPropertyTenancies()
    ]).subscribe(async (values) => {
      this.checkIfPropertyCheckedIn();
      if (this.faultId) {
        this.initPatching();
        this.setValidatorsForReportedBy();
        this.getUserDetails();
        if (this.faultDetails.userSelectedAction === 'OBTAIN_AUTHORISATION') {
          this.isAuthorizationfields = true;
        }
        if (this.faultDetails.reportedBy === 'LANDLORD') {
          await this.getReportedByIdList();
        } else {
          this.getReportedByIdList();
          await this.getLandlordsOfProperty(this.propertyId);
        }
        let landlordId;
        if (this.landlordsOfproperty.length > 1) {
          let landlord = this.getMaxRentShareLandlord(this.landlordsOfproperty);
          landlordId = landlord.landlordId
        } else {
          landlordId = this.landlordsOfproperty[0].landlordId;
        }
        await this.getLandlordDetails(landlordId);
        this.getLandlordDppDetails(landlordId);
        await this.checkForLLSuggestedAction();
        this.getPreferredSuppliers(landlordId);
        this.matchCategory();
        this.getFaultNotificationId();
      }
      this.showSkeleton = false;
    });

  }

  private checkIfPropertyCheckedIn() {
    if (this.propertyTenancyList && this.propertyTenancyList.length) {
      let keepgoing: boolean = true;
      this.propertyTenancyList.forEach((res, index, array) => {
        if (index === (array.length - 1)) {
          this.isPropertyCardReady = true;
        }
        if (keepgoing) {
          if (res.hasCheckedIn) {
            this.propertyDetails.isPropertyCheckedIn = true;
            keepgoing = false;
          }
        }
      });
    } else {
      this.isPropertyCardReady = true;
    }
  }

  private getStageIndex(details) {
    if (details) {
      switch (details.stage) {
        case FAULT_STAGES.FAULT_QUALIFICATION: {
          details.stageIndex = 1;
          break;
        }
        case FAULT_STAGES.LANDLORD_INSTRUCTION: {
          details.stageIndex = 2;
          break;
        }
        case FAULT_STAGES.ARRANGING_CONTRACTOR: {
          details.stageIndex = 3;
          break;
        }
        case FAULT_STAGES.JOB_COMPLETION: {
          details.stageIndex = 4;
          break;
        }
        case FAULT_STAGES.PAYMENT: {
          details.stageIndex = 5;
          break;
        }
        default: {
          details.stageIndex = 0;
          break;
        }
      }
    }
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

  selectStageStepper(stage: any) {
    this.proceeding = false;
    switch (stage) {
      case FAULT_STAGES.FAULT_QUALIFICATION: {
        this.changeStep(FAULT_STAGES_INDEX.FAULT_QUALIFICATION);
        break;
      }
      case FAULT_STAGES.LANDLORD_INSTRUCTION: {
        this.changeStep(FAULT_STAGES_INDEX.LANDLORD_INSTRUCTION);
        break;
      }
      case FAULT_STAGES.ARRANGING_CONTRACTOR: {
        this.changeStep(FAULT_STAGES_INDEX.ARRANGING_CONTRACTOR);
        break;
      }
      case FAULT_STAGES.JOB_COMPLETION: {
        this.changeStep(FAULT_STAGES_INDEX.JOB_COMPLETION);
        break;
      }
      case FAULT_STAGES.PAYMENT: {
        this.changeStep(FAULT_STAGES_INDEX.PAYMENT);
        break;
      }
      default: {
        this.changeStep(FAULT_STAGES_INDEX.FAULT_LOGGED);
        break;
      }
    }
  }

  private initPatching(): void {
    if (this.faultDetails.sourceType === MAINT_SOURCE_TYPES.FIXFLO) {
      this.describeFaultForm.controls['category'].clearValidators();
      this.describeFaultForm.controls['category'].updateValueAndValidity();
    }
    this.describeFaultForm.patchValue({
      title: this.faultDetails.title,
      category: this.faultDetails.category
    });

    this.faultDetailsForm.patchValue({
      urgencyStatus: this.faultDetails.urgencyStatus,
      notes: this.faultDetails.notes,
      roomType: this.faultDetails?.roomType
    });
    this.faultDetails.additionalInfo.map((x) => { this.createAdditionalInfo(x, true) });
    this.accessInfoForm.patchValue({
      tenantNotes: this.faultDetails.tenantNotes,
      areOccupiersVulnerable: this.faultDetails.areOccupiersVulnerable,
      isTenantPresenceRequired: this.faultDetails.isTenantPresenceRequired
    });
    let reportedById = (this.faultDetails.reportedBy === 'THIRD_PARTY') ? Number(this.faultDetails.reportedById) : this.faultDetails.reportedById;
    this.reportedByForm.patchValue({
      reportedBy: this.faultDetails.reportedBy,
      agreementId: this.faultDetails.agreementId,
      reportedById: reportedById,
      propertyId: this.faultDetails.propertyId,
      isDraft: this.faultDetails.isDraft
    });
    /*Landlord Instructions*/
    this.landlordInstFrom.patchValue({
      confirmedEstimate: this.faultDetails.confirmedEstimate,
      userSelectedAction: this.faultDetails.userSelectedAction,
      estimationNotes: this.faultDetails.estimationNotes,
      requiredStartDate: this.faultDetails.requiredStartDate,
      requiredCompletionDate: this.faultDetails.requiredCompletionDate
    });
  }

  private setCategoryMap() {
    this.faultCategories.map((cat, index) => {
      this.categoryMap.set(cat.index, cat.value);
      cat.imgPath = this.categoryIconList[index];
    });
  }

  goToPage(pageNo) {
    this.pageNo = pageNo;
  }

  getPropertyById() {
    return new Promise((resolve) => {
      this.faultsService.getPropertyById(this.propertyId).subscribe(
        res => {
          if (res && res.data) {
            this.propertyDetails = res.data;
          } else {
            this.propertyDetails = {};
          }
          resolve(1);
        },
        error => {
          console.log(error);
          resolve(0);
        }
      );
    });
  }

  private getPropertyTenancies() {
    return new Promise((resolve, reject) => {
      this.faultsService.getPropertyTenancies(this.propertyId).subscribe(
        res => {
          if (res && res.data) {
            this.checkIfTenantAgreementExpires(res.data);
            const currentTenancyStatuses = [2, 5, 6];
            this.propertyTenancyList = res.data.filter(x => currentTenancyStatuses.indexOf(x.status) != -1);
            if (this.propertyTenancyList && this.propertyTenancyList.length) {
              for (let i = 0; i < this.propertyTenancyList.length; i++) {
                const tenants = this.propertyTenancyList[i].tenants;
                let tenantIdList = tenants.filter(data => data.tenantId).map(d => d.tenantId);
                this.tenantIds = this.tenantIds.concat(tenantIdList);
                let tenantData = tenants.find(data => data.isLead === true);
                if (tenantData) {
                  this.leadTenantId = tenantData.tenantId;
                  this.hasPropertyCheckedIn = this.propertyTenancyList[i].hasCheckedIn;
                }
              }
            }
          }
          if (this.tenantIds && this.tenantIds.length) {
            this.getTenantArrears(this.tenantIds);
          }
          resolve(true);
        },
        error => {
          reject();
        }
      );
    });
  }

  private deleteAdditionalInfo(infoId: string) {
    return new Promise((resolve) => {
      this.faultsService.deleteAdditionalInfo(infoId).subscribe(
        res => {
          resolve(true);
        },
        error => {
          console.log(error);
          resolve(false);
        }
      );
    });
  }

  private addAdditionalInfo(faultId: string, requestObj: any) {
    return new Promise((resolve) => {
      this.faultsService.addAdditionalInfo(faultId, requestObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          console.log(error);
          resolve(true);
        }
      );
    });
  }

  private updateAdditionalInfo(id: string, requestObj: any) {
    return new Promise((resolve) => {
      this.faultsService.updateAdditionalInfo(id, requestObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          console.log(error);
          resolve(true);
        }
      );
    });
  }

  private onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  private getTenantArrears(tenantId) {
    const uniqueSet = tenantId.filter(this.onlyUnique);
    let apiObservableArray = [];
    uniqueSet.forEach(id => {
      apiObservableArray.push(this.faultsService.getTenantArrearsDetails(id));
    });
    forkJoin(apiObservableArray).subscribe(res => {
      if (res) {
        this.returnTenantArrears(res);
      }
    });
  }

  private returnTenantArrears(res) {
    let arrearResponse = res.map(data => data.rentArrears);
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    this.tenantArrears = arrearResponse.reduce(reducer);
    this.propertyDetails.tenantArrears = this.tenantArrears;
  }


  private getHMOLicenceDetails() {
    return new Promise((resolve, reject) => {
      this.faultsService.getHMOLicenceDetailsAgainstProperty(this.propertyId).subscribe(
        res => {
          if (res && res.data) {
            this.propertyHMODetails = res.data;
          }
          resolve(true);
        },
        error => {
          console.log(error);
          reject();
        }
      );
    });
  }

  private getFaultHistory() {
    return new Promise((resolve, reject) => {
      this.faultsService.getFaultHistory(this.faultId).subscribe(
        res => {
          if (res) {
            this.faultHistory = res;
          }
          resolve(true);
        },
        error => {
          console.log(error);
          reject();
        }
      );
    });
  }

  private getFaultAdditionalInfo() {
    return new Promise((resolve, reject) => {
      this.faultsService.getFaultAdditionalInfo().subscribe(
        res => {
          if (res) {
            this.addtionalInfo = res;
          }
          resolve(true);
        },
        error => {
          reject();
        }
      );
    });
  }

  private getLandlordsOfProperty(propertyId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getLandlordsOfProperty(propertyId).subscribe(
        res => {
          /*filter out LL which have link with the property*/
          this.landlordsOfproperty = res && res.data ? res.data.filter((llDetail => llDetail.propertyLinkStatus === 'Current')) : [];
          resolve(this.landlordsOfproperty);
        },
        error => {
          console.log(error);
          reject(null);
        }
      );
    });
  }

  private getPropertyTenants(propertyId, agreementId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getPropertyTenants(propertyId, agreementId).subscribe(
        res => {
          this.propertyTenants = res && res.data ? res.data : [];
          resolve(this.propertyTenants);
        },
        error => {
          console.log(error);
          reject(null);
        }
      );
    });
  }

  private checkIfTenantAgreementExpires(propertyAgreements: any) {
    let tenantAgreementExpired = false;
    let tenantAgreementDetails;
    if (propertyAgreements) {
      let agreement = propertyAgreements.filter(x => x.agreementId == this.faultDetails?.agreementId);
      if (agreement && agreement.length) {
        let tenant = agreement[0]?.tenants.filter(t => t.tenantId == this.faultDetails?.tenantId);
        if (tenant && tenant.length) {
          const currentTenancyStatuses = [2, 5, 6];
          if (currentTenancyStatuses.indexOf(agreement[0]?.agreementStatus) == -1) {
            tenantAgreementExpired = true;
            tenantAgreementDetails = {
              name: tenant[0]?.displayAs ? tenant[0]?.displayAs : tenant[0]?.addressee,
              end: agreement[0]?.tenancyEndDate
            }
          }
        }
      }
    }

    this.agreementDetails = { details: tenantAgreementDetails, expired: tenantAgreementExpired };
  }

  private getTenantsGuarantors(tenantId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getTenantGuarantors(tenantId).subscribe(
        res => {
          const guarantorList = res && res.data ? res.data : [];
          this.allGuarantors = this.allGuarantors.concat(guarantorList);
          resolve(res);
        },
        error => {
          console.log(error);
          reject();
        }
      );
    });
  }

  private getFaultDetails() {
    return new Promise((resolve) => {
      this.faultsService.getFaultDetails(this.faultId).subscribe(
        res => {
          if (res) {
            resolve(res);
          }
        },
        error => {
          console.log(error);
          resolve(null);
        }
      );
    });
  }

  private getLandlordDetails(landlordId) {
    return new Promise((resolve, reject) => {
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
  }

  private getLandlordDppDetails(landlordId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getLandlordDppDetails(landlordId).subscribe(
        res => {
          let dppDetails = res ? res.data : [];
          this.landlordDppRepairDetails = dppDetails.find(dpp => dpp.dppGroup === DPP_GROUP.REPAIR_N_MAINTENANCE);
          resolve(this.landlordDppRepairDetails);
        },
        error => {
          reject(null);
        }
      );
    });
  }

  private getPreferredSuppliers(landlordId) {
    return new Promise((resolve, reject) => {
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
  }

  private getContractorDetails(contractorId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getContractorDetails(contractorId).subscribe(res => {
        resolve(res);
      }, error => {
        reject(null);
      });
    });
  }

  getUploadedFile(files: FileList) {
    this.submit(files);
  }

  removeFile(data, i) {
    if (this.faultDetails.faultId) {
      let index = this.uploadDocForm.controls.photos.value.findIndex(x => x.uId == data.uId);
      this.files.splice(i, 1);
      this.photos.removeAt(index);
    }
    else {
      this.files.splice(i, 1);
      this.photos.removeAt(i);
    }
  }

  private createItem(data): FormGroup {
    return this.fb.group(data);
  }

  get photos(): FormArray {
    return this.uploadDocForm.get('photos') as FormArray;
  }

  submit(files) {
    if (files) {
      for (let file of files) {
        if (this.validateUploadLimit(file)) {
          let isImage = false;
          let date = Date.now();
          if (file.type.split('/')[0] !== 'image') {
            isImage = false;
          }
          else if (file.type.split('/')[0] == 'image') {
            isImage = true;
          }
          this.photos.push(this.createItem({
            file: file,
            uId: date
          }));
          let reader = new FileReader();
          if (isImage) {
            reader.onload = (e: any) => {
              this.files.push({
                documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result),
                name: file.name,
                uId: date
              })
            }
          }
          else {
            reader.onload = (e: any) => {
              this.files.push({
                documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/default.jpg'),
                name: file.name,
                uId: date
              })
            }
          }
          reader.readAsDataURL(file);
        }
      }
    }
  }


  uploadFiles(faultId, reDir = true) {
    let apiObservableArray = [];
    let uploadedDoc = this.uploadDocForm.controls.photos.value;
    uploadedDoc.forEach(data => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('name', data.file.name);
      formData.append('folderName', FOLDER_NAMES[0]['index']);
      formData.append('headCategory', 'Legal');
      formData.append('subCategory', 'Addendum');
      apiObservableArray.push(this.faultsService.uploadDocument(formData, faultId));
    });
    if (!apiObservableArray.length && reDir) {
      if (!this.faultId) {
        this.router.navigate(['../dashboard'], { replaceUrl: true, relativeTo: this.route });
      } else {
        this.router.navigate(['../../dashboard'], { replaceUrl: true, relativeTo: this.route });
      }
    }
    setTimeout(() => {
      forkJoin(apiObservableArray).subscribe(() => {
        if (reDir) {
          if (!this.faultId) {
            this.router.navigate(['../dashboard'], { replaceUrl: true, relativeTo: this.route });
          } else {
            this.router.navigate(['../../dashboard'], { replaceUrl: true, relativeTo: this.route });
          }
        }
      }, err => {
        if (reDir) {
          if (!this.faultId) {
            this.router.navigate(['../dashboard'], { replaceUrl: true, relativeTo: this.route });
          } else {
            this.router.navigate(['../../dashboard'], { replaceUrl: true, relativeTo: this.route });
          }
        }
      });
    }, 1000);
  }

  getFaultDocuments(faultId: string) {
    return new Promise((resolve) => {
      this.faultsService.getFaultDocuments(faultId).subscribe(response => {
        if (response) {
          resolve(response.data);
        } else {
          resolve([]);
        }
      }, err => {
        resolve([]);
      });
    });
  }

  private filterDocsByStage(details: FaultModels.IFaultResponse) {
    if (details.stage === FAULT_STAGES.JOB_COMPLETION || details.stage === FAULT_STAGES.PAYMENT) {
      this.quoteDocuments = this.files.filter(data => data.folderName === FOLDER_NAMES[4]['index'] || data.folderName === FOLDER_NAMES[5]['index']).filter(data => !data.isRejected);
    }
    else {
      this.quoteDocuments = this.files.filter(data => data.folderName === FOLDER_NAMES[1]['index']).filter(data => !data.isRejected);
    }
    this.prepareDocumentsList();
  }

  //MAT METHODS//
  caseDeatil(): void {
    this.isCaseDetailSubmit = true;
    if (this.faultDetailsForm.invalid) {
      this.faultDetailsForm.markAllAsTouched();
    }
  }

  reportedBy(): void {
    this.isReportedSubmit = true;
    if (this.reportedByForm.invalid) {
      this.reportedByForm.markAllAsTouched();
    }
  }

  saveAccessInfo(): void {
    this.isAccessInfoSubmit = true;
    if (this.accessInfoForm.invalid) {
      this.accessInfoForm.markAllAsTouched();
    }
  }

  manageMediaDoc(): void {
    this.isManageMediaSubmit = true;
    if (this.files.length === 0) {
      this.uploadDocForm.markAllAsTouched();
    }
  }

  currentSelected(event): void {
    this.previous = this.current;
    this.current = event;

    switch (this.previous) {
      case 0: {
        this.caseDeatil();
        break;
      }
      case 1: {
        this.reportedBy();
        break;
      }
      case 2: {
        this.saveAccessInfo();
        break;
      }
      case 3: {
        this.manageMediaDoc();
        break;
      }
      default: {
        break;
      }
    }
  }

  //MAT METHODS//

  /*method to update category control*/
  setCategory(catId: number): void {
    this.describeFaultForm.get('category').setValue(catId);
  }

  /*method to update urgencyStatus control*/
  setUrgencyStatus(urgencyStatus: number): void {
    this.faultDetailsForm.get('urgencyStatus').setValue(urgencyStatus);
  }

  getCategoryName() {
    return this.categoryMap.get(this.describeFaultForm.controls['category'].value);
  }

  editTitle() {
    this.isEditable = true;
  }

  changeTitle(title: any) {
    this.describeFaultForm.controls['title'].setValue(title);
    if (title) {
      let reqObj: any = {};
      reqObj.title = title;
      reqObj.stage = this.faultDetails.stage;
      reqObj.isDraft = this.faultDetails.isDraft;
      reqObj.submittedByType = 'SECUR_USER';
      reqObj.submittedById = ''
      this.saveFaultDetails(reqObj, this.faultId);
    }
    this.isEditable = false;
  }


  get additionalInfoControls() {
    return this.faultDetailsForm.get('additionalInfo')['controls'];
  }

  createAdditionalInfo(detail, isPatching = false) {
    const infoArray = this.faultDetailsForm.get('additionalInfo') as FormArray;
    let grup = {
      label: [detail.label, Validators.required],
      value: [detail.value, Validators.required],
      id: detail.id
    }
    if (!isPatching) {
      this.addAdditionalDetForm.reset();
    }
    infoArray.push(this.fb.group(grup));
  }

  async removeInfo(i: number) {
    const infoArray = this.faultDetailsForm.get('additionalInfo') as FormArray;
    const hardDelete = await this.commonService.showConfirm('Delete Additional Info', 'Do you want to delete the info?');
    if (hardDelete) {
      if (infoArray.at(i).get('id').value) {
        const isDeleted = await this.deleteAdditionalInfo(infoArray.at(i).get('id').value);
        if (isDeleted) {
          infoArray.removeAt(i);
        }
      } else {
        infoArray.removeAt(i);
      }
    }
  }

  onSelectReportedByType() {
    this.setValidatorsForReportedBy();
    this.reportedByForm.patchValue({
      title: '',
      forename: '',
      surname: '',
      email: '',
      mobile: '',
      alternativeNo: '',
      selectedEntity: ''
    });
    this.getReportedByIdList();
  }

  private setValidatorsForReportedBy() {
    if (this.reportedByForm.get('reportedBy').value === 'TENANT' || this.reportedByForm.get('reportedBy').value === 'GUARANTOR') {
      this.reportedByForm.get('agreementId').setValidators(Validators.required);
      this.reportedByForm.get('selectedEntity').setValidators(Validators.required);
    } else {
      if (this.reportedByForm.get('reportedBy').value === 'LANDLORD') {
        this.reportedByForm.get('selectedEntity').setValidators(Validators.required);
      } else {
        this.reportedByForm.get('selectedEntity').clearValidators();
        this.reportedByForm.get('selectedEntity').updateValueAndValidity();
      }
      this.reportedByForm.get('agreementId').clearValidators();
      this.reportedByForm.get('agreementId').updateValueAndValidity();
      this.reportedByForm.patchValue({
        agreementId: null
      });
    }
  }

  async getReportedByIdList() {
    return new Promise((resolve) => {
      let reportedBy = this.reportedByForm.get('reportedBy').value;
      if (reportedBy === 'LANDLORD') {
        this.getLandlordsOfProperty(this.propertyId).then((data: any[]) => {
          if (this.faultId && data && data.length) {
            let entityData = data.find(x => x.landlordId === this.reportedByForm.get('reportedById').value);
            this.reportedByForm.get('selectedEntity').setValue(entityData);
            this.setEntityData(entityData);
          }
          resolve(data);
        });
      }
      else if (reportedBy === 'TENANT' && this.reportedByForm.get('agreementId').value) {
        this.getPropertyTenants(this.propertyId, this.reportedByForm.get('agreementId').value).then((tenantList: any[]) => {
          if (this.faultId && tenantList && tenantList.length) {
            let entityData = tenantList.find(x => x.tenantId === this.reportedByForm.get('reportedById').value);
            this.reportedByForm.get('selectedEntity').setValue(entityData);
            this.setEntityData(entityData);
          }
          resolve(tenantList);
        });
      }
      else if (reportedBy === 'GUARANTOR' && this.reportedByForm.get('agreementId').value) {
        const agreementId = this.reportedByForm.get('agreementId').value;
        let agreement = this.propertyTenancyList.find(function (tenancy) {
          return (tenancy.agreementId == agreementId)
        });
        this.allGuarantors = [];
        if (agreement && agreement.tenants) {

          let apiObservableArray = [];
          agreement.tenants.forEach(tenant => {
            apiObservableArray.push(this.getTenantsGuarantors(tenant.tenantId));
          });
          forkJoin(apiObservableArray).subscribe((res: any[]) => {
            if (res) {
              if (this.faultId && this.allGuarantors && this.allGuarantors.length) {
                let entityData = this.allGuarantors.find(x => x.guarantorId === this.reportedByForm.get('reportedById').value);
                this.reportedByForm.get('selectedEntity').setValue(entityData);
                this.setEntityData(entityData);
              }
            }
            resolve(res);
          });
        }
      }

    });
  }

  onSelectAgreement() {
    this.getReportedByIdList();
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  setEntityData(entity) {
    let reportedBy = this.reportedByForm.get('reportedBy').value;
    if (reportedBy === 'LANDLORD') {
      this.reportedByForm.get('reportedById').setValue(entity.landlordId);
    } else if (reportedBy === 'TENANT') {
      this.reportedByForm.get('reportedById').setValue(entity.tenantId);
    } else if (reportedBy === 'GUARANTOR') {
      this.reportedByForm.get('reportedById').setValue(entity.guarantorId);
    }

    this.reportedByForm.patchValue({
      title: entity.title,
      forename: entity.forename,
      surname: entity.surname,
      email: entity.email,
      mobile: entity.mobile,
      alternativeNo: entity.alternativeNo
    });
  }

  async createAFault() {
    let isValid = await this.checkFormsValidity();
    if (!isValid) {
      this.commonService.showMessage('Please fill all required fields.', 'Log a Repair', 'error');
      return;
    }
    this.submitting = true;
    let faultRequestObj = this.createFaultFormValues();
    if (this.faultId) {
      this.submitFault();
    } else {
      this.faultsService.createFault(faultRequestObj).subscribe(
        res => {
          this.commonService.showMessage('Repair has been logged successfully.', 'Log a Repair', 'success');
          this.uploadFiles(res.faultId);
        },
        error => {
          this.submitting = false;
        }
      );
    }
  }

  private submitFault() {
    let faultRequestObj = this.createFaultFormValues();
    faultRequestObj.isDraft = false;
    faultRequestObj.submittedByType = 'SECUR_USER';
    faultRequestObj.submittedById = '';
    this.faultsService.updateFault(this.faultId, faultRequestObj).subscribe(
      res => {
        this.commonService.showMessage('Repair details have been updated successfully.', 'Repair Summary', 'success');
        this.uploadFiles(this.faultId);
      },
      error => {
        this.submitting = false;
      }
    );
  }

  private checkFormsValidity() {
    return new Promise((resolve) => {
      let describeFaultForm = this.describeFaultForm.valid;
      let faultDetailsForm = this.faultDetailsForm.valid;
      let reportedByForm = this.reportedByForm.valid;
      let accessInfoForm = this.accessInfoForm.valid;
      if (!reportedByForm) {
        this.reportedBy();
      }
      if (!accessInfoForm) {
        this.saveAccessInfo();
      }
      if (!faultDetailsForm) {
        this.caseDeatil();
      }

      if (describeFaultForm && faultDetailsForm && reportedByForm && accessInfoForm) {
        return resolve(true);
      }
      return resolve(false);
    });
  }

  private createFaultFormValues(): any {
    return {
      urgencyStatus: this.faultDetailsForm.get('urgencyStatus').value,
      reportedBy: this.reportedByForm.get('reportedBy').value,
      category: this.describeFaultForm.get('category').value,
      title: this.describeFaultForm.get('title').value,
      notes: this.faultDetailsForm.get('notes').value,
      agreementId: this.reportedByForm.get('agreementId').value,
      reportedById: this.reportedByForm.get('reportedById').value,
      tenantId: this.reportedByForm.get('reportedBy').value === 'TENANT' ? this.reportedByForm.get('reportedById').value : '',
      isTenantPresenceRequired: this.accessInfoForm.get('isTenantPresenceRequired').value,
      areOccupiersVulnerable: this.accessInfoForm.get('areOccupiersVulnerable').value,
      tenantNotes: this.accessInfoForm.get('tenantNotes').value,
      propertyId: this.propertyId,
      sourceType: 'FAULT',
      additionalInfo: this.faultDetailsForm.get('additionalInfo').value,
      isDraft: false,
      stage: FAULT_STAGES.FAULT_LOGGED,
      stageAction: FAULT_STAGES_ACTIONS.FAULT_LOGGED,
      createdByType: 'SECUR_USER'
    }
  }

  async searchProperty() {
    const modal = await this.modalController.create({
      component: SearchPropertyPage,
      cssClass: 'modal-container entity-search',
      backdropDismiss: false,
      componentProps: {
        isFAF: true
      }
    });

    modal.onDidDismiss().then(res => {
      if (res.data.propertyId) {
        this.propertyId = res.data.propertyId;
        this.initiateFault();
      } else {
        this.router.navigate(['../dashboard'], { replaceUrl: true, relativeTo: this.route });
      }
    });
    await modal.present();
  }

  async saveForLater() {
    this.saving = true;
    if (!this.faultId) {
      let faultRequestObj = this.createFaultFormValues();
      faultRequestObj.isDraft = true;
      this.faultsService.createFault(faultRequestObj).subscribe(
        res => {
          this.commonService.showMessage('Repair has been logged successfully.', 'Log a Repair', 'success');
          this.uploadFiles(res.faultId);
        },
        error => {
          this.saving = false;
        }
      );
    } else {
      if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_LOGGED) {
        await this.saveAdditionalInfoForm();
      }
      /*update fault summary*/
      this.updateFaultSummary();
    }
  }

  private updateFaultSummary() {
    let faultRequestObj = this.createFaultFormValues();
    faultRequestObj.stage = this.faultDetails.stage;
    faultRequestObj.isDraft = true;
    faultRequestObj.submittedByType = 'SECUR_USER';
    faultRequestObj.submittedById = '';
    if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.LANDLORD_INSTRUCTION) {
      faultRequestObj.stage = this.faultDetails.stage;
      faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
      faultRequestObj.contractor = this.landlordInstFrom.value.contractor;
      faultRequestObj.confirmedEstimate = this.landlordInstFrom.value.confirmedEstimate;
      faultRequestObj.nominalCode = this.landlordInstFrom.value.nominalCode.nominalCode;
      faultRequestObj.requiredStartDate = this.commonService.getFormatedDate(new Date(this.landlordInstFrom.value.requiredStartDate));
      faultRequestObj.requiredCompletionDate = this.commonService.getFormatedDate(new Date(this.landlordInstFrom.value.requiredCompletionDate));
      faultRequestObj.estimationNotes = this.landlordInstFrom.value.estimationNotes;
      if (this.contractorEntityId) {
        faultRequestObj.contractorId = this.contractorEntityId;
      } else {
        delete faultRequestObj.contractorId;
      }
    }

    this.faultsService.updateFault(this.faultId, faultRequestObj).subscribe(
      res => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Repair details have been updated successfully.', 'Repair Summary', 'success');
        if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_LOGGED) {
          this.uploadFiles(this.faultId);
        } else {
          this.router.navigate(['../../dashboard'], { replaceUrl: true, relativeTo: this.route });
        }
      },
      error => {
        this.saving = false;
      }
    );
  }

  private saveAdditionalInfoForm() {
    return new Promise((resolve) => {
      let apiObservableArray = [];
      this.faultDetailsForm.controls['additionalInfo'].value.forEach(info => {
        if (info.id) {
          apiObservableArray.push(this.updateAdditionalInfo(info.id, info));
        } else {
          apiObservableArray.push(this.addAdditionalInfo(this.faultId, info));
        }
      });
      if (!apiObservableArray.length) {
        resolve(true);
      }
      forkJoin(apiObservableArray).subscribe(res => {
        if (res) {
          this.commonService.showMessage('Updated successfully.', 'Update Addtional Info', 'success');
          resolve(true);
        }
      }, error => {
        resolve(true);
      });
    });
  }

  async startProgress() {
    const check = await this.commonService.showConfirm('Start Progress', 'This will change the repair status, Do you want to continue?');
    if (check) {
      this.submitting = true;
      let faultRequestObj = this.createFaultFormValues();
      faultRequestObj.stage = FAULT_STAGES.FAULT_QUALIFICATION;
      faultRequestObj.isDraft = this.faultDetails.isDraft;
      await this.updateFaultDetails(faultRequestObj);
      this.uploadFiles(this.faultId, false);

      this.faultsService.startProgress(this.faultId).subscribe(data => {
        this.refreshDetailsAndStage();
        this.submitting = false;
      }, error => {
        this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Start Progress', 'Error');
        this.submitting = false;
      });
    }
  }

  private async refreshDetailsAndStage(reloadFaultDocs = false) {
    const details: any = await this.getFaultDetails();
    if (reloadFaultDocs) {
      this.files = await this.getFaultDocuments(this.faultDetails.faultId);
      this.filterDocsByStage(details);
    }
    this.selectStageStepper(details.stage);
    this.faultDetails = details;
    this.getStageIndex(this.faultDetails);
    this.userSelectedActionControl.setValue(this.faultDetails.userSelectedAction);
    this.oldUserSelectedAction = this.userSelectedActionControl.value;
    this.proceeding = false;
    this.commonService.scrollToTopById('matStepperTop');
  }

  reOpenFault() {
    this.commonService.showConfirm('Re-open Repair', 'This will reopen the repair and notify the property manager.<br/> Are you sure?').then(res => {
      if (res) {
        const UNDER_REVIEW = 2; // Under review
        this.faultsService.updateFaultStatus(this.faultId, UNDER_REVIEW).subscribe(data => {
          this.router.navigate(['../../dashboard'], { replaceUrl: true, relativeTo: this.route });
        }, error => {
          this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Re-open Repair', 'Error');
          console.log(error);
        });
      }
    });
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
    await this.checkFaultNotifications(this.faultId);
    this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, this.faultDetails.userSelectedAction);

    this.getPendingHours();
    if (this.faultDetails.userSelectedAction === LL_INSTRUCTION_TYPES[3].index) {
      if (this.cliNotification && this.cliNotification.responseReceived) {
        if (this.cliNotification.responseReceived.isAccepted) {
          /*Do Nothing*/
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

  goTolistPage() {
    if (this.faultId) {
      this.router.navigate(['../../dashboard'], { replaceUrl: true, relativeTo: this.route });
    } else {
      this.router.navigate(['../dashboard'], { replaceUrl: true, relativeTo: this.route });
    }
  }

  private changeStep(index: number) {
    this.stepper.selectedIndex = index;
  }

  goToLastStage() {
    document.querySelector('ion-content').scrollToTop(500);
    if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_QUALIFICATION) {
      this.stepper.selectedIndex = FAULT_STAGES_INDEX.FAULT_LOGGED;
    } else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.LANDLORD_INSTRUCTION) {
      this.stepper.selectedIndex = FAULT_STAGES_INDEX.FAULT_QUALIFICATION;
    } else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.ARRANGING_CONTRACTOR) {
      this.stepper.selectedIndex = FAULT_STAGES_INDEX.LANDLORD_INSTRUCTION
    } else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.JOB_COMPLETION) {
      this.stepper.selectedIndex = FAULT_STAGES_INDEX.ARRANGING_CONTRACTOR;
    } else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.PAYMENT) {
      this.stepper.selectedIndex = FAULT_STAGES_INDEX.JOB_COMPLETION;
    }
  }

  goToNextStage() {
    document.querySelector('ion-content').scrollToTop(500);
    if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_LOGGED) {
      this.stepper.selectedIndex = FAULT_STAGES_INDEX.FAULT_QUALIFICATION;
    }
    else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_QUALIFICATION) {
      this.stepper.selectedIndex = FAULT_STAGES_INDEX.LANDLORD_INSTRUCTION;
    } else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.LANDLORD_INSTRUCTION) {
      this.stepper.selectedIndex = FAULT_STAGES_INDEX.ARRANGING_CONTRACTOR;
    } else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.ARRANGING_CONTRACTOR) {
      this.stepper.selectedIndex = FAULT_STAGES_INDEX.JOB_COMPLETION
    } else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.JOB_COMPLETION) {
      this.stepper.selectedIndex = FAULT_STAGES_INDEX.PAYMENT;
    }
  }

  async proceedToNextStage() {
    document.querySelector('ion-content').scrollToTop(500);

    if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_LOGGED) {
      this.proceeding = true;
      let faultRequestObj = this.createFaultFormValues();
      faultRequestObj.isDraft = false;
      faultRequestObj.stage = this.faultDetails.stage;
      let res = await this.updateFaultDetails(faultRequestObj);
      this.uploadFiles(this.faultId, false);
      if (res) {
        this.stepper.selectedIndex = FAULT_STAGES_INDEX.FAULT_QUALIFICATION;
        this.proceeding = false;
      }
    }
    else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_QUALIFICATION) {
      let faultRequestObj = {} as FaultModels.IFaultResponse;
      faultRequestObj.isDraft = false;
      if (this.stepper.selectedIndex < FAULT_STAGES_INDEX[this.faultDetails.stage]) {
        faultRequestObj.stage = this.faultDetails.stage;
      } else {
        faultRequestObj.stage = FAULT_STAGES.LANDLORD_INSTRUCTION;
      }
      let res = await this.updateFaultDetails(faultRequestObj);
      if (res) {
        this.stepper.selectedIndex = FAULT_STAGES_INDEX.LANDLORD_INSTRUCTION;
        this.faultDetails.stage = FAULT_STAGES.LANDLORD_INSTRUCTION;
      }
    }
    else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.LANDLORD_INSTRUCTION) {
      this.proceeding = true;
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
        const proceedWithWO = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Proceed with Worksorder" action.<br/> Are you sure?', '', 'Yes', 'No');
        if (proceedWithWO) {
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
            this.refreshDetailsAndStage();
          });
        } else {
          this.proceeding = false;
        }
        break;
      case LL_INSTRUCTION_TYPES[2].index: //cli006c
        const obtainQuote = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Obtain Quote" action.<br/>  Are you sure?', '', 'Yes', 'No');
        if (obtainQuote) {
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
            this.refreshDetailsAndStage();
          });
        } else {
          this.proceeding = false;
        }
        break;
      case LL_INSTRUCTION_TYPES[5].index: //cli006e
        if (!this.landlordInstFrom.value.confirmedEstimate) {
          this.commonService.showAlert('Landlord Instructions', 'Please fill the confirmssssssed estimate field.');
          this.proceeding = false;
          return;
        }
        if (this.landlordInstFrom.controls['contractor'].invalid) {
          this.proceeding = false;
          return;
        }
        const emergency = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "EMERGENCY/URGENT – proceed as agent of necessity" action.<br/> Are you sure?', '', 'Yes', 'No');
        if (emergency) {
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
            this.refreshDetailsAndStage();
          });
        } else {
          this.proceeding = false;
        }
        break;
      case LL_INSTRUCTION_TYPES[0].index: //cli006a
        const ownRepairs = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Landlord does their own repairs" action. This will send out a notification to Landlord. <br/> Are you sure?', '', 'Yes', 'No');
        if (ownRepairs) {
          if (this.cliNotification && (this.cliNotification.responseReceived == null || this.cliNotification.responseReceived.isAccepted == null) && !this.cliNotification.isVoided && this.isUserActionChange) {
            let voidResponce = await this.voidNotification();
            if (!voidResponce) return;
          }
          faultRequestObj.stage = FAULT_STAGES.LANDLORD_INSTRUCTION;
          faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
          faultRequestObj.stageAction = this.userSelectedActionControl.value;
          let requestArray = [];
          requestArray.push(this.updateFaultDetails(faultRequestObj));
          forkJoin(requestArray).subscribe(data => {
            this.refreshDetailsAndStage();
            setTimeout(async () => {
              await this.checkFaultNotifications(this.faultId);
              this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
              this.getPendingHours();
              if (this.cliNotification && this.cliNotification.responseReceived && this.cliNotification.responseReceived.isAccepted) {
                this.selectStageStepper(FAULT_STAGES.JOB_COMPLETION);
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
        const obtainAuthorisation = await this.commonService.showConfirm('Landlord Instructions', `You have selected the "Obtain Landlord's Authorisation" action. This will send out a notification to Landlord. <br/> Are you sure?`, '', 'Yes', 'No');
        if (obtainAuthorisation) {
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
          let requestArray = [];
          requestArray.push(this.updateFaultDetails(faultRequestObj));
          forkJoin(requestArray).subscribe(data => {
            this.refreshDetailsAndStage();
            setTimeout(async () => {
              await this.checkFaultNotifications(this.faultId);
              this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[3].index);
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
            await this.refreshDetailsAndStage();
            this.checkForLLSuggestedAction();
          }
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

  validateUploadLimit(file) {
    if (!file) { return; }
    let fileSize = file.size / 1024 / 1024;
    if (fileSize > this.MAX_DOC_UPLOAD_LIMIT) {
      this.commonService.showAlert('Warning', `Some file(s) can't be uploaded, because they exceed the maximum allowed file size(${this.MAX_DOC_UPLOAD_LIMIT}Mb)`);
      return false;
    }
    return true;
  }

  async voidNotification() {
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isVoided = true;
    notificationObj.submittedByType = 'SECUR_USER';
    return new Promise((resolve) => {
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
  }

  private updateFaultStatus(status): Promise<any> {
    return this.faultsService.updateFaultStatus(this.faultId, status).toPromise();
  }

  private updateFaultDetails(requestObj): Promise<any> {
    requestObj.submittedByType = 'SECUR_USER';
    requestObj.submittedById = '';
    return new Promise((resolve, reject) => {
      this.faultsService.updateFault(this.faultId, requestObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          reject(error)
        }
      );
    });
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

  private filterNotifications(data, stage, action?) {
    return new Promise((resolve) => {
      let filtereData = null;
      let currentStage = stage;

      if (data.length == 0)
        resolve(null);
      filtereData = data.filter((x => x.faultStage === currentStage)).filter((x => !x.isVoided));
      if (filtereData.length == 0)
        resolve(null);
      filtereData = filtereData.sort((a, b) => {
        return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
      });
      filtereData[0].chase = filtereData[0].numberOfChasesDone + 1;
      this.faultNotificationDetails = [
        filtereData[0].templateCode,
        filtereData[0].chase
      ];
      resolve(filtereData[0]);
    });
  }

  questionAction(data) {
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
      this.commonService.showConfirm(data.text, 'The repair status will change to "Escalation". </br> Are you sure?', '', 'Yes', 'No').then(async res => {
        if (res) {
          this.commonService.showLoader();
          await this.updateFaultNotification(data.value, this.cliNotification.faultNotificationId);
          this.refreshDetailsAndStage();
          await this.checkFaultNotifications(this.faultId);
          this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
          this.getPendingHours();
        }
      });
    }
    else if (data.value) {
      this.commonService.showConfirm(data.text, 'This will change the status to "Work in Progress". </br> Are you sure?', '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(data.value, this.cliNotification.faultNotificationId);
          this.refreshDetailsAndStage();
          await this.checkFaultNotifications(this.faultId);
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
          this.refreshDetailsAndStage();
          await this.checkFaultNotifications(this.faultId);
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
        this.refreshDetailsAndStage();
        await this.checkFaultNotifications(this.faultId);
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
          this.refreshDetailsAndStage();
          await this.checkFaultNotifications(this.faultId);
          this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
          this.getPendingHours();
        }
      });
    }
    else if (data.value) {
      this.openJobCompletionModal('Are you sure the repair is complete?');
    }
  }

  async presentRepairCategories(ev: any) {
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

  private async updateFaultNotification(data, faultNotificationId): Promise<any> {
    return new Promise((resolve, reject) => {
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

  _childComponentHandler(type: string) {
    switch (type) {
      case 'cancel': {
        this.goTolistPage();
        break;
      }
      case 'back': {
        this.goToLastStage();
        break;
      }
      case 'next': {
        this.goToNextStage();
        break;
      }
      case 'refresh': {
        this.refreshDetailsAndStage();
        break;
      }
      case 'refresh_docs': {
        const reloadFaultDocs = true;
        this.refreshDetailsAndStage(reloadFaultDocs);
        break;
      }
      case 'saveLater': {
        this.saveLaterChild();
        break;
      }
      case 'changeStepToJobCompl': {
        this.selectStageStepper(FAULT_STAGES.JOB_COMPLETION);
        break;
      }
      case 'snooze': {
        this.snoozeFault();
        break;
      }
    }
  }

  async snoozeFault() {
    const modal = await this.modalController.create({
      component: SnoozeFaultModalPage,
      cssClass: 'modal-container fault-modal-container',
      componentProps: {
        faultId: this.faultDetails.faultId,
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res && res.data && res.data == 'success') {
        this.commonService.showMessage('Repair has been snooze successfully.', 'Snooze Repair', 'success');
        this.router.navigate(['../../dashboard'], { replaceUrl: true, relativeTo: this.route });
      }
    });
    await modal.present();
  }

  private async saveLaterChild() {
    let requestObj = {
      title: this.describeFaultForm.controls['title'].value,
      stage: this.faultDetails.stage,
      isDraft: true
    };
    let res = await this.updateFaultDetails(requestObj);
    if (res) {
      this.goTolistPage();
    }
  }

  filterByGroupName(folderName) {
    this.filteredDocuments = this.files.filter(data => data.folderName === folderName).filter(data => !data.isDraft);
    this.mediaType = 'documents';
    this.folderName = folderName;
  }

  goBackToUpload(value) {
    this.mediaType = value;
    this.filteredDocuments = null;
  }

  async deleteDocument(file, i: number) {
    const deleteMedia = await this.commonService.showConfirm('Delete Media/Document', 'Do you want to delete the media/document?', '', 'YES', 'NO');
    if (deleteMedia) {
      this.faultsService.deleteDocument(file.documentId).subscribe(response => {
        this.removeFile(file, i);
        this.filteredDocuments.splice(i, 1);
        if (this.filteredDocuments.length == 0) {
          this.prepareDocumentsList();
          this.mediaType = 'upload';
        }
      });
    }
  }

  changeString(data): string {
    if (data) {
      return data.replace(/_/g, ' ');
    }
  }

  private prepareDocumentsList() {
    if (this.files.length > 0) {
      this.files.forEach((e, i) => {
        if (this.files[i].folderName == null) {
          this.files[i].folderName = FOLDER_NAMES[0].index;
        }
        if (this.files[i].folderName === FOLDER_NAMES[1].index && this.files[i].contractorCompanyName) {
          this.files[i].folderName = e.folderName + ' - ' + e.contractorCompanyName;
        }
        this.files[i].folderName = e.folderName.replace(/_/g, ' ');
        this.files[i].isUploaded = true;
        if (e.name != null && DOCUMENTS_TYPE.indexOf(e.name.split('.')[1]) !== -1) {
          this.files[i].isImage = false;
        }
        else { this.files[i].isImage = true; }
      });
      const uniqueSet = this.files.map(data => data.folderName);
      this.folderNames = uniqueSet.filter(this.onlyUnique);
    }
  }


  downloadDocumentByURl(document) {
    this.commonService.downloadDocumentByUrl(document.documentUrl, document.name);
  }



  async llContractor() {
    if (!this.isContractorModal) {
      this.isContractorModal = true;
      const modal = await this.modalController.create({
        component: ContractorDetailsModalPage,
        cssClass: 'modal-container ll-contractor-modal fault-modal-container',
        componentProps: {
          faultId: this.faultId,
          landlordId: this.landlordDetails.landlordId,
          llContractorDetails: this.faultDetails.landlordOwnContractor,
          estimatedVisitAt: this.faultDetails.estimatedVisitAt
        },
        backdropDismiss: false
      });
      modal.onDidDismiss().then(async res => {
        this.isContractorModal = false;
        if (res.data && res.data == 'success') {
          this.refreshDetailsAndStage();
        }
      });

      await modal.present();
    }
  }

  async markJobComplete(faultId) {
    let requestObj = {
      'additionalEstimate': 0,
      'additionalWorkDetails': '',
      'isAccepted': true,
      'isAnyFurtherWork': false,
      'isVoided': false,
      'jobCompletionDate': this.commonService.getFormatedDate(new Date()),
      'submittedByType': 'SECUR_USER'
    };
    this.faultsService.markJobComplete(faultId, requestObj).subscribe(data => {
      this.refreshDetailsAndStage();
    }, error => {
      this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Mark Job Complete', 'Error');
      console.log(error);
    });
  }

  async viewNotification() {
    await this.fetchPendingNotification(this.faultId);
    await this.notificationModal();
  }

  async fetchPendingNotification(faultId): Promise<any> {
    return new Promise((resolve, reject) => {
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
  }

  async notificationModal() {
    const modal = await this.modalController.create({
      component: PendingNotificationModalPage,
      cssClass: 'modal-container fault-modal-container',
      componentProps: {
        notificationHistoryId: this.pendingNotification ? this.pendingNotification.notificationHistoryId : '',
        notificationSubject: this.pendingNotification ? this.pendingNotification.subject : '',
        notificationBody: this.pendingNotification ? this.pendingNotification.body : '',
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this.refreshDetailsAndStage();
        this.commonService.showLoader();
        await this.checkFaultNotifications(this.faultId);
        this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
        this.getPendingHours();
      }
    });

    await modal.present();
  }

  async getStatus(status) {
    this.faultDetailsForm.get('urgencyStatus').setValue(status);
    let requestObj = {
      urgencyStatus: status,
      stage: this.faultDetails.stage,
      isDraft: true
    };
    let res = await this.updateFaultDetails(requestObj);
    if (res) {
      this._document.defaultView.location.reload();
    }
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

  async openJobCompletionModal(title) {
    const modal = await this.modalController.create({
      component: JobCompletionModalPage,
      cssClass: 'modal-container fault-modal-container',
      componentProps: {
        faultNotificationId: this.cliNotification.faultNotificationId,
        heading: 'Mark the Job Complete',
        title: title
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this.refreshDetailsAndStage();
        await this.checkFaultNotifications(this.faultId);
        this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
        this.getPendingHours();
      }
    });
    await modal.present();
  }

  private getMaxDocUploadLimit(): Promise<any> {
    return new Promise((resolve) => {
      this.commonService.getSystemOptions(MAX_DOC_UPLOAD_SIZE.FAULT_DOCUMENT_UPLOAD_SIZE).subscribe(res => {
        this.MAX_DOC_UPLOAD_LIMIT = res ? parseInt(res.FAULT_DOCUMENT_UPLOAD_SIZE, 10) : '';
        resolve(true);
      }, error => {
        resolve(false);
      });
    });
  }

  onBlurCurrency(val: any, form: FormGroup) {
    if (!val) {
      if (form == this.landlordInstFrom) {
        this.landlordInstFrom.patchValue({
          confirmedEstimate: 0
        });
      }
    }
  }

  private async saveFaultDetails(data, faultId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.faultsService.saveFaultDetails(faultId, data).subscribe(
        res => {
          this.commonService.showMessage('Title changed successfully.', 'Repair', 'success');
          resolve(true);
        },
        error => {
          reject(false)
        }
      );
    });
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
      code.concat = heading + ', ' + code.nominalCode + ', ' + code.description;
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

  removeValidation() {
    this.isAuthorizationfields = false;
    this.landlordInstFrom.clearValidators();
    this.landlordInstFrom.updateValueAndValidity()
    this.landlordInstFrom.patchValue({
      nominalCode: null,
      requiredStartDate: null,
      requiredCompletionDate: null
    })
  }
  addValidations() {
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

  private getWorksOrderPaymentRules(actionType = WORKSORDER_RAISE_TYPE.AUTO) {
    return new Promise((resolve) => {
      this.faultsService.getWorksOrderPaymentRules(this.faultDetails.faultId).subscribe(
        res => {
          resolve(res);
        },
        error => {
          resolve(null);
        }
      );
    });
  }

  private async getSystemOptions(key): Promise<any> {
    return new Promise((resolve) => {
      this.commonService.getSystemOptions(key).subscribe(res => {
        resolve(res ? res['key'] : '');
      }, error => {
        resolve('');
      });
    });
  }

  private async paymentRequestModal(data) {
    const modal = await this.modalController.create({
      component: PaymentRequestModalPage,
      cssClass: 'modal-container payment-request-modal fault-modal-container',
      componentProps: data,
      backdropDismiss: false
    });
    await modal.present();

    return modal.onDidDismiss().then(async res => {
      if (res.data) {
        if (res.data == 'success') {
          return true;
        } else if (res.data == 'skip-payment') {
          this.refreshDetailsAndStage();
          await this.checkFaultNotifications(this.faultId);
          this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[3].index);
        }
      }
    });

  }

  getFaultNotificationId() {
    this.filterNotifications(this.faultNotifications, this.faultDetails.stage);
  }

}