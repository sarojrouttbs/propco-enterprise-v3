import { ModalController } from '@ionic/angular';
import { SearchPropertyPage } from './../../shared/modals/search-property/search-property.page';
import { REPORTED_BY_TYPES, PROPCO, FAULT_STAGES, ERROR_MESSAGE } from './../../shared/constants';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../faults.service';

@Component({
  selector: 'fault-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss', '../../shared/drag-drop.scss'],
})
export class DetailsPage implements OnInit {

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
  accessInfoList = [{ title: 'Tenant Presense Required', value: true }, { title: 'Access with management keys', value: false }];
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
  tenantArrears: any;
  faultDetails: any;
  isEditable = false;

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

  constructor(
    private faultService: FaultsService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router, private modalController: ModalController) {
  }

  ionViewDidEnter() {
    this.propertyId = this.route.snapshot.queryParamMap.get('pId');
    this.faultId = this.route.snapshot.paramMap.get('id');
    this.initiateFault();
  }

  ngOnInit() {
    // this.catList.map((cat, index) => {
    //   this.categoryMap.set(cat.index, cat.value);
    //   cat.imgPath = this.categoryIconList[index];
    // });
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

  initiateForms() {
    this.initDescribeFaultForm();
    this.initFaultDetailsForm();
    this.initaddAdditionalDetForm();
    this.initReportedByForm();
    this.initAccessInfiForm();
    this.initUploadDocForm();
  }

  initDescribeFaultForm(): void {
    this.describeFaultForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(70)]],
      category: ['', Validators.required]
    });
  }

  initFaultDetailsForm(): void {
    this.faultDetailsForm = this.fb.group({
      notes: ['', Validators.required],
      urgencyStatus: [3, Validators.required],
      additionalInfo: this.fb.array([])
    });
  }

  initaddAdditionalDetForm(): void {
    this.addAdditionalDetForm = this.fb.group({
      label: ['', Validators.required],
      value: ['', Validators.required],
      id: ''
    });
  }

  initAccessInfiForm(): void {
    this.accessInfoForm = this.fb.group({
      tenantNotes: '',
      areOccupiersVulnerable: false,
      isTenantPresenceRequired: ['', Validators.required]
    });
  }

  initReportedByForm(): void {
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

  initUploadDocForm(): void {
    this.uploadDocForm = this.fb.group({
      photos: this.fb.array([])
    });
  }

  async initialApiCall() {
    if (this.faultId) {
      this.goToPage(3);
      const details: any = await this.getFaultDetails();
      await this.getFaultHistory();
      this.faultDetails = details;
      this.propertyId = details.propertyId;
    } else {
      this.faultDetails = {};
      this.faultDetails.status = 1;
    }

    forkJoin([
      this.getFaultAdditionalInfo(),
      this.getPropertyById(),
      this.getPropertyTenancies(),
      this.getHMOLicenceDetails()
    ]).subscribe((values) => {
      if (this.faultId) {
        this.initPatching();
      }
    });
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
  }

  setCategoryMap() {
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

  getPropertyTenancies() {
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

  deleteAdditionalInfo(infoId: string) {
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

  addAdditionalInfo(faultId: string, requestObj: any) {
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

  updateAdditionalInfo(id: string, requestObj: any) {
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
    // setTimeout(() => {
    forkJoin(apiObservableArray).subscribe(res => {
      if (res) {
        this.returnTenantArrears(res);
      }
    }, error => {
    });
    // }, 200);
  }

  private returnTenantArrears(res) {
    let arrearResponse = res.map(data => data.rentArrears);
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    this.tenantArrears = arrearResponse.reduce(reducer);
    this.propertyDetails.tenantArrears = this.tenantArrears;
  }


  getHMOLicenceDetails() {
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

  getFaultHistory() {
    const promise = new Promise((resolve, reject) => {
      this.faultService.getFaultHistory(this.faultId).subscribe(
        res => {
          if (res && res.data) {
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

  getFaultAdditionalInfo() {
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

  getLandlordsOfProperty(propertyId): void {
    this.faultService.getLandlordsOfProperty(propertyId).subscribe(
      res => {
        if (res && res.data) {
          this.landlordsOfproperty = res.data;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getPropertyTenants(propertyId, agreementId): void {
    this.faultService.getPropertyTenants(propertyId, agreementId).subscribe(
      res => {
        this.propertyTenants = res && res.data ? res.data : [];
      },
      error => {
        console.log(error);
      }
    );
  }

  getTenantsGuarantors(tenantId) {
    this.faultService.getTenantGuarantors(tenantId).subscribe(
      res => {
        this.allGuarantors = res && res.data ? this.allGuarantors.concat(res.data) : this.allGuarantors;
      },
      error => {
        console.log(error);
      }
    );
  }

  getFaultDetails() {
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

  getUploadedFile(files: FileList) {
    this.submit(files);
  }

  removeFile(i) {
    this.files.splice(i, 1);
    this.photos.removeAt(i);
  }

  createItem(data): FormGroup {
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
        this.photos.push(this.createItem({
          file: file
        }));
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.files.push({
            url: e.target.result,
            name: file.name
          })
        }
        reader.readAsDataURL(file);
      }
    }
  }


  uploadFiles(faultId) {
    let apiObservableArray = [];
    let uploadedDoc = this.uploadDocForm.controls.photos.value;
    uploadedDoc.forEach(data => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('name', data.file.name);
      formData.append('folderName', '1');
      formData.append('headCategory', 'Legal');
      formData.append('subCategory', 'Addendum');
      apiObservableArray.push(this.faultService.uploadDocument(formData, faultId));
    });
    setTimeout(() => {
      forkJoin(apiObservableArray).subscribe(() => {
        this.router.navigate(['faults/dashboard'], { replaceUrl: true });
      }, err => {
        this.router.navigate(['faults/dashboard'], { replaceUrl: true });
      });
    }, 1000);
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
    if (infoArray.at(i).get('id').value) {
      const hardDelete = await this.commonService.showConfirm('Delete Additional Info', 'Do you want to delete the info?');
      if (hardDelete) {
        const isDeleted = await this.deleteAdditionalInfo(infoArray.at(i).get('id').value);
        if (isDeleted) {
          infoArray.removeAt(i);
        }
      }
    } else {
      infoArray.removeAt(i);
    }

  }

  onSelectReprtedByType() {
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
    }
    this.reportedByForm.patchValue({
      agreementId: null,
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

  getReportedByIdList() {
    let reportedBy = this.reportedByForm.get('reportedBy').value;
    if (reportedBy === 'LANDLORD') {
      this.getLandlordsOfProperty(this.propertyId);
    }
    else if (reportedBy === 'TENANT') {
      this.getPropertyTenants(this.propertyId, this.reportedByForm.get('agreementId').value);
    }
    else if (reportedBy === 'GUARANTOR') {
      const agreementId = this.reportedByForm.get('agreementId').value;
      let agreement = this.propertyTenancyDetails.find(function (tenancy) {
        return (tenancy.agreementId == agreementId)
      });
      this.allGuarantors = [];
      if (agreement && agreement.tenants) {
        agreement.tenants.forEach(tenant => {
          this.getTenantsGuarantors(tenant.tenantId);
        });
      }
    }

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

  saveForLater() {
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
      if (this.pageNo === 3) {
        this.saveAdditionalInfoForm();
      }
    }
  }
  private saveAdditionalInfoForm() {
    this.commonService.showLoader();
    let apiObservableArray = [];
    this.faultDetailsForm.controls['additionalInfo'].value.forEach(info => {
      if (info.id) {
        apiObservableArray.push(this.updateAdditionalInfo(info.id, info));
      } else {
        apiObservableArray.push(this.addAdditionalInfo(this.faultId, info));
      }
    });
    forkJoin(apiObservableArray).subscribe(res => {
      if (res) {
        this.commonService.showMessage('Updated successfully.', 'Update Addtional Info', 'success');
        this.router.navigate(['faults/dashboard'], { replaceUrl: true });
      }
      this.commonService.hideLoader();
    }, error => {
      this.commonService.hideLoader();
    });
  }

  startProgress() {
    this.commonService.showConfirm('Start Progress', 'This will change the fault status, Do you want to continue?').then(res => {
      if (res) {
        const UNDER_REVIEW = 2; // Under review
        this.faultService.updateFaultStatus(this.faultId, UNDER_REVIEW).subscribe(data => {
          this.router.navigate(['faults/dashboard'], { replaceUrl: true });
        }, error => {
          this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Start Progress', 'Error');
          console.log(error);
        });
      }
    });
  }

}
