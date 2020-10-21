import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../faults.service';
import { catList, propertyData } from './cat.json';

@Component({
  selector: 'fault-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss', '../../shared/drag-drop.scss'],
})
export class DetailsPage implements OnInit {

  catList: any[] = catList;
  propertyData = propertyData;
  pageNo = 1;
  faultDetails: any = {};
  propertyId = '5eae3eee-f99b-11e8-bd34-0cc47a54d954';
  propertyDetails;
  propertyTenancyDetails;
  propertyHMODetails;
  addtionalInfo;
  public uploadDocForm: FormGroup;
  files = [];
  describeFaultForm: FormGroup;
  faultDetailsForm: FormGroup;
  addAdditionalDetForm: FormGroup;
  reportedByFOrm: FormGroup;
  accessInfoForm: FormGroup;

  //MAT TABS//
  caseDetail: FormGroup;
  reported: FormGroup;
  accessInfo: FormGroup;
  manageMedia: FormGroup;
  selected = new FormControl(0);
  current = 0;
  previous;
  isCaseDetailValid;
  isReportedValid;
  isAccessInfoValid;
  isManageMediaValid;
  iscaseDetailSubmit;
  isReportedSubmit;
  isAccessInfoSubmit;
  isManageMediaSubmit;
  //MAT TABS//

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

  constructor(private faultService: FaultsService, private fb: FormBuilder, private commonService: CommonService) {
  }

  ionViewDidEnter() {
    this.initiateFault();
  }

  ngOnInit() {
    this.faultDetails.urgencyStatus = 1;
    this.catList.map((cat, index) => {
      cat.imgPath = this.categoryIconList[index];
    });

    //MAT FORMS//
    this.caseDetail = this.fb.group({
      case: ['', Validators.required],
      fault: ['', Validators.required],
      desc: ['', Validators.required],
    });

    this.reported = this.fb.group({
      reporterName: ['', Validators.required],
      tenant: ['', Validators.required],
    });

    this.accessInfo = this.fb.group({
      // access: ['', Validators.required],
    });
    this.manageMedia = this.fb.group({
      // manage: ['', Validators.required],
    });

    //MAT FORMS//
  }

  goToPriorityPage(pageNo) {
    this.pageNo = pageNo;
  }

  initiateFault() {
    this.initiateForms();
    this.initialApiCall();
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
      urgencyStatus: ['', Validators.required]
    });
  }

  initFaultDetailsForm(): void {
    this.faultDetailsForm = this.fb.group({
      notes: ['', Validators.required],
      additionalInfo: this.fb.array([])
    });
  }

  initaddAdditionalDetForm(): void {
    this.describeFaultForm = this.fb.group({
      label: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  initAccessInfiForm(): void {
    this.describeFaultForm = this.fb.group({
      tenantNotes: '',
      areOccupiersVulnerable: '',
      isTenantPresenceRequired: ['', Validators.required]
    });
  }

  initReportedByForm(): void {
    this.describeFaultForm = this.fb.group({
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
          this.addtionalInfo = res.data;
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
    this.iscaseDetailSubmit = true;
    this.isCaseDetailValid = this.caseDetail.valid;
    if(this.caseDetail.invalid){
      this.caseDetail.markAllAsTouched();
    }
  }

  reportedBy(): void {
    this.isReportedSubmit = true;
    this.isReportedValid = this.reported.valid;
  }

  saveAccessInfo(): void {
    this.isAccessInfoSubmit = true;
    this.isAccessInfoValid = this.accessInfo.valid;
  }

  manageMediaDoc(): void {
    this.isManageMediaSubmit = true;
    this.isManageMediaValid = this.manageMedia.valid;
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

}
