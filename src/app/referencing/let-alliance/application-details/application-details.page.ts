import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DEFAULTS, PROPCO, REFERENCING, REFERENCING_TENANT_TYPE } from 'src/app/shared/constants';
import { AddressModalPage } from 'src/app/shared/modals/address-modal/address-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchPropertyPage } from 'src/app/shared/modals/search-property/search-property.page';
import { TenantListModalPage } from 'src/app/shared/modals/tenant-list-modal/tenant-list-modal.page';
import { forkJoin } from 'rxjs';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { COMPLETION_METHODS } from 'src/app/shared/constants';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';
import { ReferencingService } from '../../referencing.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'la-application-details',
  templateUrl: './application-details.page.html',
  styleUrls: ['./application-details.page.scss'],
})
export class ApplicationDetailsPage implements OnInit {
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
  referencingProductList: any;
  referencingCaseProductList: any[] = [];
  referencingApplicationProductList: any[] = [];
  propertyId = null;
  lookupdata: any;
  referencingLookupdata: any;
  isPropertyTabDetailSubmit: boolean;
  isTenantTabDetailSubmit: boolean;
  current = 0;
  previous: any;
  tenantId: any;
  futureDate: string;
  currentDate = this.commonService.getFormatedDate(new Date());
  adultDate = this.datepipe.transform(new Date().setDate(new Date().getDay() - (18 * 365)), 'yyyy-MM-dd');

  managementStatusTypes: any[] = [];
  managementTypes: any[] = [];
  tenantTypes: any[] = [];
  titleTypes: any[] = [];
  maritalStatusTypes: any[] = [];
  tenantMaritals: any[] = [];
  agreementStatuses: any[] = [];
  referencingNationalities: any[] = [];
  referencingOffices: any[] = [];
  proposedAgreementStatusIndex: any;
  completionMethods: any[] = COMPLETION_METHODS;

  address: any = {};
  isPropertyDetailsSubmit: boolean;
  maskedVal: any;

  isPidTid: boolean;
  otherTitleIndex: any;
  titleIndex: any;
  selectedTenancyObj: any = {}
  officeList: string;
  DEFAULTS = DEFAULTS;

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
    this.isPidTid = this.propertyId && this.tenantId ? false : true;
    this.initiateApplication();
  }

  async initiateApplication() {
    await this.getLookupData();
    await this.getReferencingLookupData();
    this.getProductList();
    if (this.propertyId) {
      if (this.tenantId) {
        this.initiateForms();
        this.initialApiCall();
      }
      else {
        this.selectTenant();
      }
    } else {
      this.searchProperty();
    }
  }

  private async searchProperty() {
    const modal = await this.modalController.create({
      component: SearchPropertyPage,
      cssClass: 'modal-container la-property-search',
      backdropDismiss: false,
      componentProps: {
        isFAF: false,
        officeList: this.officeList,
        agreementStatus: this.proposedAgreementStatusIndex
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
        if (res.data.referencingApplicationStatus == 0 || res.data.referencingApplicationStatus == 1) {
          this.applicationAlert();
        }
        else {
          this.tenantId = res.data.tenantId;
          this.initiateApplication();
        }
      } else {
        this.router.navigate(['/let-alliance/dashboard'], { replaceUrl: true });
      }
    });
    await modal.present();
  }

  private async applicationAlert() {
    const modal = await this.modalController.create({
      component: SimpleModalPage,
      cssClass: 'modal-container alert-prompt',
      backdropDismiss: false,
      componentProps: {
        data: `<div class='status-block'>There is an application in process for this tenant. You cannot start another application until the processing of existing application has been completed.
        </div>`,
        heading: 'Application',
        buttonList: [
          {
            text: 'OK',
            value: false
          }
        ]
      }
    });

    const data = modal.onDidDismiss().then(res => {
      this.router.navigate(['/let-alliance/dashboard'], { replaceUrl: true });
    });

    await modal.present();
  }

  private getLookupData(): any {
    const promise = new Promise((resolve, reject) => {
      this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
      if (this.lookupdata) {
        this.setLookupData(this.lookupdata);
        resolve(this.lookupdata);
      }
      else {
        this.commonService.getLookup().subscribe(data => {
          this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
          this.lookupdata = data;
          this.setLookupData(data);
          resolve(this.lookupdata);
        });
      }
    });
    return promise;
  }

  private getReferencingLookupData(): any {
    const promise = new Promise((resolve, reject) => {
      this.referencingLookupdata = this.commonService.getItem(PROPCO.REFERENCING_LOOKUP_DATA, true);
      if (this.referencingLookupdata) {
        this.setReferencingLookupData(this.referencingLookupdata);
        resolve(this.referencingLookupdata);

      } else {
        this.referencingService.getLookupData(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(data => {
          this.commonService.setItem(PROPCO.REFERENCING_LOOKUP_DATA, data);
          this.referencingLookupdata = data;
          this.setReferencingLookupData(data);
          resolve(this.referencingLookupdata);

        });

      }
    });
    return promise;
  }

  private setLookupData(data: any): void {
    this.agreementStatuses = data.agreementStatuses;
    this.tenantMaritals = data.tenantMaritals;
    this.managementTypes = data.managementTypes;
    
    this.proposedAgreementStatusIndex = this.agreementStatuses.find(obj => obj.value === 'Proposed').index;
  }
  
  private setReferencingLookupData(data: any): void {
    this.referencingNationalities = data.referencingNationalities;
    this.managementStatusTypes = data.managementStatusTypes;
    this.tenantTypes = data.tenantTypes;
    this.titleTypes = data.titleTypes;
    this.maritalStatusTypes = data.maritalStatusTypes;
    this.referencingOffices = data.referencingOffices;

    let tmpArray = [];
    for (let item of this.referencingOffices) {
      tmpArray.push(item.index);
    }
    this.officeList = tmpArray.toString();
  }

  private initiateForms() {
    this.initTenancyDetailsForm();
    this.initPropertyDetailsForm();
    this.initTenantDetailsTabForm();
  }

  private initTenancyDetailsForm(): void {
    this.tenancyDetailsForm = this.fb.group({
      productId: [0],
      noOfTenantToBeReferenced: ['', [Validators.required]],
      tenancyStartDate: ['', [Validators.required, ValidationService.futureDateSelectValidator]],
      tenancyTerm: ['', [Validators.required, Validators.min(1), Validators.max(36), ValidationService.numberValidator]],
      paidBy: [false],
      offerNds: [false]
    });
  }

  private initPropertyDetailsForm(): void {
    this.propertyDetailsForm = this.fb.group({
      managementStatus: ['', Validators.required],
      monthlyRent: ['', [Validators.required]],
    });
  }

  private initTenantDetailsTabForm(): void {
    this.tenantDetailsForm = this.fb.group({
      completeMethod: [{ value: 2, disabled: true }],
      productId: ['', Validators.required],
      tenantTypeId: [1, Validators.required],
      title: ['', Validators.required],
      otherTitle: [''],
      companyName: [''],
      forename: [''],
      middlename: [''],
      surname: [''],
      dateOfBirth: [''],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      maritalStatus: [''],
      nationality: [''],
      registrationNumber: [''],
      rentShare: ['', [Validators.required]],
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
      this.getPropertyTenancyList()
    ]).subscribe(async (values) => {
      // this.commonService.hideLoader();
      if (this.tenantDetails.referencingApplicationStatus == 0 || this.tenantDetails.referencingApplicationStatus == 1) {
        this.applicationAlert();
      }
      else{
        this.initPatching();
        this.setValidatorsForForms();
      }
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
    this.referencingProductList = this.commonService.getItem(PROPCO.REFERENCING_PRODUCT_LIST, true);
    if (this.referencingProductList) {
      this.referencingCaseProductList = this.referencingProductList?.caseProducts ? this.referencingProductList.caseProducts : [];
      this.referencingApplicationProductList = this.referencingProductList?.applicationProducts ? this.referencingProductList.applicationProducts : [];
    }
    else{
      const promise = new Promise((resolve, reject) => {
        this.referencingService.getProductList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(
          res => {
            this.referencingProductList = res ? res : {};
            
            if (this.referencingProductList) {
              this.commonService.setItem(PROPCO.REFERENCING_PRODUCT_LIST, res);
              this.referencingCaseProductList = this.referencingProductList?.caseProducts ? this.referencingProductList.caseProducts : [];
              this.referencingApplicationProductList = this.referencingProductList?.applicationProducts ? this.referencingProductList.applicationProducts : [];
            }
            resolve(this.referencingProductList);
          },
          error => {
            console.log(error);
            resolve(this.referencingProductList);
        });
      });
      return promise;
    }
  }

  private initPatching(): void {

    this.selectedTenancyObj = this.propertyTenancyList.find(obj1 => obj1.tenants.find(obj2 => obj2.tenantId === this.tenantDetails.tenantId));

    const selectedTenantRentShare = this.selectedTenancyObj.tenants.find(obj => obj.tenantId === this.tenantDetails.tenantId).rentShare;

    this.titleIndex = this.tenantDetails.title ? this.getLookupIndex(this.tenantDetails.title, this.titleTypes) : '';
    this.otherTitleIndex = this.getLookupIndex('Other', this.titleTypes);
    this.titleIndex = this.tenantDetails.title ? (this.titleIndex ? this.titleIndex : this.otherTitleIndex) : '';

    const maritalValueFromLookup = this.tenantDetails.maritalStatus ? this.getLookupValue(this.tenantDetails.maritalStatus, this.tenantMaritals) : '';

    let maritalIndex: any;

    if(maritalValueFromLookup == 'Married'){
      maritalIndex = this.getLookupIndex('Married', this.maritalStatusTypes);
    }
    else if(maritalValueFromLookup == 'Unmarried'){
      maritalIndex = this.getLookupIndex('Not Married', this.maritalStatusTypes);
    }

    const managementValueFromLookup = this.propertyDetails.managementType ? this.getLookupValue(this.propertyDetails.managementType, this.managementTypes, true) : '';

    let managementIndex: any;

    if(managementValueFromLookup == 'Fully Managed'){
      managementIndex = this.getLookupIndex('Fully Managed', this.managementStatusTypes);;
    }
    else if(managementValueFromLookup == 'Let Only'){
      managementIndex = this.getLookupIndex('Let Only', this.managementStatusTypes);;
    }

    this.tenancyDetailsForm.patchValue({
      tenancyStartDate: this.selectedTenancyObj.tenancyStartDate,
      noOfTenantToBeReferenced: this.selectedTenancyObj.numberOfReferencingOccupants,
      tenancyTerm: this.monthDiff(this.selectedTenancyObj.tenancyStartDate, this.selectedTenancyObj.tenancyEndDate)
    }, { emitEvent: false });

    this.propertyDetailsForm.patchValue({
      managementStatus: managementIndex,
      monthlyRent: this.propertyDetails.advertisementRent
    }, { emitEvent: false });

    this.tenantDetailsForm.patchValue({
      title: this.titleIndex,
      forename: this.tenantDetails.forename,
      surname: this.tenantDetails.surname,
      dateOfBirth: this.tenantDetails.dateOfBirth,
      email: this.tenantDetails.email,
      maritalStatus: maritalIndex,
      nationality: this.tenantDetails.nationality,
      companyName: this.tenantDetails.company,
      rentShare: selectedTenantRentShare ? selectedTenantRentShare : 0,
      otherTitle: this.titleIndex && this.titleIndex == this.otherTitleIndex ? this.tenantDetails.title : ''
    }, { emitEvent: false });
  }

  resetOtherTitle() {
    if (this.tenantDetailsForm.get('title').value !== 'Other') {
      this.tenantDetailsForm.patchValue({
        otherTitle: ''
      });
    }
  }

  monthDiff(startDate: any, endDate: any): string {
    let endDateObj = new Date(endDate);
    let startDateObj = new Date(startDate);
    return Math.floor((endDateObj.getFullYear() - startDateObj.getFullYear()) * 12 + (endDateObj.getMonth() - startDateObj.getMonth())).toString();
  }

  setValidatorsForForms() {
    this.tenantDetailsForm.get('rentShare').setValidators(Validators.max(this.propertyDetailsForm.get('monthlyRent').value));

    if (this.tenantDetailsForm.get('tenantTypeId').value == REFERENCING_TENANT_TYPE.INDIVIDUAL) {
      this.tenantDetailsForm.get('forename').setValidators(Validators.required);
      this.tenantDetailsForm.get('surname').setValidators(Validators.required);
      this.tenantDetailsForm.get('companyName').clearValidators();
      this.tenantDetailsForm.get('registrationNumber').clearValidators();

      if(this.tenantDetailsForm.get('hasTenantOtherName').value){
        this.tenantDetailsForm.get('otherNames').get('forename').setValidators(Validators.required);
        this.tenantDetailsForm.get('otherNames').get('surname').setValidators(Validators.required);
        
      }
      else{
        this.tenantDetailsForm.get('otherNames').get('forename').clearValidators();
        this.tenantDetailsForm.get('otherNames').get('surname').clearValidators();
      }
    } 

    else if (this.tenantDetailsForm.get('tenantTypeId').value == REFERENCING_TENANT_TYPE.COMPANY) {
      this.tenantDetailsForm.get('companyName').setValidators(Validators.required);
      this.tenantDetailsForm.get('registrationNumber').setValidators(Validators.required);
      this.tenantDetailsForm.get('forename').clearValidators();
      this.tenantDetailsForm.get('surname').clearValidators();
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

    this.tenantDetailsForm.get('rentShare').updateValueAndValidity();
    this.tenantDetailsForm.get('forename').updateValueAndValidity();
    this.tenantDetailsForm.get('surname').updateValueAndValidity();
    this.tenantDetailsForm.get('companyName').updateValueAndValidity();
    this.tenantDetailsForm.get('registrationNumber').updateValueAndValidity();
    this.tenantDetailsForm.get('otherNames').get('forename').updateValueAndValidity();
    this.tenantDetailsForm.get('otherNames').get('surname').updateValueAndValidity();
  }

  onBlurCurrency(val: any, form: FormGroup) {
    if (val) {
      if (form == this.propertyDetailsForm) {
        this.tenantDetailsForm.get('rentShare').setValidators(Validators.max(this.propertyDetailsForm.get('monthlyRent').value));
        this.tenantDetailsForm.get('rentShare').updateValueAndValidity();
      }
    }
    else {
      if (form == this.propertyDetailsForm) {
        this.propertyDetailsForm.patchValue({
          monthlyRent: 0
        });
      }
      if (form == this.tenantDetailsForm) {
        this.tenantDetailsForm.patchValue({
          rentShare: 0
        });
      }
    }
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

    const tmpTenant = this.selectedTenancyObj.tenants.find(obj => obj.tenantId === this.tenantDetails.tenantId);

    const applicationDetails =
    {
      propertyId: this.propertyDetails.propertyId,
      applicantId: this.tenantDetails.tenantId,
      agreementId: this.selectedTenancyObj.propcoAgreementId,
      applicantItemType: tmpTenant.isLead ? 'M' : 'S',
      case: {
        productId: this.tenancyDetailsForm.get('productId').value,
        noOfTenantToBeReferenced: parseInt(this.tenancyDetailsForm.get('noOfTenantToBeReferenced').value),
        tenancyStartDate: this.datepipe.transform(this.tenancyDetailsForm.get('tenancyStartDate').value, 'yyyy-MM-dd'),
        tenancyEndDate: this.datepipe.transform(tmpDate, 'yyyy-MM-dd'),
        tenancyTerm: this.tenancyDetailsForm.get('tenancyTerm').value,
        paidBy: this.tenancyDetailsForm.get('paidBy').value ? 1 : 0,
        offerNds: this.tenancyDetailsForm.get('offerNds').value,
        address:{
          addressLine1: this.address.addressLine1 ? this.address.addressLine1 : (this.address.buildingNumber + ', ' + this.address.buildingNumber),
          addressLine2: this.address.addressLine3 ? (this.address.addressLine2 + ', ' + this.address.addressLine3) : (this.address.addressLine2 + ', ' + this.address.locality),
          county: this.address.county,
          country: this.address.country,
          street: this.address.street,
          buildingName: this.address.buildingName,
          buildingNumber: this.address.buildingNumber,
          postcode: this.address.postcode,
          latitude: this.address.latitude,
          longitude: this.address.longitude,
          locality: this.address.locality,
          town: this.address.town
        },
        typeId: this.tenantDetailsForm.get('tenantTypeId').value,
        monthlyRent: parseFloat(this.propertyDetailsForm.get('monthlyRent').value),
        managementStatus: this.propertyDetailsForm.get('managementStatus').value,
      },
      application: {
        productId: this.tenantDetailsForm.get('productId').value,
        tenantTypeId: this.tenantDetailsForm.get('tenantTypeId').value,
        title: this.tenantDetailsForm.get('title').value ? (this.tenantDetailsForm.get('title').value).toString() : '',
        otherTitle: this.tenantDetailsForm.get('otherTitle').value,
        forename: this.tenantDetailsForm.get('tenantTypeId').value == REFERENCING_TENANT_TYPE.INDIVIDUAL ? this.tenantDetailsForm.get('forename').value : this.tenantDetailsForm.get('companyName').value,
        middlename: this.tenantDetailsForm.get('middlename').value,
        surname: this.tenantDetailsForm.get('surname').value,
        email: this.tenantDetailsForm.get('email').value,
        dateOfBirth: this.datepipe.transform(this.tenantDetailsForm.get('dateOfBirth').value, 'yyyy-MM-dd'),
        rentShare: parseFloat(this.tenantDetailsForm.get('rentShare').value),
        maritalStatus: this.tenantDetailsForm.get('maritalStatus').value,
        nationality: this.getLookupValue(this.tenantDetailsForm.get('nationality').value, this.referencingNationalities),
        registrationNumber: this.tenantDetailsForm.get('registrationNumber').value,
        sendTenantLink: true,
        autoSubmitLink: true,
        isSubmitted : true,
        isGuarantor: false,
        hasTenantOtherName: this.tenantDetailsForm.get('hasTenantOtherName').value,
        otherNames: this.tenantDetailsForm.get('hasTenantOtherName').value ? [this.tenantDetailsForm.get('otherNames').value] : [],
        status: 0
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
        data: `<div class="center-block">The data entered has not been saved, do you want to exit the Application?
        </div>`,
        heading: 'Application',
        buttonList: [
          {
            text: 'Yes',
            value: true
          },
          {
            text: 'No',
            value: false
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

  getLookupValue(index: any, lookup: any, isIndexNumber?: any) {
    index = (isIndexNumber && index) ? index.toString() :index;
    return this.commonService.getLookupValue(index, lookup);
  }

  getLookupIndex(value: any, listOfArray: any) {
    let propertyStatus: any;
    listOfArray = listOfArray && listOfArray.length ? listOfArray : [];
    listOfArray.find((obj) => {
      if (obj.value === value) {
        propertyStatus = obj.index;
      }
    })
    return propertyStatus;
  }

  getProductType(productId: any, name: any): string{
    let productType: any;
    if(name == 'case'){
      this.referencingCaseProductList.find((obj) => {
        if (obj.productId === productId) {
          productType = obj.productName;
        }
      });
    }
    else if(name == 'application'){
      this.referencingApplicationProductList.find((obj) => {
        if (obj.productId === productId) {
          productType = obj.productName;
        }
      });
    }
    return productType;
  }
}
