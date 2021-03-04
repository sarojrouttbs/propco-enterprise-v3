import { ModalController, PopoverController } from '@ionic/angular';
import { SearchPropertyPage } from './../../shared/modals/search-property/search-property.page';
import { REPORTED_BY_TYPES, PROPCO, FAULT_STAGES, ERROR_MESSAGE, ACCESS_INFO_TYPES, LL_INSTRUCTION_TYPES, FAULT_STAGES_INDEX, URGENCY_TYPES, REGEX, FOLDER_NAMES, DOCUMENTS_TYPE } from './../../shared/constants';
import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../faults.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepper } from '@angular/material/stepper';
import { debounceTime, switchMap } from 'rxjs/operators';
import { SimplePopoverPage } from 'src/app/shared/popover/simple-popover/simple-popover.page';
import { ContractorDetailsModalPage } from 'src/app/shared/modals/contractor-details-modal/contractor-details-modal.page';
import { PendingNotificationModalPage } from 'src/app/shared/modals/pending-notification-modal/pending-notification-modal.page';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'fault-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss', '../../shared/drag-drop.scss'],
})
export class DetailsPage implements OnInit {
  @ViewChild("stepper", { static: false }) stepper: MatStepper;
  currentStepperIndex = 0;
  faultCategories: any[] = [];
  pageNo = 1;
  propertyId = null;
  propertyDetails: any = {};
  propertyTenancyList: any[];
  propertyHMODetails: any[] = [];
  faultHistory;
  addtionalInfo;
  files = [];
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
  propertyTenants: any[] = [];
  allGuarantors: any[] = [];
  tenantIds: any[] = [];
  preferredSuppliers: any[] = [];
  tenantArrears: any;
  faultDetails: FaultModels.IFaultResponse;
  landlordDetails: any;
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
  isContractorModal:boolean = false;

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

  ngOnInit() {
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

  // onSelectionChange(data) {
  //   if (data) {
  //     this.contractorEntityId = data.option.value.entityId;
  //   }
  // }

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

  private setLookupData(data) {
    this.agreementStatuses = data.agreementStatuses;
  }

  private setFaultsLookupData(data) {
    this.faultReportedByThirdParty = data.faultReportedByThirdParty;
    this.faultCategories = data.faultCategories;
    this.faultUrgencyStatuses = data.faultUrgencyStatuses;
    this.faultStatuses = data.faultStatuses;
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
      additionalInfo: this.fb.array([])
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
      estimationNotes: ''
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
        this.propertyId = details.propertyId;
        this.contractorEntityId = details.contractorId;
        this.oldUserSelectedAction = this.faultDetails.userSelectedAction;
        this.userSelectedActionControl.setValue(this.faultDetails.userSelectedAction);
        this.getFaultDocuments(this.faultId);
        this.getFaultHistory();
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
      }
    } else {
      this.faultDetails = <FaultModels.IFaultResponse>{};
      this.faultDetails.status = 1;
    }
    this.commonService.showLoader();
    forkJoin([
      this.getFaultAdditionalInfo(),
      this.getPropertyById(),
      this.getPropertyTenancies(),
      this.getHMOLicenceDetails()
    ]).subscribe(async (values) => {
      if (this.faultId) {
        // this.commonService.hideLoader();
        this.initPatching();
        this.setValidatorsForReportedBy();
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
        this.checkForLLSuggestedAction();
        this.getPreferredSuppliers(landlordId);
        this.matchCategory();
      }
    });
    this.showSkeleton = false;
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
    switch (stage) {
      case FAULT_STAGES.FAULT_QUALIFICATION: {
        this.changeStep(FAULT_STAGES_INDEX.FAULT_QUALIFICATION);
        break;
      }
      case FAULT_STAGES.LANDLORD_INSTRUCTION: {
        // this.initLandlordInstructions(this.faultId);
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
    this.describeFaultForm.patchValue({
      title: this.faultDetails.title,
      category: this.faultDetails.category
    });

    this.faultDetailsForm.patchValue({
      urgencyStatus: this.faultDetails.urgencyStatus,
      notes: this.faultDetails.notes
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
      // contractor: this.faultDetails.contractorId,
      confirmedEstimate: this.faultDetails.confirmedEstimate,
      userSelectedAction: this.faultDetails.userSelectedAction,
      estimationNotes: this.faultDetails.estimationNotes
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
    const promise = new Promise((resolve, reject) => {
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
    return promise;
  }

  private getPropertyTenancies() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getPropertyTenancies(this.propertyId).subscribe(
        res => {
          if (res && res.data) {
            this.propertyTenancyList = res.data.filter(x => x.hasCheckedIn);
            if (this.propertyTenancyList && this.propertyTenancyList.length) {
              this.propertyDetails.isPropertyCheckedIn = true;
              for (let i = 0; i < this.propertyTenancyList.length; i++) {
                const tenants = this.propertyTenancyList[i].tenants;
                let tenantIdList = tenants.filter(data => data.tenantId).map(d => d.tenantId);
                let tenantData = tenants.find(data => data.isLead === true);
                if (tenantData) {
                  this.leadTenantId = tenantData.tenantId;
                }
                this.tenantIds = this.tenantIds.concat(tenantIdList);
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
    return promise;
  }

  private deleteAdditionalInfo(infoId: string) {
    const promise = new Promise((resolve, reject) => {
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
    return promise;
  }

  private addAdditionalInfo(faultId: string, requestObj: any) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.addAdditionalInfo(faultId, requestObj).subscribe(
        res => {
          resolve();
        },
        error => {
          console.log(error);
          resolve();
        }
      );
    });
    return promise;
  }

  private updateAdditionalInfo(id: string, requestObj: any) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateAdditionalInfo(id, requestObj).subscribe(
        res => {
          resolve();
        },
        error => {
          console.log(error);
          resolve();
        }
      );
    });
    return promise;
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
    }, error => {
    });
  }

  private returnTenantArrears(res) {
    let arrearResponse = res.map(data => data.rentArrears);
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    this.tenantArrears = arrearResponse.reduce(reducer);
    this.propertyDetails.tenantArrears = this.tenantArrears;
  }


  private getHMOLicenceDetails() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getHMOLicenceDetailsAgainstProperty(this.propertyId).subscribe(
        res => {
          if (res && res.data) {
            this.propertyHMODetails = res.data;
          }
          resolve();
        },
        error => {
          console.log(error);
          reject();
        }
      );
    });
    return promise;
  }

  private getFaultHistory() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getFaultHistory(this.faultId).subscribe(
        res => {
          if (res) {
            this.faultHistory = res;
          }
          resolve();
        },
        error => {
          console.log(error);
          reject();
        }
      );
    });
    return promise;
  }

  private getFaultAdditionalInfo() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getFaultAdditionalInfo().subscribe(
        res => {
          if (res) {
            this.addtionalInfo = res;
          }
          resolve();
        },
        error => {
          reject();
        }
      );
    });
    return promise;
  }

  private getLandlordsOfProperty(propertyId) {
    const promise = new Promise((resolve, reject) => {
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
    return promise;
  }

  private getPropertyTenants(propertyId, agreementId) {
    const promise = new Promise((resolve, reject) => {
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
    return promise;
  }

  private getTenantsGuarantors(tenantId) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getTenantGuarantors(tenantId).subscribe(
        res => {
          var guarantorList = res && res.data ? res.data : [];
          this.allGuarantors = this.allGuarantors.concat(guarantorList);
          resolve(res);
        },
        error => {
          console.log(error);
          reject();
        }
      );
    });
    return promise;
  }

  private getFaultDetails() {
    const promise = new Promise((resolve, reject) => {
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
    return promise;
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

  getUploadedFile(files: FileList) {
    this.submit(files);
  }

  removeFile(i) {
    if (this.faultDetails.faultId) {
      this.files.splice(i, 1);
      this.photos.removeAt(i - this.files.length);
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
  };

  submit(files) {
    // if (this.files.length + files.length > 5) {
    //   this.commonService.showMessage("You are only allowed to upload a maximum of 5 files", "Warning", "warning");
    //   return;
    // }
    if (files) {
      for (let file of files) {
        let isImage: boolean = false;
        if (file.type.split("/")[0] !== 'image') {
          isImage = false;
        }
        else if (file.type.split("/")[0] == 'image') {
          isImage = true;
        }
        this.photos.push(this.createItem({
          file: file
        }));
        let reader = new FileReader();
        if (isImage) {
          reader.onload = (e: any) => {
            this.files.push({
              documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result),
              name: file.name
            })
          }
        }
        else {
          reader.onload = (e: any) => {
            this.files.push({
              documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/default.jpg'),
              name: file.name
            })
          }
        }
        reader.readAsDataURL(file);
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
      // formData.append('folderName', this.faultDetails.status + '' || '1');
      formData.append('folderName', FOLDER_NAMES[0]['index']);
      formData.append('headCategory', 'Legal');
      formData.append('subCategory', 'Addendum');
      apiObservableArray.push(this.faultsService.uploadDocument(formData, faultId));
    });
    if (!apiObservableArray.length && reDir) {
      this.router.navigate(['faults/dashboard'], { replaceUrl: true });
    }
    setTimeout(() => {
      forkJoin(apiObservableArray).subscribe(() => {
        if (reDir) {
          this.router.navigate(['faults/dashboard'], { replaceUrl: true });
        }
      }, err => {
        if (reDir) {
          this.router.navigate(['faults/dashboard'], { replaceUrl: true });
        }
      });
    }, 1000);
  }

  getFaultDocuments(faultId) {
    this.faultsService.getFaultDocuments(faultId).subscribe(response => {
      if (response) {
        this.files = response.data;
        // this.getDocs();
        if (this.faultDetails.stage === FAULT_STAGES.JOB_COMPLETION) {
          this.quoteDocuments = this.files.filter(data => data.folderName === FOLDER_NAMES[4]['index'] || data.folderName === FOLDER_NAMES[5]['index']);
        }
        else {
          this.quoteDocuments = this.files.filter(data => data.folderName === FOLDER_NAMES[1]['index']);
        }
        this.prepareDocumentsList();
      }
    })
  }

  downloadFaultDocument(documentId, name) {
    let fileName = name.split('.')[1];
    this.faultsService.downloadDocument(documentId).subscribe(response => {
      if (response) {
        this.commonService.downloadDocument(response, fileName);
      }
    })
  }

  downloadFaultDocumentByUrl(url) {
    this.commonService.downloadDocumentByUrl(url);
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
    const promise = new Promise((resolve, reject) => {
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
          agreement.tenants.forEach(tenant => {
            this.getTenantsGuarantors(tenant.tenantId);
          });

          let apiObservableArray = [];
          agreement.tenants.forEach(tenant => {
            apiObservableArray.push(this.getTenantsGuarantors(tenant.tenantId));
          });
          forkJoin(apiObservableArray).subscribe((res: any[]) => {
            if (res) {
              if (this.faultId && this.allGuarantors && this.allGuarantors.length) {
                let entityData = res.find(x => x.guarantorId === this.reportedByForm.get('reportedById').value);
                this.reportedByForm.get('selectedEntity').setValue(entityData);
                this.setEntityData(entityData);
              }
            }
            resolve(res);
          }, error => {
          });
        }
      }

    });
    return promise;
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
      this.commonService.showMessage('Please fill all required fields.', 'Log a Fault', 'error');
      return;
    }
    // if (!this.files.length) {
    //   this.commonService.showMessage('At least one fault image is required', 'Log a Fault', 'error');
    //   return;
    // }
    this.commonService.showLoader();
    let faultRequestObj = this.createFaultFormValues();

    this.faultsService.createFault(faultRequestObj).subscribe(
      res => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Fault has been logged successfully.', 'Log a Fault', 'success');
        this.uploadFiles(res.faultId);
      },
      error => {
        this.commonService.hideLoader();
        // this.commonService.showMessage('Something went wrong on server, please try again.', 'Log a Fault', 'Error');
        console.log(error);
      }
    );
  }

  private checkFormsValidity() {
    return new Promise((resolve, reject) => {
      let valid = false;
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
        valid = true;
      }
      return resolve(valid);
    });
  }

  private createFaultFormValues(): any {
    let faultDetails = {
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
      sourceType: "FAULT",
      additionalInfo: this.faultDetailsForm.get('additionalInfo').value,
      isDraft: false,
      stage: FAULT_STAGES.FAULT_LOGGED
    }
    return faultDetails;
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

    const data = modal.onDidDismiss().then(res => {
      if (res.data.propertyId) {
        this.propertyId = res.data.propertyId;
        this.initiateFault();
      } else {
        this.router.navigate(['faults/dashboard'], { replaceUrl: true });
      }
    });
    await modal.present();
  }

  async saveForLater() {
    if (!this.faultId) {
      this.commonService.showLoader();
      let faultRequestObj = this.createFaultFormValues();
      faultRequestObj.isDraft = true;
      this.faultsService.createFault(faultRequestObj).subscribe(
        res => {
          this.commonService.hideLoader();
          this.commonService.showMessage('Fault has been logged successfully.', 'Log a Fault', 'success');
          this.uploadFiles(res.faultId);
        },
        error => {
          this.commonService.hideLoader();
          // this.commonService.showMessage('Something went wrong on server, please try again.', 'Log a Fault', 'Error');
          console.log(error);
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
    this.commonService.showLoader();
    let faultRequestObj = this.createFaultFormValues();
    faultRequestObj.stage = this.faultDetails.stage;
    faultRequestObj.isDraft = true;
    if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.LANDLORD_INSTRUCTION) {
      faultRequestObj.stage = this.faultDetails.stage;
      faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
      Object.assign(faultRequestObj, this.landlordInstFrom.value);
      if (this.contractorEntityId) {
        faultRequestObj.contractorId = this.contractorEntityId;
      } else {
        delete faultRequestObj.contractorId;
      }
    }

    this.faultsService.updateFault(this.faultId, faultRequestObj).subscribe(
      res => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Fault details have been updated successfully.', 'Fault Summary', 'success');
        if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_LOGGED) {
          this.uploadFiles(this.faultId);
        } else {
          this.router.navigate(['faults/dashboard'], { replaceUrl: true });
        }
      },
      error => {
        this.commonService.hideLoader();
        console.log(error);
      }
    );
  }

  private saveAdditionalInfoForm() {
    const promise = new Promise((resolve, reject) => {
      this.commonService.showLoader();
      let apiObservableArray = [];
      this.faultDetailsForm.controls['additionalInfo'].value.forEach(info => {
        if (info.id) {
          apiObservableArray.push(this.updateAdditionalInfo(info.id, info));
        } else {
          apiObservableArray.push(this.addAdditionalInfo(this.faultId, info));
        }
      });
      if (!apiObservableArray.length) {
        resolve();
      }
      forkJoin(apiObservableArray).subscribe(res => {
        if (res) {
          this.commonService.showMessage('Updated successfully.', 'Update Addtional Info', 'success');
          resolve();
        }
        this.commonService.hideLoader();
      }, error => {
        this.commonService.hideLoader();
        resolve();
      });
    });
    return promise;
  }

  async startProgress() {
    const check = await this.commonService.showConfirm('Start Progress', 'This will change the fault status, Do you want to continue?');
    if (check) {
      let faultRequestObj = this.createFaultFormValues();
      faultRequestObj.stage = FAULT_STAGES.FAULT_QUALIFICATION;
      faultRequestObj.isDraft = this.faultDetails.isDraft;
      await this.updateFaultDetails(faultRequestObj);
      this.uploadFiles(this.faultId, false);

      this.faultsService.startProgress(this.faultId).subscribe(data => {
        this.refreshDetailsAndStage();
      }, error => {
        this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Start Progress', 'Error');
      });
    }
  }

  private async refreshDetailsAndStage(reloadFaultDocs = false) {
    if (reloadFaultDocs) {
      this.getFaultDocuments(this.faultDetails.faultId);
    }
    const details: any = await this.getFaultDetails();
    this.selectStageStepper(details.stage);
    this.faultDetails = details;
    this.userSelectedActionControl.setValue(this.faultDetails.userSelectedAction);
    this.oldUserSelectedAction = this.userSelectedActionControl.value;
  }


  reOpenFault() {
    this.commonService.showConfirm('Re-open Fault', 'This will reopen the fault and notify the property manager.<br/> Are you sure?').then(res => {
      if (res) {
        const UNDER_REVIEW = 2; // Under review
        this.faultsService.updateFaultStatus(this.faultId, UNDER_REVIEW).subscribe(data => {
          this.router.navigate(['faults/dashboard'], { replaceUrl: true });
        }, error => {
          this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Re-open Fault', 'Error');
          console.log(error);
        });
      }
    });
  }

  setUserAction(index) {
    // if (this.cliNotification && !this.cliNotification.responseReceived) {
    //   this.commonService.showAlert('Landlord Instructions', 'Please select response before proceeding with other action.');
    //   return;
    // }
    this.isUserActionChange = true;
    this.userSelectedActionControl.setValue(index);

  }

  private async checkForLLSuggestedAction() {
    // if (this.faultDetails.status === 2 || this.faultDetails.status === 13) { //In Assessment" or " Checking Landlord's Instructions "
    this.suggestedAction = '';
    let confirmedEstimate = this.faultDetails.confirmedEstimate;
    if (this.faultDetails.urgencyStatus === URGENCY_TYPES.EMERGENCY || this.faultDetails.urgencyStatus === URGENCY_TYPES.URGENT) {
      this.suggestedAction = LL_INSTRUCTION_TYPES[4].index;
    }
    else if (this.landlordDetails.doesOwnRepairs) {
      this.suggestedAction = LL_INSTRUCTION_TYPES[0].index;
    }
    else if (confirmedEstimate == null || confirmedEstimate <= 0) {
      this.suggestedAction = LL_INSTRUCTION_TYPES[5].index;
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
    // if (this.faultDetails.userSelectedAction === LL_INSTRUCTION_TYPES[0].index) {
    //   if (this.cliNotification && this.cliNotification.responseReceived && this.cliNotification.responseReceived.isAccepted) {
    //     this.selectStageStepper(FAULT_STAGES.JOB_COMPLETION);
    //   }
    // } else 
    if (this.faultDetails.userSelectedAction === LL_INSTRUCTION_TYPES[3].index) {
      if (this.cliNotification && this.cliNotification.responseReceived) {
        if (this.cliNotification.responseReceived.isAccepted) {
          this.userSelectedActionControl.setValue(LL_INSTRUCTION_TYPES[1].index);
        } else {
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
    this.router.navigate(['faults/dashboard'], { replaceUrl: true });
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
    }
  }

  async proceedToNextStage() {
    document.querySelector('ion-content').scrollToTop(500);

    if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_LOGGED) {
      let faultRequestObj = this.createFaultFormValues();
      faultRequestObj.isDraft = false;
      faultRequestObj.stage = this.faultDetails.stage;
      let res = await this.updateFaultDetails(faultRequestObj);
      this.uploadFiles(this.faultId, false);
      if (res) {
        this.stepper.selectedIndex = FAULT_STAGES_INDEX.FAULT_QUALIFICATION;
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
      if (this.cliNotification) {
        if (!this.isUserActionChange) {
          this.commonService.showAlert('Warning', 'Please choose one option to proceed.');
          return;
        }
        if (this.cliNotification.responseReceived == null || this.cliNotification.responseReceived.isAccepted == null) {
          if (this.isUserActionChange) {
            await this.voidNotification();
          }
        }
      } else {
        this.isUserActionChange = false;
      }

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
            return;
          }
          if (this.landlordInstFrom.controls['contractor'].invalid) {
            return;
          }
          var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Proceed with Worksorder" action.<br/> Are you sure?', '', 'Yes', 'No');
          if (response) {
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
          }
          break;
        case LL_INSTRUCTION_TYPES[2].index: //cli006c
          var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Obtain Quote" action.<br/>  Are you sure?', '', 'Yes', 'No');
          if (response) {
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
          }
          break;
        case LL_INSTRUCTION_TYPES[4].index: //cli006e
          if (!this.landlordInstFrom.value.confirmedEstimate) {
            this.commonService.showAlert('Landlord Instructions', 'Please fill the confirmed estimate field.');
            return;
          }
          if (this.landlordInstFrom.controls['contractor'].invalid) {
            return;
          }
          var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "EMERGENCY/URGENT – proceed as agent of necessity" action.<br/> Are you sure?', '', 'Yes', 'No');
          if (response) {
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
          }
          break;
        case LL_INSTRUCTION_TYPES[0].index: //cli006a
          var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Landlord does their own repairs" action. This will send out a notification to Landlord. <br/> Are you sure?', '', 'Yes', 'No');
          if (response) {
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
              this.refreshDetailsAndStage();
              this.commonService.showLoader();
              setTimeout(async () => {
                await this.checkFaultNotifications(this.faultId);
                this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
                if (this.cliNotification && this.cliNotification.responseReceived && this.cliNotification.responseReceived.isAccepted) {
                  this.selectStageStepper(FAULT_STAGES.JOB_COMPLETION);
                }
              }, 3000);
            });
          }
          break;
        case LL_INSTRUCTION_TYPES[3].index: //cli006d
          if (!this.landlordInstFrom.value.confirmedEstimate) {
            this.commonService.showAlert('Landlord Instructions', 'Please fill the confirmed estimate field.');
            return;
          }
          if (this.landlordInstFrom.controls['contractor'].invalid) {
            return;
          }
          var response = await this.commonService.showConfirm('Landlord Instructions', `You have selected the "Obtain Landlord's Authorisation" action. This will send out a notification to Landlord. <br/> Are you sure?`, '', 'Yes', 'No');
          if (response) {
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
              this.refreshDetailsAndStage();
              this.commonService.showLoader();
              setTimeout(async () => {
                await this.checkFaultNotifications(this.faultId);
                this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[3].index);
                if (this.cliNotification && this.cliNotification.responseReceived) {
                  if (this.cliNotification.responseReceived.isAccepted) {
                    this.userSelectedActionControl.setValue(LL_INSTRUCTION_TYPES[1].index);
                  } else {
                    this.userSelectedActionControl.setValue(LL_INSTRUCTION_TYPES[2].index);
                  }
                }
              }, 3000);
            });
          }
          break;
        case LL_INSTRUCTION_TYPES[5].index: //cli006f
          if (this.landlordInstFrom.controls['contractor'].invalid) {
            return;
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
            if (this.landlordInstFrom.get('confirmedEstimate').hasError('pattern')) {
              this.commonService.showAlert('Get an Estimate?', 'Please fill the valid confirmed estimate.');
            } else {
              this.commonService.showAlert('Get an Estimate?', 'Please fill the confirmed estimate.');
            }

          }
          break;
        default:
          this.commonService.showAlert('Landlord Instructions', 'Please select any action');
          break;

      }

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
          resolve(false);
        }
      );
    });
    return promise;
  }

  private updateFaultStatus(status): Promise<any> {
    return this.faultsService.updateFaultStatus(this.faultId, status).toPromise();
  }

  private updateFaultDetails(requestObj): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFault(this.faultId, requestObj).subscribe(
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
      resolve(filtereData[0]);
      // } else {
      //   resolve(filtereData[0]);
      // }
    });
    return promise;
  }

  private handleCLInotification(notification) {

  }

  questionAction(data) {
    if (this.cliNotification && this.cliNotification.responseReceived != null) {
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
          await this.updateFaultNotification(data.value, this.cliNotification.faultNotificationId);
          this.refreshDetailsAndStage();
          await this.checkFaultNotifications(this.faultId);
          this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
          // const CHECKING_LANDLORD_INSTRUCTIONS = 13;
          // this.updateFaultStatus(CHECKING_LANDLORD_INSTRUCTIONS).then(async data => {
          //   this.refreshDetailsAndStage();
          //   await this.checkFaultNotifications(this.faultId);
          //   this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
          //   if (this.cliNotification && this.cliNotification.responseReceived && this.cliNotification.responseReceived.isAccepted) {
          //     this.selectStageStepper(FAULT_STAGES.JOB_COMPLETION);
          //   }
          // });
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
        }
      });
    }
  }

  private questionActionLandlordAuth(data) {
    if (!data.value) {
      this.commonService.showConfirm(data.text, 'Are you sure?', '', 'Yes', 'No').then(async res => {
        if (res) {
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
      this.commonService.showConfirm(data.text, 'Are you sure?', '', 'Yes', 'No').then(async res => {
        if (res) {
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
  }

  private questionActionJobComplete(data) {
    if (!data.value) {
      this.commonService.showConfirm(data.text, 'Are you sure to arrange a contractor?', '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(data.value, this.cliNotification.faultNotificationId);
          this.refreshDetailsAndStage();
          await this.checkFaultNotifications(this.faultId);
          this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
        }
      });
    }
    else if (data.value) {
      this.commonService.showConfirm(data.text, 'Are you sure the repair is complete?', '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(data.value, this.cliNotification.faultNotificationId);
          this.refreshDetailsAndStage();
          await this.checkFaultNotifications(this.faultId);
          this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
          // await this.markJobComplete(this.faultId);
        }
      });
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

  async showRefreshPopup(val) {
    // if (val != '' && this.landlordInstFrom.get('confirmedEstimate').valid && val !== this.faultDetails.confirmedEstimate) {
    //   var response = await this.commonService.showAlert('Landlord Instructions', 'Please click Refresh to check if the Suggested Action has changed based on the estimate you have entered');
    // }
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
    }
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

  // private getDocs() {
  //   const uniqueSet = this.files.map(data => data.folderName);
  //   this.folderNames = uniqueSet.filter(this.onlyUnique);
  // }

  filterByGroupName(folderName) {
    this.filteredDocuments = this.files.filter(data => data.folderName === folderName);
    this.mediaType = 'documents';
    this.folderName = folderName;
  }

  goBackToUpload(value) {
    this.mediaType = value;
    this.filteredDocuments == null;
  }

  async deleteDocument(documentId, i: number) {
    const response = await this.commonService.showConfirm('Delete Media/Document', 'Do you want to delete the media/document?', '', 'YES', 'NO');
    if (response) {
      this.faultsService.deleteDocument(documentId).subscribe(response => {
        this.removeFile(i);
        this.filteredDocuments.splice(i, 1);
        if (this.filteredDocuments.length == 0) {
          // this.getDocs();
          this.prepareDocumentsList();
          this.mediaType = 'upload';
        }
      });
    }
  }

  changeString(data): string {
    if (data) {
      return data.replace(/_/g, " ");
    }
  }

  // getFileType(name): boolean {
  //   if (name != null) {
  //     let data = name.split('.')[1] === 'pdf';
  //     if (data) {
  //       return true;
  //     }
  //   }
  // }
  private prepareDocumentsList() {
    if (this.files.length > 0) {
      this.files.forEach((e, i) => {
        this.files[i].folderName = e.folderName.replace(/_/g, " ");
        if (e.name != null && DOCUMENTS_TYPE.indexOf(e.name.split('.')[1]) !== -1) {
          this.files[i].isImage = false;
        }
        else { this.files[i].isImage = true; }
      });
      const uniqueSet = this.files.map(data => data.folderName);
      this.folderNames = uniqueSet.filter(this.onlyUnique);
    }
  }


  downloadDocumentByURl(url) {
    this.commonService.downloadDocumentByUrl(url);
  }

  async llContractor() {

    if (!this.isContractorModal){
      this.isContractorModal = true;
      const modal = await this.modalController.create({
        component: ContractorDetailsModalPage,
        cssClass: 'modal-container',
        componentProps: {
          faultId: this.faultId,
          landlordId: this.landlordDetails.landlordId,
          llContractorDetails: this.faultDetails.landlordOwnContractor
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
      'additionalWorkDetails': "",
      'isAccepted': true,
      'isAnyFurtherWork': false,
      'isVoided': false,
      'jobCompletionDate': this.commonService.getFormatedDate(new Date()),
      'submittedByType': "SECUR_USER"
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
        this.refreshDetailsAndStage();
        this.commonService.showLoader();
        await this.checkFaultNotifications(this.faultId);
        this.cliNotification = await this.filterNotifications(this.faultNotifications, FAULT_STAGES.LANDLORD_INSTRUCTION, LL_INSTRUCTION_TYPES[0].index);
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
    if (this.cliNotification && this.faultDetails.status !== 18 && this.cliNotification.nextChaseDueAt) {
      let msec = new Date(this.cliNotification.nextChaseDueAt).getTime() - new Date(currentDateTime).getTime();
      let mins = Math.floor(msec / 60000);
      let hrs = Math.floor(mins / 60);
      this.cliNotification.hoursLeft = hrs != 0 ? `${hrs} hours` : `${mins} minutes`;
    }
  }
}