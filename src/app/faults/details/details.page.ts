import { REPORTED_BY_TYPES, PROPCO } from './../../shared/constants';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../faults.service';
import { tenancyData, catList, propertyData } from './cat.json';

@Component({
  selector: 'fault-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss', '../../shared/drag-drop.scss'],
})
export class DetailsPage implements OnInit {

  catList: any[] = catList;
  tenancyDataList: any[] = tenancyData;
  propertyData = propertyData;
  pageNo = 1;
  propertyId = '5eae3eee-f99b-11e8-bd34-0cc47a54d954';
  propertyDetails = [];
  propertyTenancyDetails;
  propertyHMODetails;
  addtionalInfo;
  public uploadDocForm: FormGroup;
  files = [];
  describeFaultForm: FormGroup;
  faultDetailsForm: FormGroup;
  addAdditionalDetForm: FormGroup;
  reportedByForm: FormGroup;
  accessInfoForm: FormGroup;

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
  reportedByTypes = REPORTED_BY_TYPES;
  lookupdata: any;
  agreementStatuses: any[];

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
    private route: ActivatedRoute) {
  }

  ionViewDidEnter() {
    this.initiateFault();
  }

  ngOnInit() {
    this.catList.map((cat, index) => {
      this.categoryMap.set(cat.index, cat.value);
      cat.imgPath = this.categoryIconList[index];
    });
  }

  goToPriorityPage(pageNo) {
    this.pageNo = pageNo;
  }

  initiateFault() {
    this.getLookupData();
    this.faultId = this.route.snapshot.paramMap.get('faultId');
    if (this.faultId) {
      /*update process*/
    }
    this.initiateForms();
    this.initialApiCall();
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
      reportedBy: ['', Validators.required],
      agreementId: ['', Validators.required],
      reportedById: '',
      propertyId: '',
      isDraft: false,
      tenantId: ['', Validators.required],
      title: [{ value: '', disabled: true }],
      forename: [{ value: '', disabled: true }],
      surname: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      mobile: [{ value: '', disabled: true }],
      homeTelephoneNo: [{ value: '', disabled: true }]
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
      this.getPpropertyTenancies(),
      this.getHMOLicenceDetails()
    ]);
  }

  getPropertyById(): void {
    this.faultService.getPropertyById(this.propertyId).subscribe(
      res => {
        if (res && res.data) {
          this.propertyDetails = res.data;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getPpropertyTenancies(): void {
    this.faultService.getPropertyTenancies(this.propertyId).subscribe(
      res => {
        this.propertyTenancyDetails = this.tenancyDataList;
        if (res && res.data) {
          this.propertyTenancyDetails = res.data;
        }
      },
      error => {
        console.log(error);
      }
    );
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

  getAgreementDetails(agreementId): void {
    this.faultService.getPropertyAgreementDetails(this.propertyId, agreementId).subscribe(
      res => {
        if (res && res.data) {
        }
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


  uploadFile() {
    let apiObservableArray = [];
    let uploadedDoc = this.uploadDocForm.controls.photos.value;
    uploadedDoc.forEach(data => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('folderName', '1');
      formData.append('headCategory', 'Legal');
      formData.append('subCategory', 'Addendum');
      apiObservableArray.push(this.faultService.uploadDocument(formData));
    });
    setTimeout(() => {
      forkJoin(apiObservableArray).subscribe(() => {
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

  editTitle(title: string) {
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
    this.reportedByForm.patchValue({
      agreementId: null,
      title: '',
      forename: '',
      surname: '',
      email: '',
      mobile: '',
      homeTelephoneNo: ''
    });
    this.getReportedByIdList();
  }

  getReportedByIdList() {
    let reportedBy = this.reportedByForm.get('reportedBy').value;
    let agreementId = this.reportedByForm.get('agreementId').value;
    if (reportedBy === 'GUARANTOR' && agreementId) {
      let agreement = this.propertyTenancyDetails.find((tenancy) => {
        return (tenancy.agreementId == agreementId);
      });

      if (agreement && agreement.tenants) {
        // angular.forEach(agreement.tenants, function (tenant) {
        //   getTenantsGuarantors(tenant.tenantId);
        // });
      }
    }
    else if (reportedBy === 'TENANT' && agreementId) {
      // getTenantsOfProperty(this.propertyId, agreementId);
    }
    else if (reportedBy === 'LANDLORD') {
      // getLandlordsOfProperty(this.propertyId);
    }
  }

  onSelectAgreement() {
    this.getReportedByIdList();
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

}
