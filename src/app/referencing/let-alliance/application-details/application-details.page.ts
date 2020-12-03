import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PROPCO } from 'src/app/shared/constants';
import { AddressModalPage } from 'src/app/shared/modals/address-modal/address-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchPropertyPage } from 'src/app/shared/modals/search-property/search-property.page';
import { TenantListModalPage } from 'src/app/shared/modals/tenant-list-modal/tenant-list-modal.page';
import { MatStepper } from '@angular/material/stepper';
import { LetAllianceService } from '../let-alliance.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.page.html',
  styleUrls: ['./application-details.page.scss'],
})
export class ApplicationDetailsPage implements OnInit {
  @ViewChild('stepper', { static: false }) stepper: MatStepper;
  tenancyDetailsForm: FormGroup;
  propertyDetailsForm: FormGroup;
  tenantDetailsForm: FormGroup;
  tenancyDetailsAccordion: any = {};
  propertyDetailsAccordion: any = {};
  tenantDetailsAccordion: any = {};
  propertyDetails: applicationModels.IPropertyResponse;
  propertyTenancyList: applicationModels.ITenancyResponse;
  propertyTenantList: applicationModels.ITenantListResponse;
  tenantDetails: applicationModels.ITenantResponse;
  propertyId = null;
  lookupdata: any;
  laLookupdata: any;
  currentStepperIndex = 0;
  hasTenants = false;
  isPropertyTabDetailSubmit;
  isTenantTabDetailSubmit;
  current = 0;
  previous;

  managementStatusTypes: any;
  tenantTypes: any;
  titleTypes: any;
  maritalStatusTypes: any;

  address: any = {
    addressLine1: 'address Line 1',
    addressLine2: 'address Line 2',
    locality: 'address Line 3',
    postcode: 'address Line 4'
  };

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private letAllianceService: LetAllianceService
    ) {
  }

  ngOnInit() {
    this.tenancyDetailsAccordion.expanded = true;
    this.propertyDetailsAccordion.expanded = false;
    this.tenantDetailsAccordion.expanded = true;
  }
  
  ionViewDidEnter() {
    this.propertyId = this.route.snapshot.queryParamMap.get('pId');
    this.initiateApplication();
  }

  initiateApplication() {
    if (!this.propertyId) {
      this.searchProperty();
    } else {
      this.getLookupData();
      this.initiateForms();
      this.initialApiCall();
    }
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.laLookupdata = this.commonService.getItem(PROPCO.LA_LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }

    if (this.laLookupdata) {
      this.setLALookupData(this.lookupdata);
    } else {
      this.letAllianceService.getLALookupData().subscribe(data => {
        this.commonService.setItem(PROPCO.LA_LOOKUP_DATA, data);
        this.laLookupdata = data;
        this.setLALookupData(data);
      });
    }
  }

  private setLookupData(data: any) {
  }
  
  private setLALookupData(data: any) {
    this.managementStatusTypes = this.laLookupdata.managementStatusTypes;
    this.tenantTypes = this.laLookupdata.tenantTypes;
    this.titleTypes = this.laLookupdata.titleTypes;
    this.maritalStatusTypes = this.laLookupdata.maritalStatusTypes;
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
         //this.initiateApplication();
         this.selectTenant();
       } else {
         this.router.navigate(['/let-alliance/dashboard'], { replaceUrl: true });
       }
     });
    await modal.present();
  }

  async selectTenant() {
    const modal = await this.modalController.create({
      component: TenantListModalPage,
      cssClass: 'modal-container tenant-list',
      backdropDismiss: true,
      componentProps: {
        propertyId: this.propertyId,
      }
    });

    const data = modal.onDidDismiss().then(res => {
       if (res.data.length > 0) {
         this.hasTenants = true;
         this.initiateApplication();
       } else {
         this.router.navigate(['/let-alliance/dashboard'], { replaceUrl: true });
       }
     });
    await modal.present();
  }


  private initiateForms() {
    this.initTenancyDetailsForm();
    this.initPropertyDetailsForm();
    this.initTenantDetailsTabForm();
  }

  private initTenancyDetailsForm(): void {
    this.tenancyDetailsForm = this.fb.group({
      product: ['', Validators.required],
      occupants: ['', Validators.required],
      tenancyStartDate: ['', Validators.required],
      terms: ['', [Validators.required, Validators.min(1), Validators.max(36)]],
      offerNDS: [''],
      referencePaid: ['', Validators.required],
    });
  }

  private initPropertyDetailsForm(): void {
    this.propertyDetailsForm = this.fb.group({
      managementType: ['', Validators.required],
      advertisementRent: ['', Validators.required],
    });
  }

  private initTenantDetailsTabForm(): void {
    this.tenantDetailsForm = this.fb.group({
      completeMethod: ['', Validators.required],
      product: ['', Validators.required],
      tenantType: ['', Validators.required],
      title: ['', Validators.required],
      otherTitle: [''],
      forename: [''],
      middleName: [''],
      surname: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      tenantOtherName: ['', Validators.required],
      tenantTypeTitle: [''],
      otherforeName: [''],
      otherMiddle: [''],
      otherSurname: [''],
      email: [''],
      maritalStatus: [''],
      nationality: [''],
      registerationNumber: [''],
      rentShare: ['', Validators.required],

    });
  }

  private async initialApiCall() {
    this.commonService.showLoader();
    forkJoin([
      this.getPropertyById(),
      this.getPropertyTenantList(),
      this.getTenantDetails(),
      this.getPropertyTenancyList()
    ]).subscribe(async (values) => {
      // this.commonService.hideLoader();
      this.initPatching();
      this.setValidatorsForForms();
    });
  }

  getPropertyById() {
    const promise = new Promise((resolve, reject) => {
      this.letAllianceService.getPropertyById(this.propertyId).subscribe(
        res => {
          this.propertyDetails = res && res.data ? res.data : {};
          resolve(this.propertyDetails);
        },
        error => {
          console.log(error);
          resolve();
        }
      );
    });
    return promise;
  }

  private getPropertyTenancyList() {
    const promise = new Promise((resolve, reject) => {
      this.letAllianceService.getPropertyTenancyList(this.propertyId).subscribe(
        res => {
          this.propertyTenancyList = res && res.data ? res.data : [];
          resolve(this.propertyTenancyList);
        },
        error => {
          console.log(error);
          resolve();
        }
      );
    });
    return promise;
  }

  private getPropertyTenantList() {
    const promise = new Promise((resolve, reject) => {
      this.letAllianceService.getPropertyTenantList(this.propertyId).subscribe(
        res => {
          this.propertyTenantList = res && res.data ? res.data : [];
          resolve(this.propertyTenantList);
        },
        error => {
          console.log(error);
          resolve();
        }
      );
    });
    return promise;
  }

  getTenantDetails() {
    const promise = new Promise((resolve, reject) => {
      this.letAllianceService.getTenantDetails('ac1137a8-71c8-16d3-8171-c82704230240').subscribe(
        res => {
          this.tenantDetails = res ? res : {};
          resolve(this.tenantDetails);
        },
        error => {
          console.log(error);
          resolve();
        }
      );
    });
    return promise;
  }

  private initPatching(): void {
    this.tenancyDetailsForm.patchValue({
      tenancyStartDate: this.propertyTenancyList[0].tenancyStartDate,
    });

    this.propertyDetailsForm.patchValue({
      managementType: this.propertyDetails.managementType,
      advertisementRent: this.propertyDetails.advertisementRent,
    });
    this.tenantDetailsForm.patchValue({
      title: this.tenantDetails.title,
      forename: this.tenantDetails.forename,
      surname: this.tenantDetails.surname,
      dateOfBirth: this.tenantDetails.dateOfBirth,
      email: this.tenantDetails.email,
      maritalStatus: this.tenantDetails.maritalStatus,
      nationality: this.tenantDetails.nationality,
      //completeMethod: this.tenantDetails.urgencyStatus,
      //product: this.faultDetails.urgencyStatus,
      //tenantType: this.faultDetails.urgencyStatus,
      //otherTitle: this.tenantDetails.urgencyStatus,
      //middleName: this.tenantDetails.urgencyStatus,
      //tenantOtherName: this.tenantDetails.urgencyStatus,
      //tenantTypeTitle: this.tenantDetails.urgencyStatus,
      //otherforeName: this.tenantDetails.urgencyStatus,
      //otherMiddle: this.tenantDetails.urgencyStatus,
      //otherSurname: this.tenantDetails.urgencyStatus,
      //registerationNumber: this.tenantDetails.urgencyStatus,
      //rentShare: this.tenantDetails.urgencyStatus,
    });
  }

  private setValidatorsForForms() {
    /* if (this.reportedByForm.get('reportedBy').value === 'TENANT' || this.reportedByForm.get('reportedBy').value === 'GUARANTOR') {
      this.reportedByForm.get('agreementId').setValidators(Validators.required);
      this.reportedByForm.get('selectedEntity').setValidators(Validators.required);
    }  */
  }

  async editAddress() {
    const modal = await this.modalController.create({
      component: AddressModalPage,
      cssClass: 'modal-container'
    });
    await modal.present();
  }

  refresh(){
    location.reload();
  }

  goBack() {
    history.back();
  }

  currentSelected(event): void {
    this.previous = this.current;
    this.current = event;

    switch (this.previous) {
      case 0: {
        this.checkPropertyDetailsTabValidation();
        break;
      }
      case 1: {
        this.checkTenantDetailsTabValidation();
        break;
      }
      default: {
        break;
      }
    }
  }

  checkPropertyDetailsTabValidation(): void {
    this.isPropertyTabDetailSubmit = true;
    if (this.tenancyDetailsForm.invalid) {
      this.tenancyDetailsForm.markAllAsTouched();
    }

    if (this.propertyDetailsForm.invalid) {
      this.propertyDetailsForm.markAllAsTouched();
    }
  }

  checkTenantDetailsTabValidation(): void {
    this.isTenantTabDetailSubmit = true;
    if (this.tenantDetailsForm.invalid) {
      this.tenantDetailsForm.markAllAsTouched();
    }
  }

  async createApplication() {
    const isValid = await this.checkFormsValidity();
    if (!isValid) {
      this.commonService.showMessage('Please fill all required fields.', 'Create an Application', 'error');
      return;
    }
    this.commonService.showLoader();
    const applicationRequestObj = this.createApplicationFormValues();

    this.letAllianceService.createApplication(applicationRequestObj).subscribe(
      res => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Application has been created successfully.', 'Create an Application', 'success');
      },
      error => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Something went wrong on server, please try again.', 'Create an Application', 'Error');
        console.log(error);
      }
    );
  }

  private checkFormsValidity() {
    return new Promise((resolve, reject) => {
      let valid = false;
      const isValidTenancyDetailsForm = this.tenancyDetailsForm.valid;
      const isValidPropertyDetailsForm = this.propertyDetailsForm.valid;
      const isValidTenantDetailsForm = this.tenantDetailsForm.valid;
      if (!isValidTenancyDetailsForm) {
        this.checkPropertyDetailsTabValidation();
      }
      if (!isValidPropertyDetailsForm) {
        this.checkPropertyDetailsTabValidation();
      }
      if (!isValidTenantDetailsForm) {
        this.checkTenantDetailsTabValidation();
      }

      if (isValidTenancyDetailsForm && isValidPropertyDetailsForm && isValidTenantDetailsForm) {
        valid = true;
      }
      return resolve(valid);
    });
  }

  private createApplicationFormValues(): any {
    const applicationDetails =
      {
        propertyId: 'ac1137a8-71c8-16d3-8171-c8270420023c',
        applicantId: 'ac1137a8-71c8-16d3-8171-c82704230240',
        agreementId: 9,
        applicantItemType: 'M',
        case: {
        tenancyStartDate: '2020-11-25',
        tenancyEndDate: '2020-11-12',
        address: {
        addressLine1: '1',
        postcode: 'CV31 2DW',
        town: 'leamington',
        country: 'UK'
        },
        noOfTenantToBeReferenced: 1,
        typeId: 1,
        tenancyTerm: 12,
        monthlyRent: 500,
        managementStatus: 1,
        productId: 42
        },
        application: {
          tenantTypeId: 1,
          title: 1,
          forename: 'Edgar',
          surname: 'Cooke',
          dateOfBirth: '1990-11-11',
          rentShare: 500,
          productId: 2,
          sendTenantLink: true,
          autoSubmitLink: true,
          email: 'suraj.raturi@techblue.co.uk',
          maritalStatus: 1,
          nationality: 'UK',
          isGuarantor: false,
          hasTenantOtherName: false
        }
      };
      /* urgencyStatus: this.faultDetailsForm.get('urgencyStatus').value,
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
      stage: FAULT_STAGES.FAULT_LOGGED */
    return applicationDetails;
  }
}
