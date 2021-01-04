import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PROPCO, REFERENCING } from 'src/app/shared/constants';
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
  laProductList: any[] = [];
  laCaseProductList: any[];
  laApplicationProductList: any[];
  propertyId = null;
  lookupdata: any;
  laLookupdata: any;
  currentStepperIndex = 0;
  isPropertyTabDetailSubmit: boolean;
  isTenantTabDetailSubmit: boolean;
  current = 0;
  previous;
  tenantId;
  futureDate: string;
  currentDate = this.commonService.getFormatedDate(new Date());
  adultDate = this.datepipe.transform(new Date().setDate(new Date().getDay() - (18 * 365)), 'yyyy-MM-dd');

  managementStatusTypes: any[] = [];
  tenantTypes: any[] = [];
  titleTypes: any[] = [];
  maritalStatusTypes: any[] = [];
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
    if (this.propertyId) {
      if (this.tenantId) {
        this.getLookupData();
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
        propertyId: this.propertyId,
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
      this.referencingService.getLALookupData(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(data => {
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

  private initiateForms() {
    this.initTenancyDetailsForm();
    this.initPropertyDetailsForm();
    this.initTenantDetailsTabForm();
  }

  private initTenancyDetailsForm(): void {
    this.tenancyDetailsForm = this.fb.group({
      productId: ['', Validators.required],
      noOfTenantToBeReferenced: ['', [Validators.required, ValidationService.numberValidator]],
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
      title: ['', Validators.required],
      otherTitle: [''],
      companyName: [''],
      forename: [''],
      middlename: [''],
      surname: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: [''],
      maritalStatus: ['', [Validators.required]],
      nationality: [''],
      registerationNumber: [''],
      rentShare: ['', [Validators.required, ValidationService.amountValidator]],
      hasTenantOtherName: [false],
      otherNames: this.fb.group({
        title: '',
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
      this.getLAProductList()
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
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getPropertyTenancyList(this.propertyId).subscribe(
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

  private getLAProductList() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getLAProductList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(
        res => {
          this.laProductList = res ? this.commonService.removeDuplicateObjects(res) : [];
          this.laCaseProductList = this.laProductList.filter(obj => {
            return obj.productName.includes('Per Property');
          });

          this.laApplicationProductList = this.laProductList.filter(obj => {
            return !obj.productName.includes('Per Property');
          });
          resolve(this.laProductList);
        },
        error => {
          console.log(error);
          resolve(this.laProductList);
        });
    });

    return promise;
  }

  private initPatching(): void {
    this.tenancyDetailsForm.patchValue({
      tenancyStartDate: this.propertyTenancyList[0].tenancyStartDate,
    });
    this.tenancyDetailsForm.get('tenancyStartDate').markAsTouched();

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
    });
  }

  private setValidatorsForForms() {
    /* if (this.reportedByForm.get('reportedBy').value === 'TENANT' || this.reportedByForm.get('reportedBy').value === 'GUARANTOR') {
      this.reportedByForm.get('agreementId').setValidators(Validators.required);
      this.reportedByForm.get('selectedEntity').setValidators(Validators.required);
    }  */
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
    let latestDigit = val.replace(/.00/g, '').replace(/\£/, '').replace(/,/g, '');

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
    let latestDigit = val.replace(/.00/g, '').replace(/\£/, '').replace(/,/g, '');
    return latestDigit; 
  }

  async editAddress() {
    const modal = await this.modalController.create({
      component: AddressModalPage,
      cssClass: 'modal-container',
      backdropDismiss: false,
      componentProps: {
        address: this.address
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
        this.commonService.showMessage('Something went wrong on server, please try again.', 'Create an Application', 'Error');
        console.log(error);
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
        noOfTenantToBeReferenced: parseInt(this.tenancyDetailsForm.get('noOfTenantToBeReferenced').value),
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
        title: (this.tenantDetailsForm.get('title').value).toString(),
        otherTitle: this.tenantDetailsForm.get('otherTitle').value,
        forename: this.tenantDetailsForm.get('forename').value,
        middlename: this.tenantDetailsForm.get('middlename').value,
        surname: this.tenantDetailsForm.get('surname').value,
        email: this.tenantDetailsForm.get('email').value,
        dateOfBirth: this.datepipe.transform(this.tenantDetailsForm.get('dateOfBirth').value, 'yyyy-MM-dd'),
        rentShare: parseFloat(this.setDefaultAmount(this.tenantDetailsForm.get('rentShare').value)),
        maritalStatus: this.tenantDetailsForm.get('maritalStatus').value,
        nationality: 'British', //this.tenantDetailsForm.get('nationality').value, // British
        //registerationNumber: this.tenantDetailsForm.get('registerationNumber').value,
        sendTenantLink: false,
        autoSubmitLink: false,
        isGuarantor: false,
        hasTenantOtherName: this.tenantDetailsForm.get('hasTenantOtherName').value,
        otherNames: this.tenantDetailsForm.get('hasTenantOtherName').value ? [this.tenantDetailsForm.get('otherNames').value] : []
      }
    };
    return applicationDetails;
  }

  async cancelApplication() {
    const modal = await this.modalController.create({
      component: SimpleModalPage,
      cssClass: 'modal-container alert-prompt',
      backdropDismiss: false,
      componentProps: {
        data: `The data entered has not been saved. Are you sure?`,
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
    let productType;
    this.laProductList = this.laProductList && this.laProductList.length ? this.laProductList : [];
    this.laProductList.find((obj) => {
      if (obj.productId === productId) {
        productType = obj.productName;
      }
    });
    return productType;
  }
}
