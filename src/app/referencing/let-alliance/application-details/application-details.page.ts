import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PROPCO, REFERENCING, REFERENCING_TENANT_TYPE } from 'src/app/shared/constants';
import { AddressModalPage } from 'src/app/shared/modals/address-modal/address-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchPropertyPage } from 'src/app/shared/modals/search-property/search-property.page';
import { TenantListModalPage } from 'src/app/shared/modals/tenant-list-modal/tenant-list-modal.page';
import { MatStepper } from '@angular/material/stepper';
import { forkJoin } from 'rxjs';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { COMPLETION_METHODS } from 'src/app/shared/constants';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';
import { ReferencingService } from '../../referencing.service';
import { HttpParams } from '@angular/common/http';

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
  propertyDetails: letAllianceModels.IPropertyResponse;
  propertyTenancyList: letAllianceModels.ITenancyResponse;
  propertyTenantList: letAllianceModels.ITenantListResponse;
  tenantDetails: letAllianceModels.ITenantResponse;
  referencingProductList: any[] = [];
  referencingCaseProductList: any[];
  referencingApplicationProductList: any[];
  propertyId = null;
  lookupdata: any;
  referencingLookupdata: any;
  currentStepperIndex = 0;
  isPropertyTabDetailSubmit: boolean;
  isTenantTabDetailSubmit: boolean;
  current = 0;
  previous: any;
  tenantId: any;
  futureDate: string;
  currentDate = this.commonService.getFormatedDate(new Date());
  adultDate = this.datepipe.transform(new Date().setDate(new Date().getDay() - (18 * 365)), 'yyyy-MM-dd');

  managementStatusTypes: any[] = [];
  tenantTypes: any[] = [];
  titleTypes: any[] = [];
  maritalStatusTypes: any[] = [];
  agreementStatuses: any[] = [];
  proposedAgreementStatusIndex: any;
  completionMethods: any[] = COMPLETION_METHODS;

  address: any = {};
  isPropertyDetailsSubmit: boolean;
  maskedVal: any;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private referencingService: ReferencingService,
    public datepipe: DatePipe,
    private currencyPipe: CurrencyPipe
  ) {
  }

  ngOnInit() {
    this.tenancyDetailsAccordion.expanded = true;
    this.propertyDetailsAccordion.expanded = false;
    this.tenantDetailsAccordion.expanded = true;
    const date = new Date();
    date.setDate(date.getDate() + 60);
    this.futureDate = this.datepipe.transform(date, 'yyyy-MM-dd');
  }

  ionViewDidEnter() {
    this.propertyId = this.route.snapshot.queryParamMap.get('pId');
    this.tenantId = this.route.snapshot.queryParamMap.get('tId');
    this.initiateApplication();
  }

  initiateApplication() {
    this.getLookupData();
    if (this.propertyId) {
      if (this.tenantId) {
        this.initiateForms();
        this.initialApiCall();
      }
      else{
        this.selectTenant();
      }
    } else {
      this.searchProperty();
    }
  }

  private async searchProperty() {
    const modal = await this.modalController.create({
      component: SearchPropertyPage,
      cssClass: 'modal-container entity-search',
      backdropDismiss: false,
      componentProps: {
        isFAF: false,
      }
    });

    const data = modal.onDidDismiss().then(res => {
      if (res.data.propertyId) {
        this.propertyId = res.data.propertyId;
        this.selectTenant();
      } else {
        this.router.navigate(['/let-alliance/dashboard'], { replaceUrl: true });
      }
    });
    await modal.present();
  }

  private async selectTenant() {
    const modal = await this.modalController.create({
      component: TenantListModalPage,
      cssClass: 'modal-container tenant-list',
      backdropDismiss: false,
      componentProps: {
        paramPropertyId: this.propertyId,
      }
    });

    const data = modal.onDidDismiss().then(res => {
      if (res.data.tenantId) {
        this.tenantId = res.data.tenantId;
        this.initiateApplication();
      } else {
        this.router.navigate(['/let-alliance/dashboard'], { replaceUrl: true });
      }
    });
    await modal.present();
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.referencingLookupdata = this.commonService.getItem(PROPCO.REFERENCING_LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }

    if (this.referencingLookupdata) {
      this.setReferencingLookupData(this.referencingLookupdata);
    } else {
      this.referencingService.getLookupData(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(data => {
        this.commonService.setItem(PROPCO.REFERENCING_LOOKUP_DATA, data);
        this.referencingLookupdata = data;
        this.setReferencingLookupData(data);
      });
    }
  }

  private setLookupData(data: any): void {
    this.agreementStatuses = data.agreementStatuses;
  }

  private setReferencingLookupData(data: any): void {
    this.managementStatusTypes = data.managementStatusTypes;
    this.tenantTypes = data.tenantTypes;
    this.titleTypes = data.titleTypes;
    this.maritalStatusTypes = data.maritalStatusTypes;
  }

  private initiateForms() {
    this.initTenancyDetailsForm();
    this.initPropertyDetailsForm();
    this.initTenantDetailsTabForm();
  }

  private initTenancyDetailsForm(): void {
    this.tenancyDetailsForm = this.fb.group({
      productId: ['', Validators.required],
      numberOfReferencingOccupants: ['', [Validators.required]],
      tenancyStartDate: ['', [Validators.required, ValidationService.futureDateSelectValidator]],
      tenancyTerm: ['', [Validators.required, Validators.min(1), Validators.max(36), ValidationService.numberValidator]],
      paidBy: ['', [Validators.min(0), Validators.max(1)]],
      offerNds: [false]
    });
  }

  private initPropertyDetailsForm(): void {
    this.propertyDetailsForm = this.fb.group({
      managementStatus: ['', Validators.required],
      monthlyRent: ['', [Validators.required, ValidationService.amountValidator]],
    });
  }

  private initTenantDetailsTabForm(): void {
    this.tenantDetailsForm = this.fb.group({
      completeMethod: [{ value: 2, disabled: true }],
      productId: ['', Validators.required],
      tenantTypeId: [1, Validators.required],
      title: [''],
      otherTitle: [''],
      companyName: [''],
      forename: [''],
      middlename: [''],
      surname: [''],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      maritalStatus: [''],
      nationality: [''],
      registrationNumber: [''],
      rentShare: ['', [Validators.required, ValidationService.amountValidator]],
      hasTenantOtherName: [false],
      otherNames: this.fb.group({
        title: [''],
        forename: [''],
        middlename: [''],
        surname: ['']
      }),
    });
  }

  private async initialApiCall() {
    this.commonService.showLoader();
    forkJoin([
      this.getPropertyById(),
      this.getTenantDetails(),
      this.getPropertyTenancyList(),
      this.getProductList()
    ]).subscribe(async (values) => {
      // this.commonService.hideLoader();
      this.initPatching();
      this.setValidatorsForForms();
    });
  }

  private getPropertyById() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getPropertyById(this.propertyId).subscribe(
        res => {
          this.propertyDetails = res && res.data ? res.data : {};
          this.address = this.propertyDetails.address;
          resolve(this.propertyDetails);
        },
        error => {
          console.log(error);
          resolve(this.propertyDetails);
        }
      );
    });
    return promise;
  }

  private getPropertyTenancyList() {
    this.proposedAgreementStatusIndex = this.agreementStatuses.find(obj => obj.value === 'Proposed').index;
    const params = new HttpParams()
      .set('status', this.proposedAgreementStatusIndex ? this.proposedAgreementStatusIndex : '');

    const promise = new Promise((resolve, reject) => {
      this.referencingService.getPropertyTenancyList(this.propertyId, params).subscribe(
        res => {
          this.propertyTenancyList = res && res.data ? res.data : [];
          resolve(this.propertyTenancyList);
        },
        error => {
          console.log(error);
          resolve(this.propertyTenancyList);
        }
      );
    });
    return promise;
  }

  private getTenantDetails() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getTenantDetails(this.tenantId).subscribe(
        res => {
          this.tenantDetails = res ? res : {};
          resolve(this.tenantDetails);
        },
        error => {
          console.log(error);
          resolve(this.tenantDetails);
        }
      );
    });
    return promise;
  }

  private getProductList() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getProductList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(
        res => {
          this.referencingProductList = res ? this.commonService.removeDuplicateObjects(res) : [];
          this.referencingCaseProductList = this.referencingProductList.filter(obj => {
            return obj.productName.includes('Per Property');
          });

          this.referencingApplicationProductList = this.referencingProductList.filter(obj => {
            return !obj.productName.includes('Per Property');
          });
          resolve(this.referencingProductList);
        },
        error => {
          console.log(error);
          resolve(this.referencingProductList);
        });
    });

    return promise;
  }

  private initPatching(): void {
    const selectedTenantRentShare = this.propertyTenancyList[0].tenants.find(obj => obj.tenantId === this.tenantDetails.tenantId).rentShare;

    this.tenancyDetailsForm.patchValue({
      tenancyStartDate: this.propertyTenancyList[0].tenancyStartDate,
      numberOfReferencingOccupants: this.propertyTenancyList[0].numberOfReferencingOccupants
    });

    this.propertyDetailsForm.patchValue({
      managementStatus: this.propertyDetails.managementType,
      monthlyRent: this.currencyPipe.transform(this.propertyDetails.advertisementRent, 'GBP', 'symbol')
    }, { emitEvent: false });

    this.tenantDetailsForm.patchValue({
      title: this.tenantDetails.title,
      forename: this.tenantDetails.forename,
      surname: this.tenantDetails.surname,
      dateOfBirth: this.tenantDetails.dateOfBirth,
      email: this.tenantDetails.email,
      maritalStatus: this.tenantDetails.maritalStatus,
      nationality: this.tenantDetails.nationality,
      rentShare: this.currencyPipe.transform(selectedTenantRentShare, 'GBP', 'symbol')
    }, { emitEvent: false });
  }

  setValidatorsForForms() {
    if (this.tenantDetailsForm.get('tenantTypeId').value == REFERENCING_TENANT_TYPE.INDIVIDUAL) {
      this.tenantDetailsForm.get('forename').setValidators(Validators.required);
      this.tenantDetailsForm.get('surname').setValidators(Validators.required);
      this.tenantDetailsForm.get('maritalStatus').setValidators(Validators.required);
      this.tenantDetailsForm.get('companyName').clearValidators();
      this.tenantDetailsForm.get('registrationNumber').clearValidators();

      if(this.tenantDetailsForm.get('hasTenantOtherName').value){
        this.tenantDetailsForm.get('otherNames').get('title').setValidators(Validators.required);
        this.tenantDetailsForm.get('otherNames').get('forename').setValidators(Validators.required);
        this.tenantDetailsForm.get('otherNames').get('surname').setValidators(Validators.required);
        
      }
      else{
        this.tenantDetailsForm.get('otherNames').get('title').clearValidators();
        this.tenantDetailsForm.get('otherNames').get('forename').clearValidators();
        this.tenantDetailsForm.get('otherNames').get('surname').clearValidators();
      }
    } 

    else if (this.tenantDetailsForm.get('tenantTypeId').value == REFERENCING_TENANT_TYPE.COMPANY) {
      this.tenantDetailsForm.get('companyName').setValidators(Validators.required);
      this.tenantDetailsForm.get('registrationNumber').setValidators(Validators.required);
      this.tenantDetailsForm.get('forename').clearValidators();
      this.tenantDetailsForm.get('surname').clearValidators();
      this.tenantDetailsForm.get('maritalStatus').clearValidators();
      this.tenantDetailsForm.get('otherNames').get('title').clearValidators();

      if(this.tenantDetailsForm.get('hasTenantOtherName').value){
        this.tenantDetailsForm.get('otherNames').get('forename').setValidators(Validators.required);
        this.tenantDetailsForm.get('otherNames').get('surname').setValidators(Validators.required);
        
      }
      else{
        this.tenantDetailsForm.get('otherNames').get('forename').clearValidators();
        this.tenantDetailsForm.get('otherNames').get('surname').clearValidators();
      }
    }

    this.tenantDetailsForm.get('forename').updateValueAndValidity();
    this.tenantDetailsForm.get('surname').updateValueAndValidity();
    this.tenantDetailsForm.get('companyName').updateValueAndValidity();
    this.tenantDetailsForm.get('registrationNumber').updateValueAndValidity();
    this.tenantDetailsForm.get('maritalStatus').updateValueAndValidity();
    this.tenantDetailsForm.get('otherNames').get('title').updateValueAndValidity();
    this.tenantDetailsForm.get('otherNames').get('forename').updateValueAndValidity();
    this.tenantDetailsForm.get('otherNames').get('surname').updateValueAndValidity();
  }

  onBlurCurrency(val: any, form: FormGroup) {
    if (val) {
      if (form == this.propertyDetailsForm) {
        this.propertyDetailsForm.patchValue({ monthlyRent: this.currencyPipe.transform(val, 'GBP', 'symbol', '1.2-5') }, { emitEvent: false });
      }
      if (form == this.tenantDetailsForm) {
        this.tenantDetailsForm.patchValue({ rentShare: this.currencyPipe.transform(val, 'GBP', 'symbol', '1.2-5') }, { emitEvent: false });
      }
    }
  }

  formatCurrency(val: any, form: FormGroup) {
    let latestDigit = val.replace(/\£/, '').replace(/,/g, '').replace(/.0+$/g, '');
    
    if (form == this.propertyDetailsForm) {
      this.propertyDetailsForm.patchValue({
        monthlyRent: latestDigit
      }, { emitEvent: false });
    }
    if (form == this.tenantDetailsForm) {
      this.tenantDetailsForm.patchValue({
        rentShare: latestDigit
      }, { emitEvent: false });
    }
  }

  private setDefaultAmount(val: any) {
    let latestDigit = val.replace(/\£/, '').replace(/,/g, '').replace(/.0+$/g, '');
    return latestDigit; 
  }

  async editAddress() {
    const modal = await this.modalController.create({
      component: AddressModalPage,
      cssClass: 'modal-container',
      backdropDismiss: false,
      componentProps: {
        paramAddress: this.address
      }
    });
    const data = modal.onDidDismiss().then(res => {
      if (res.data.address) {
        this.address = res.data.address;
        console.log(res);
      }
    });
    await modal.present();
  }

  refresh() {
    location.reload();
  }

  goBack() {
    history.back();
  }

  currentSelectedTab(event: any): void {
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

  private checkPropertyDetailsTabValidation(): void {
    this.isPropertyTabDetailSubmit = true;
    if (this.tenancyDetailsForm.invalid) {
      this.tenancyDetailsForm.markAllAsTouched();
    }

    if (this.propertyDetailsForm.invalid) {
      this.propertyDetailsForm.markAllAsTouched();
    }
  }

  private checkTenantDetailsTabValidation(): void {
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

    this.referencingService.createApplication(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, applicationRequestObj).subscribe(
      res => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Application has been created successfully.', 'Create an Application', 'success');
        setTimeout(() => {
          this.router.navigate(['/let-alliance/dashboard']).then(() => {
            location.reload();
          });
        }, 5000);
      },
      error => {
        this.commonService.hideLoader();
        this.commonService.showMessage(error.error.message, 'Create an Application', 'error');
      }
    );
  }

  private checkFormsValidity(): any {
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
    const tmpDate = new Date(this.tenancyDetailsForm.get('tenancyStartDate').value);
    tmpDate.setDate(tmpDate.getDate() + (this.tenancyDetailsForm.get('tenancyTerm').value * 30));

    const tmpTenant = this.propertyTenancyList[0].tenants.find(obj => obj.tenantId === this.tenantDetails.tenantId);

    const applicationDetails =
    {
      propertyId: this.propertyDetails.propertyId,
      applicantId: this.tenantDetails.tenantId,
      agreementId: this.propertyTenancyList[0].propcoAgreementId,
      applicantItemType: tmpTenant.isLead ? 'M' : 'S',
      case: {
        productId: this.tenancyDetailsForm.get('productId').value,
        numberOfReferencingOccupants: parseInt(this.tenancyDetailsForm.get('numberOfReferencingOccupants').value),
        tenancyStartDate: this.datepipe.transform(this.tenancyDetailsForm.get('tenancyStartDate').value, 'yyyy-MM-dd'),
        tenancyEndDate: this.datepipe.transform(tmpDate, 'yyyy-MM-dd'),
        tenancyTerm: this.tenancyDetailsForm.get('tenancyTerm').value,
        paidBy: parseInt(this.tenancyDetailsForm.get('paidBy').value),
        offerNds: this.tenancyDetailsForm.get('offerNds').value,
        address: this.address,
        typeId: this.tenantDetailsForm.get('tenantTypeId').value,
        monthlyRent: parseFloat(this.setDefaultAmount(this.propertyDetailsForm.get('monthlyRent').value)),
        managementStatus: this.propertyDetailsForm.get('managementStatus').value,
      },
      application: {
        productId: this.tenantDetailsForm.get('productId').value,
        tenantTypeId: this.tenantDetailsForm.get('tenantTypeId').value,
        title: this.tenantDetailsForm.get('title').value ? (this.tenantDetailsForm.get('title').value).toString() : '',
        otherTitle: this.tenantDetailsForm.get('otherTitle').value,
        forename: this.tenantDetailsForm.get('tenantTypeId').value == REFERENCING_TENANT_TYPE.INDIVIDUAL ? this.tenantDetailsForm.get('forename').value : this.tenantDetailsForm.get('companyName').value,
        middlename: this.tenantDetailsForm.get('middlename').value,
        surname: this.tenantDetailsForm.get('tenantTypeId').value == REFERENCING_TENANT_TYPE.INDIVIDUAL ? this.tenantDetailsForm.get('surname').value : '',
        email: this.tenantDetailsForm.get('email').value,
        dateOfBirth: this.datepipe.transform(this.tenantDetailsForm.get('dateOfBirth').value, 'yyyy-MM-dd'),
        rentShare: parseFloat(this.setDefaultAmount(this.tenantDetailsForm.get('rentShare').value)),
        maritalStatus: this.tenantDetailsForm.get('maritalStatus').value,
        nationality: 'British', //this.tenantDetailsForm.get('nationality').value, // British
        registrationNumber: this.tenantDetailsForm.get('registrationNumber').value,
        sendTenantLink: true,
        autoSubmitLink: true,
        isGuarantor: false,
        hasTenantOtherName: this.tenantDetailsForm.get('hasTenantOtherName').value,
        otherNames: this.tenantDetailsForm.get('hasTenantOtherName').value ? [this.tenantDetailsForm.get('otherNames').value] : []
      }
    };

    if(applicationDetails.application.tenantTypeId == REFERENCING_TENANT_TYPE.INDIVIDUAL){
      delete applicationDetails.application.registrationNumber;
    }
    return applicationDetails;
  }

  async cancelApplication() {
    const modal = await this.modalController.create({
      component: SimpleModalPage,
      cssClass: 'modal-container alert-prompt',
      backdropDismiss: false,
      componentProps: {
        data: `<div class="center-block">The data entered has not been saved. Are you sure?
        </div>`,
        heading: 'Application',
        buttonList: [
          {
            text: 'Cancel',
            value: false
          },
          {
            text: 'OK',
            value: true
          }
        ]
      }
    });

    const data = modal.onDidDismiss().then(res => {
      if (res.data.userInput) {
        this.router.navigate(['/let-alliance/dashboard'], { replaceUrl: true });
      }
    });

    await modal.present();
  }

  getLookupValue(index: any, lookup: any) {
    return this.commonService.getLookupValue(index, lookup);
  }

  getProductType(productId: any): string {
    let productType: any;
    this.referencingProductList = this.referencingProductList && this.referencingProductList.length ? this.referencingProductList : [];
    this.referencingProductList.find((obj) => {
      if (obj.productId === productId) {
        productType = obj.productName;
      }
    });
    return productType;
  }
}
