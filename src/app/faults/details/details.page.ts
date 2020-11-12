import { ModalController, PopoverController } from '@ionic/angular';
import { SearchPropertyPage } from './../../shared/modals/search-property/search-property.page';
import { REPORTED_BY_TYPES, PROPCO, FAULT_STAGES, ERROR_MESSAGE, ACCESS_INFO_TYPES, LL_INSTRUCTION_TYPES, FAULT_STAGES_INDEX, URGENCY_TYPES } from './../../shared/constants';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../faults.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepper } from '@angular/material/stepper';
import { debounceTime, switchMap } from 'rxjs/operators';
import { SimplePopoverPage } from 'src/app/shared/popover/simple-popover/simple-popover.page';


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
  propertyTenancyDetails: any[];
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
  landlordsOfproperty = [];
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
  faultNotifications: any[];
  notificationQuesAnswer: any;
  isMatch = false;

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

  constructor(
    private faultService: FaultsService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    public sanitizer: DomSanitizer,
    private popoverController: PopoverController
  ) {
  }

  ionViewDidEnter() {
    this.propertyId = this.route.snapshot.queryParamMap.get('pId');
    this.faultId = this.route.snapshot.paramMap.get('id');
    this.initiateFault();
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

  onSelectionChange(data) {
    if (data) {
      this.contractorEntityId = data.option.value.entityId;
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
  }

  private setLookupData(data) {
    this.agreementStatuses = data.agreementStatuses;
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
      homeTelephoneNo: [{ value: '', disabled: true }],
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
      confirmedEstimate: '',
      userSelectedAction: '',
      estimationNotes: ''
    });
    this.selectedContractor = this.landlordInstFrom.get('contractor').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.faultService.searchContractorByText(value) :
        new Observable())
    );
  }


  private async initialApiCall() {
    if (this.faultId) {
      this.goToPage(3);
      const details: any = await this.getFaultDetails();
      this.selectStageStepper(details.stage);
      this.faultDetails = details;
      this.propertyId = details.propertyId;
      this.contractorEntityId = details.contractorId;
      this.oldUserSelectedAction = this.faultDetails.userSelectedAction;
      this.getFaultDocuments(this.faultId);
      this.getFaultHistory();
      if (this.contractorEntityId) {
        let contractorDetails: any = await this.getContractorDetails(this.contractorEntityId);
        if (contractorDetails) {
          contractorDetails.fullName = contractorDetails.name;
          this.landlordInstFrom.patchValue({
            contractor: contractorDetails
          });
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
        // let landlordId = 'cd2766b6-525c-11e9-9cbf-0cc47a54d954';
        await this.getLandlordDetails(landlordId);
        this.checkForLLSuggestedAction();
        this.getPreferredSuppliers(landlordId);
        this.matchCategory();
      }
    });
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
      this.faultService.getPropertyById(this.propertyId).subscribe(
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
          resolve();
        }
      );
    });
    return promise;
  }

  private getPropertyTenancies() {
    const promise = new Promise((resolve, reject) => {
      this.faultService.getPropertyTenancies(this.propertyId).subscribe(
        res => {
          if (res && res.data) {
            this.propertyTenancyDetails = res.data.filter(x => x.hasCheckedIn);
            if (this.propertyTenancyDetails) {
              this.propertyDetails.isPropertyCheckedIn = true;
              for (let i = 0; i < this.propertyTenancyDetails.length; i++) {
                const tenants = this.propertyTenancyDetails[i].tenants;
                let tenantIdList = tenants.filter(data => data.tenantId).map(d => d.tenantId);
                this.tenantIds = this.tenantIds.concat(tenantIdList);
              }
            }
          }
          if (this.tenantIds && this.tenantIds.length) {
            this.getTenantArrears(this.tenantIds);
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

  private deleteAdditionalInfo(infoId: string) {
    const promise = new Promise((resolve, reject) => {
      this.faultService.deleteAdditionalInfo(infoId).subscribe(
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
      this.faultService.addAdditionalInfo(faultId, requestObj).subscribe(
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
      this.faultService.updateAdditionalInfo(id, requestObj).subscribe(
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
      apiObservableArray.push(this.faultService.getTenantArrearsDetails(id));
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
      this.faultService.getHMOLicenceDetailsAgainstProperty(this.propertyId).subscribe(
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
      this.faultService.getFaultHistory(this.faultId).subscribe(
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
      this.faultService.getFaultAdditionalInfo().subscribe(
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
      this.faultService.getLandlordsOfProperty(propertyId).subscribe(
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
      this.faultService.getPropertyTenants(propertyId, agreementId).subscribe(
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
      this.faultService.getTenantGuarantors(tenantId).subscribe(
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
      this.faultService.getFaultDetails(this.faultId).subscribe(
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
      this.faultService.getLandlordDetails(landlordId).subscribe(
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
      this.faultService.getPreferredSuppliers(landlordId).subscribe(
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
      this.faultService.getContractorDetails(contractorId).subscribe(res => {
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
    this.files.splice(i, 1);
    this.photos.removeAt(i);
  }

  private createItem(data): FormGroup {
    return this.fb.group(data);
  }

  get photos(): FormArray {
    return this.uploadDocForm.get('photos') as FormArray;
  };

  submit(files) {
    if (this.files.length + files.length > 5) {
      this.commonService.showMessage("You are only allowed to upload a maximum of 5 files", "Warning", "warning");
      return;
    }
    if (files) {
      for (let file of files) {
        let isImage: boolean = false;
        console.log(file.type.split("/")[0])
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
      formData.append('folderName', this.faultDetails.status + '' || '1');
      formData.append('headCategory', 'Legal');
      formData.append('subCategory', 'Addendum');
      apiObservableArray.push(this.faultService.uploadDocument(formData, faultId));
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
    this.faultService.getFaultDocuments(faultId).subscribe(response => {
      if (response) {
        this.files = response.data;
      }
    })
  }

  downloadFaultDocument(documentId, name) {
    let fileName = name.split('.')[1];
    this.faultService.downloadDocument(documentId).subscribe(response => {
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
      homeTelephoneNo: '',
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
        let agreement = this.propertyTenancyDetails.find(function (tenancy) {
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
      homeTelephoneNo: entity.homeTelephoneNo
    });
  }

  async createAFault() {
    let isValid = await this.checkFormsValidity();
    if (!isValid) {
      this.commonService.showMessage('Please fill all required fields.', 'Log a Fault', 'error');
      return;
    }
    if (!this.files.length) {
      this.commonService.showMessage('At least one fault image is required', 'Log a Fault', 'error');
      return;
    }
    this.commonService.showLoader();
    let faultRequestObj = this.createFaultFormValues();

    this.faultService.createFault(faultRequestObj).subscribe(
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
      backdropDismiss: false
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
      this.faultService.createFault(faultRequestObj).subscribe(
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
    faultRequestObj.isDraft = this.faultDetails.isDraft;
    if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.LANDLORD_INSTRUCTION) {
      faultRequestObj.stage = this.faultDetails.stage;
      faultRequestObj.isDraft = this.faultDetails.isDraft;
      faultRequestObj.userSelectedAction = this.faultDetails.userSelectedAction;
      Object.assign(faultRequestObj, this.landlordInstFrom.value);
      if (this.contractorEntityId) {
        faultRequestObj.contractorId = this.contractorEntityId;
      } else {
        delete faultRequestObj.contractorId;
      }
    }

    this.faultService.updateFault(this.faultId, faultRequestObj).subscribe(
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
      const UNDER_REVIEW = 2; // Under review
      this.faultService.updateFaultStatus(this.faultId, UNDER_REVIEW).subscribe(data => {
        this.refreshDetailsAndStage();
      }, error => {
        this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Start Progress', 'Error');
        console.log(error);
      });
    }
  }

  private async refreshDetailsAndStage() {
    const details: any = await this.getFaultDetails();
    this.selectStageStepper(details.stage);
    this.faultDetails = details;
    this.oldUserSelectedAction = this.faultDetails.userSelectedAction;
  }


  reOpenFault() {
    this.commonService.showConfirm('Re-open Fault', 'This will reopen the fault and notify the property manager.<br/> Are you sure?').then(res => {
      if (res) {
        const UNDER_REVIEW = 2; // Under review
        this.faultService.updateFaultStatus(this.faultId, UNDER_REVIEW).subscribe(data => {
          this.router.navigate(['faults/dashboard'], { replaceUrl: true });
        }, error => {
          this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Re-open Fault', 'Error');
          console.log(error);
        });
      }
    });
  }

  setUserAction(index) {
    if (this.faultDetails.status == 15 && (this.faultNotifications && !this.faultNotifications[0].responseReceived)) {
      this.commonService.showAlert('Landlord Instructions', 'Please select repair action first.');
      return;
    }
    this.faultDetails.userSelectedAction = index;

  }

  private checkForLLSuggestedAction() {
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
    else if (confirmedEstimate > this.propertyDetails.expenditureLimit) {
      this.suggestedAction = LL_INSTRUCTION_TYPES[2].index;
    }
    else if (confirmedEstimate <= this.propertyDetails.expenditureLimit) {
      this.suggestedAction = LL_INSTRUCTION_TYPES[1].index;
    }

    // }
    if (this.faultDetails.userSelectedAction === LL_INSTRUCTION_TYPES[0].index && this.faultDetails.status === 15) {
      this.initLandlordInstructions(this.faultId);
    }
  }

  private matchCategory(){
    if (this.landlordDetails.repairCategories){
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
    // if (this.stepper.selectedIndex < FAULT_STAGES_INDEX[this.faultDetails.stage]) {
    //   this.stepper.selectedIndex = this.stepper.selectedIndex + 1;
    //   return;
    // }

    if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_LOGGED) {
      let faultRequestObj = this.createFaultFormValues();
      faultRequestObj.isDraft = this.faultDetails.isDraft;
      faultRequestObj.stage = this.faultDetails.stage;
      let res = await this.updateFaultDetails(faultRequestObj);
      this.uploadFiles(this.faultId, false);
      if (res) {
        this.stepper.selectedIndex = FAULT_STAGES_INDEX.FAULT_QUALIFICATION;
      }
    }
    else if (this.stepper.selectedIndex === FAULT_STAGES_INDEX.FAULT_QUALIFICATION) {
      let faultRequestObj = {} as FaultModels.IFaultResponse;
      faultRequestObj.isDraft = this.faultDetails.isDraft;
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
      let faultRequestObj = {} as FaultModels.IFaultResponse;
      faultRequestObj.isDraft = this.faultDetails.isDraft;
      Object.assign(faultRequestObj, this.landlordInstFrom.value);
      if (this.contractorEntityId) {
        faultRequestObj.contractorId = this.contractorEntityId;
      } else {
        delete faultRequestObj.contractorId;
      }

      switch (this.faultDetails.userSelectedAction) {
        case LL_INSTRUCTION_TYPES[1].index: //cli006b
          var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Proceed with Worksorder" action. This will send out a notification to Landlord, Tenant and a Contractor. <br/> Are you sure?', '', 'Yes', 'No');
          if (response) {
            faultRequestObj.stage = FAULT_STAGES.ARRANGING_CONTRACTOR;
            faultRequestObj.userSelectedAction = this.faultDetails.userSelectedAction;
            const WORKS_ORDER_PENDING = 19;
            forkJoin([this.updateFaultDetails(faultRequestObj), this.updateFaultStatus(WORKS_ORDER_PENDING)]).subscribe(data => {
              // this.stepper.selectedIndex = FAULT_STAGES_INDEX.ARRANGING_CONTRACTOR;
              this.refreshDetailsAndStage();
            });
          }
          break;
        case LL_INSTRUCTION_TYPES[2].index: //cli006c
          var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Obtain Quote" action.<br/>  Are you sure?', '', 'Yes', 'No');
          if (response) {
            faultRequestObj.stage = FAULT_STAGES.ARRANGING_CONTRACTOR;
            faultRequestObj.userSelectedAction = this.faultDetails.userSelectedAction;
            const AWAITING_QUOTE = 14;
            forkJoin([this.updateFaultDetails(faultRequestObj), this.updateFaultStatus(AWAITING_QUOTE)]).subscribe(data => {
              // this.stepper.selectedIndex = FAULT_STAGES_INDEX.ARRANGING_CONTRACTOR;
              this.refreshDetailsAndStage();
            });
          }
          break;
        case LL_INSTRUCTION_TYPES[4].index: //cli006e
          var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "EMERGENCY/URGENT – proceed as agent of necessity" action. <br/> Are you sure?', '', 'Yes', 'No');
          if (response) {
            faultRequestObj.stage = FAULT_STAGES.ARRANGING_CONTRACTOR;
            faultRequestObj.userSelectedAction = this.faultDetails.userSelectedAction;
            const WORKS_ORDER_PENDING = 19;
            forkJoin([this.updateFaultDetails(faultRequestObj), this.updateFaultStatus(WORKS_ORDER_PENDING)]).subscribe(data => {
              // this.stepper.selectedIndex = FAULT_STAGES_INDEX.ARRANGING_CONTRACTOR;
              this.refreshDetailsAndStage();
            });
          }
          break;
        case LL_INSTRUCTION_TYPES[0].index: //cli006a
          var response = await this.commonService.showConfirm('Landlord Instructions', 'You have selected the "Landlord does their own repairs" action. This will send out a notification to Landlord. <br/> Are you sure?', '', 'Yes', 'No');
          if (response) {
            faultRequestObj.stage = FAULT_STAGES.LANDLORD_INSTRUCTION;
            faultRequestObj.userSelectedAction = this.faultDetails.userSelectedAction;
            const AWAITING_RESPONSE_LANDLORD = 15;
            forkJoin([this.updateFaultDetails(faultRequestObj), this.updateFaultStatus(AWAITING_RESPONSE_LANDLORD)]).subscribe(data => {
              this.refreshDetailsAndStage();
              this.commonService.showLoader();
              setTimeout(() => {
                this.initLandlordInstructions(this.faultId);
              }, 3000);
            });
          }
          break;
        case LL_INSTRUCTION_TYPES[3].index: //cli006d
          break;
        case LL_INSTRUCTION_TYPES[5].index: //cli006f
          if (this.landlordInstFrom.get('confirmedEstimate').value > 0) {
            faultRequestObj.stage = FAULT_STAGES.LANDLORD_INSTRUCTION;
            // faultRequestObj.userSelectedAction = this.faultDetails.userSelectedAction;
            let res = await this.updateFaultDetails(faultRequestObj);
            if (res) {
              await this.refreshDetailsAndStage();
              this.checkForLLSuggestedAction();
            }
          } else {
            this.commonService.showAlert('Get an Estimate?', 'Please fill the confirmed estimate.');
          }
          break;
        default:
          this.commonService.showAlert('Landlord Instructions', 'Please select any action');
          break;

      }

    }

  }

  private updateFaultStatus(status): Promise<any> {
    return this.faultService.updateFaultStatus(this.faultId, status).toPromise();
  }

  private updateFaultDetails(requestObj): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultService.updateFault(this.faultId, requestObj).subscribe(
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

  initLandlordInstructions(faultId) {
    this.faultService.getFaultNotifications(faultId).subscribe(async (response) => {
      if (response) {
        this.faultNotifications = response.data;
        for (let i = 0; i < this.faultNotifications.length; i++) {
          this.notificationQuesAnswer = this.faultNotifications[i].questions;
        }
        if (this.faultNotifications[0].responseReceived && this.faultNotifications[0].responseReceived.isAccepted) {
          // this.refreshDetailsAndStage();
          this.selectStageStepper(FAULT_STAGES.JOB_COMPLETION);
          // let requestObj = {} as FaultModels.IFaultResponse;
          // requestObj.stage = FAULT_STAGES.JOB_COMPLETION;
          // requestObj.isDraft = this.faultDetails.isDraft;
          // let res = await this.updateFaultDetails(requestObj);
          // if(res){
          //   this.refreshDetailsAndStage();
          // }
        }
      }
    })
  }

  questionAction(data) {
    if(this.faultNotifications && !this.faultNotifications[0].responseReceived){
      return;
    }
    if (!data.value) {
      this.commonService.showConfirm(data.text, 'This will change status back to "Checking Landlord Instruction". </br> Are you Sure?', '', 'Yes', 'No').then(res => {
        if (res) {
          let faultRequestObj = {} as FaultModels.IFaultResponse
          faultRequestObj.stage = FAULT_STAGES.LANDLORD_INSTRUCTION;
          faultRequestObj.isDraft = this.faultDetails.isDraft;
          const CHECKING_LANDLORD_INSTRUCTIONS = 13;
          forkJoin([this.updateFaultDetails(faultRequestObj), this.updateFaultStatus(CHECKING_LANDLORD_INSTRUCTIONS), this.updateFaultNotification(data.value)]).subscribe(data => {
            this.refreshDetailsAndStage();
          });
        }
      });
    }
    else if (data.value) {
      this.commonService.showConfirm(data.text, 'This will change the stage to "Job Completion". </br> Are you Sure?', '', 'Yes', 'No').then(res => {
        if (res) {
          let faultRequestObj = {} as FaultModels.IFaultResponse
          faultRequestObj.stage = FAULT_STAGES.JOB_COMPLETION;
          faultRequestObj.isDraft = this.faultDetails.isDraft;
          forkJoin([this.updateFaultDetails(faultRequestObj), this.updateFaultNotification(data.value)]).subscribe(data => {
            this.refreshDetailsAndStage();
          });
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

  private updateFaultNotification(data) :Promise<any>{
    const faultNotificationId = this.faultNotifications[0].faultNotificationId;
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isAccepted = data;
    return this.faultService.updateNotification(faultNotificationId, notificationObj).toPromise();
  }

}
