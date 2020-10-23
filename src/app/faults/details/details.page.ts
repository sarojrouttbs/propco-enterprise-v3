import { ModalController } from '@ionic/angular';
import { SearchPropertyPage } from './../../shared/modals/search-property/search-property.page';
import { REPORTED_BY_TYPES, PROPCO } from './../../shared/constants';
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
  priorityList = [{ title: 'Non urgent', value: 1 }, { title: 'Urgent', value: 2 }, { title: 'Emergency', value: 3 }];
  reportedByTypes = REPORTED_BY_TYPES;
  lookupdata: any;
  agreementStatuses: any[];
  landlordsOfproperty = [];
  faultReportedByThirdParty: any[];
  propertyTenants: any[] = [];
  allGuarantors: any[] = [];
  tenantIds: any[] = [];
  tenantArrears: any;

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
    this.initiateFault();
  }

  ngOnInit() {
    // this.catList.map((cat, index) => {
    //   this.categoryMap.set(cat.index, cat.value);
    //   cat.imgPath = this.categoryIconList[index];
    // });
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

  initiateFault() {
    if (!this.propertyId) {
      this.searchProperty();
    } else {
      this.getLookupData();
      this.faultId = this.route.snapshot.paramMap.get('faultId');
      if (this.faultId) {
        /*update process*/
      }
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
      title: ['', Validators.required],
      urgencyStatus: [1, Validators.required],
      category: ['', Validators.required]
    });
  }

  initFaultDetailsForm(): void {
    this.faultDetailsForm = this.fb.group({
      notes: ['', Validators.required],
      additionalInfo: this.fb.array([])
    });
  }

  initaddAdditionalDetForm(): void {
    this.addAdditionalDetForm = this.fb.group({
      label: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  initAccessInfiForm(): void {
    this.accessInfoForm = this.fb.group({
      tenantNotes: '',
      areOccupiersVulnerable: '',
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
      selectedEntity: ['', Validators.required]
    });
  }

  initUploadDocForm(): void {
    this.uploadDocForm = this.fb.group({
      photos: this.fb.array([])
    });
  }

  initialApiCall() {
    forkJoin([
      this.getFaultAdditionalInfo(),
      this.getPropertyById(),
      this.getPropertyTenancies(),
      this.getHMOLicenceDetails()
    ]);
  }

  getPropertyById(): void {
    this.faultService.getPropertyById(this.propertyId).subscribe(
      res => {
        if (res && res.data) {
          this.propertyDetails = res.data;
        } else {
          this.propertyDetails = {};
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getPropertyTenancies(): void {
    this.faultService.getPropertyTenancies(this.propertyId).subscribe(
      res => {
        if (res && res.data) {
          this.propertyTenancyDetails = res.data.filter(x => x.hasCheckedIn);
          if (this.propertyTenancyDetails) {
            this.propertyDetails.isPropertyCheckedIn = true;
            for (let i = 0; i < this.propertyTenancyDetails.length; i++) {
              const tenants = this.propertyTenancyDetails[i].tenants;
              for (let j = 0; j < tenants.length; j++) {
                let filterTenantsId = tenants.filter(data => data.tenantId);
                this.tenantIds = filterTenantsId.map(d => d.tenantId)
              }
            }
          }
        }
        if (this.tenantIds) {
          this.getTenantArrears(this.tenantIds)
        }
      },
      error => {
        console.log(error);
      }
    );
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


  getHMOLicenceDetails(): void {
    this.faultService.getHMOLicenceDetailsAgainstProperty(this.propertyId).subscribe(
      res => {
        if (res && res.data) {
          this.propertyHMODetails = res.data;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getFaultAdditionalInfo(): void {
    this.faultService.getFaultAdditionalInfo().subscribe(
      res => {
        if (res) {
          this.addtionalInfo = res;
        }
      },
      error => {
        console.log(error);
      }
    );
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


  uploadFile(faultId) {
    let apiObservableArray = [];
    let uploadedDoc = this.uploadDocForm.controls.photos.value;
    uploadedDoc.forEach(data => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('folderName', '1');
      formData.append('headCategory', 'Legal');
      formData.append('subCategory', 'Addendum');
      apiObservableArray.push(this.faultService.uploadDocument(formData, faultId));
    });
    setTimeout(() => {
      forkJoin(apiObservableArray).subscribe(() => {
        this.router.navigate(['faults/dashboard'], { replaceUrl: true })
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
    this.describeFaultForm.get('urgencyStatus').setValue(urgencyStatus);
  }

  getCategoryName() {
    return this.categoryMap.get(this.describeFaultForm.controls['category'].value);
  }

  getUrgencyName() {
    return this.priorityList.find(x => x.value === this.describeFaultForm.controls['urgencyStatus'].value).title;
  }

  editTitle(title: any) {
    this.describeFaultForm.controls['title'].setValue(title);
  }

  get additionalInfoControls() {
    return this.faultDetailsForm.get('additionalInfo')['controls'];
  }

  createAdditionalInfo(detail) {
    const infoArray = this.faultDetailsForm.get('additionalInfo') as FormArray;
    infoArray.push(this.fb.group({
      label: [detail.label, Validators.required],
      value: [detail.value, Validators.required]
    }));
    this.addAdditionalDetForm.reset();
  }

  removeInfo(i: number) {
    const infoArray = this.faultDetailsForm.get('additionalInfo') as FormArray;
    infoArray.removeAt(i);
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
    if (reportedBy == 'LANDLORD') {
      this.reportedByForm.get('reportedById').setValue(entity.landlordId);
    } else if (reportedBy == 'TENANT') {
      this.reportedByForm.get('reportedById').setValue(entity.tenantId);
    } else if (reportedBy == 'GUARANTOR') {
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
    let faultDetails = {
      urgencyStatus: this.describeFaultForm.get('urgencyStatus').value,
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
      isDraft: false
    }

    this.faultService.createFault(faultDetails).subscribe(
      res => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Fault Created Successfully', 'Fault', 'success');
        this.uploadFile(res.faultId);
      },
      error => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Something went wrong', 'Fault', 'Error');
        console.log(error);
      }
    );
  }

  checkFormsValidity() {
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

  async searchProperty() {
    const modal = await this.modalController.create({
      component: SearchPropertyPage,
      cssClass: 'modal-container entity-search',
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
      console.log(res)
      if (res.data.propertyId) {
        this.propertyId = res.data.propertyId;
        this.initiateFault();
      } else {
        this.router.navigate(['faults/dashboard'], { replaceUrl: true });
      }
    });
    await modal.present();
  }

}
