import { Component, OnInit, isDevMode } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PROPCO, APPLICATION_STATUSES, APPLICATION_ACTION_TYPE, ENTITY_TYPE, PAYMENT_TYPES, PAYMENT_CONFIG, APPLICATION_ENTITIES, DEFAULTS, DATE_FORMAT, SYSTEM_OPTIONS } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { TobService } from '../tob.service';
import { switchMap, debounceTime, delay } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { ModalController } from '@ionic/angular';
import { TermsAndConditionModalPage } from 'src/app/shared/modals/terms-and-condition-modal/terms-and-condition-modal.page';
import { environment } from 'src/environments/environment';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';
import * as CryptoJS from 'crypto-js/crypto-js';
import { HttpParams } from '@angular/common/http';
@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.page.html',
  styleUrls: ['./application-detail.page.scss', '../common-css/offer-application-detail.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
export class ApplicationDetailPage implements OnInit {
  lookupdata: any;
  tobLookupData: any;
  howLong = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  occupants = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  childrens = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  itemList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  tenantCurrentPositionTypes: OfferModels.ILookupResponse[];
  applicantGuarantorTypes: OfferModels.ILookupResponse[];
  letDurations: OfferModels.ILookupResponse[];
  rentFrequencyTypes: OfferModels.ILookupResponse[];
  offerDetails: OfferModels.IOfferResponse;
  applicantList: Observable<OfferModels.IApplicantLisResponse>;
  applicantDetail: OfferModels.IApplicantDetails;
  applicationDetails: ApplicationModels.IApplicationResponse;
  applicationApplicantDetails: ApplicationModels.ICoApplicants[];
  rentCategories: OfferModels.ILookupResponse[];
  applicationStatuses: OfferModels.ILookupResponse[];
  currentStepperIndex = 0;
  searchApplicantForm: FormGroup;
  applicantDetailsForm: FormGroup;
  occupantForm: FormGroup;
  isCoApplicantDeleted: any;
  addressDetailsForm: FormGroup;
  bankDetailsForm: FormGroup;
  applicantQuestionForm: FormGroup;
  tenancyDetailForm: FormGroup;
  guarantorForm: FormGroup;
  propertyId: any;
  applicationId: any;
  propertyDetails: any;
  propertyClauses: any[];
  propertyRestrictions: any[];
  applicantId: string;
  disableSearchApplicant = false;
  resultsAvailable = null;
  isStudentProperty = false;
  showPostcodeLoader = null;
  showAddressLoader = null;
  showPayment = false;
  saveDataLoader = false;
  addressList: any[];
  guarantorAddressList: any[];
  forwardingAddressList: any[];
  leadApplicationApplicantId: any;
  selectionType: any;
  titleList = [
    { index: 0, value: 'Mr' },
    { index: 1, value: 'Mrs' },
    { index: 2, value: 'Ms' }
  ];
  maxMoveInDate = this.commonService.getFormatedDate(new Date().setFullYear(new Date().getFullYear() + 5));
  currentDate = this.commonService.getFormatedDate(new Date());
  termsConditionControl = false;
  termsAndConditionData: any = {};
  applicationStatus: string;

  PAYMENT_METHOD = environment.PAYMENT_METHOD;
  PAYMENT_PROD = environment.PAYMENT_PROD;
  paymentDetails: any = {};
  showWorldpayIframe = false;
  hidePaymentForm = false;
  isTobPropertyCardReady = false;
  showWorldpayInternalForm = false;
  worldPayInternalData: {
    applicationId?: string,
    startDate?: string,
    expiryDate?: string,
    transactionId?: number,
    propertyId?: string,
    amount?: number,
    entityType?: string,
    entityId?: string
  } = {};
  isApplicantDetailsAvailable = false;
  addressPopoverOptions: any = {
    cssClass: 'address-selection'
  };
  DEFAULTS = DEFAULTS;
  DATE_FORMAT = DATE_FORMAT;
  webImageUrl: string;
  holdingDepAutoCalWeek: any;
  depositAutoCalWeeks: any;
  applicationRentEditable: any;
  updateOccupantsInProcess = false;
  applicantQuestions: any = [];
  initiaFormlLoaded = false;
  /**Stripe Payment*/
  stripeElementData: any;
  showStripeElementForm = false;
  stripeElementPaymentDone = false;
  stripeConfigurations = environment.PAYMENT_PROD ? PAYMENT_CONFIG.STRIPE_ELEMENT.PROD : PAYMENT_CONFIG.STRIPE_ELEMENT.TEST
  /***ends */
  showApplicantAddress = false;
  showCorrespondAddress = false;
  showGuarantorAddress = false;
  agreementTypesLookup;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private _formBuilder: FormBuilder,
    private _tobService: TobService,
    private router: Router,
    private modalController: ModalController
  ) {
  }

  ngOnInit(): void {
    this.initForms();
  }

  async ionViewDidEnter() {
    this.propertyId = this.route.snapshot.paramMap.get('propertyId');
    if (!this.propertyId) {
      this.propertyId = this.route.snapshot.parent.parent.paramMap.get('propertyId');
    }
    this.applicationId = this.route.snapshot.paramMap.get('applicationId');
    if (!this.applicationId) {
      this.applicationId = this.route.snapshot.parent.parent.paramMap.get('applicationId');
    }
    this.initLookups();
    await this.initApiCalls();
    if (typeof this.applicationId !== 'undefined' && this.applicationId !== null) {
      await this.initViewApiCalls();
    }
    else if (typeof this.propertyId !== 'undefined' && this.propertyId !== null) {
      await this.initCreateApiCalls();
    }
  }

  private getSystemOptions(key: string) {
    return new Promise((resolve) => {
      this.commonService.getSystemOptions(key).subscribe(
        (res) => {
          resolve(res);
        },
        (error) => {
          resolve(null);
        });
    });
  }

  private async getSystemConfigs(key): Promise<any> {
    return new Promise((resolve) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        resolve(res ? res[key] : null);
      }, error => {
        resolve(true);
      });
    });
  }

  onSearch(event: any): void {
    const searchString = event.target.value;
    if (searchString.length > 2) {
      this.resultsAvailable = true;
    } else {
      this.resultsAvailable = false;
    }
    this.applicantList = this.searchApplicantForm.get('searchApplicant').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.searchApplicant(value) : new Observable()));
  }

  async getApplicantDetails(applicantId: string, index?: number, isSearch?: boolean) {
    return new Promise((resolve, reject) => {
      if (applicantId && isSearch) {
        let existingApplicant = this.applicationApplicantDetails.filter((occupant) => {
          return (occupant.applicantId === applicantId);
        });
        if (existingApplicant.length) {
          this.commonService.showAlert('Applicant', 'Applicant is already added to the application');
          this.resultsAvailable = false;
          return resolve(true);
        }
      }
      this.applicantId = applicantId;
      this._tobService.getApplicantDetails(applicantId).subscribe(res => {
        if (res) {
          this.applicantDetail = res;
          this.resultsAvailable = false;
          this.searchApplicantForm.get('searchApplicant').setValue('');
          if (isSearch) {
            this.addSearchApplicant(res, index);
            this.getApplicantCoApplicants(applicantId);
          }
          else {
            this.patchApplicantDetail();
            this.patchApplicantAddressDetail();
            // this.patchTenancyDetail();
          }
        }
        resolve(true);
      }, error => {
        reject(true);
      });
    });
  }

  private patchApplicantDetail(): void {
    this.applicantDetailsForm.patchValue({
      title: this.applicantDetail.title,
      forename: this.applicantDetail.forename,
      surname: this.applicantDetail.surname,
      email: this.applicantDetail.email,
      mobile: this.applicantDetail.mobile,
      dateOfBirth: this.applicantDetail.dateOfBirth,
      occupation: this.applicantDetail.occupation,
      hasPets: this.applicantDetail.hasPets,
      petsInfo: this.applicantDetail.petsInfo,
      guarantor: this.applicantDetail.guarantorType ? true : false,
      guarantorType: this.applicantDetail.guarantorType,
      currentPosition: this.applicantDetail.currentPosition,
      isReferencingRequired: this.applicantDetail.isReferencingRequired
    });
  }

  private patchTenancyDetail(): void {
    this.tenancyDetailForm.patchValue({
      numberOfAdults: this.applicantDetail.numberOfAdults,
      numberOfChildren: this.applicantDetail.numberOfChildren
    });
  }

  resetSearch() {
    this.searchApplicantForm.get('searchApplicant').setValue('');
    this.resultsAvailable = false;
  }

  private searchApplicant(applicantId: string): Observable<any> {
    return this._tobService.searchApplicant(applicantId);
  }

  private async initApiCalls() {
    let tmpImageObj: any = await this.getSystemOptions(SYSTEM_OPTIONS.WEB_IMAGE_URL);
    let tmpDepObj: any = await this.getSystemConfigs(SYSTEM_OPTIONS.DEPOSIT_AUTO_CALCULATION_WEEKS);
    let tmpHdepObj: any = await this.getSystemConfigs(SYSTEM_OPTIONS.HOLDING_DEPOSIT_AUTO_CALCULATION_WEEKS);
    let tmpRentEditableObj: any = await this.getSystemConfigs(SYSTEM_OPTIONS.TOB_APPLICATION_RENT_EDITABLE);
    this.webImageUrl = tmpImageObj ? tmpImageObj.WEB_IMAGE_URL : '';
    this.holdingDepAutoCalWeek = tmpHdepObj ? parseInt(tmpHdepObj) : '';
    this.depositAutoCalWeeks = tmpDepObj ? parseInt(tmpDepObj) : '';
    this.applicationRentEditable = tmpRentEditableObj ? parseInt(tmpRentEditableObj) : '';
    await this.getPropertyDetails(this.propertyId);
    await this.getAgreementTypeLookup();
    this.initTermsAndConditionData();
  }

  private initLookups() {
    this.getLookUpData();
    this.getTobLookupData();
  }

  private initForms() {
    this.initSearchForm();
    this.initApplicantDetailsForm();
    this.initOccupantForm();
    this.initAddressDetailsForm();
    this.initBankDetailsForm();
    this.initApplicantQuestionForm();
    this.initTenancyDetailsForm();
    this.initGuarantorForm();
  }

  private async initCreateApiCalls() {
    await this.getPropertyClauses(this.propertyId);
    await this.getPropertyRestrictions(this.propertyId);
    await this.createApplication();
  }

  private async initViewApiCalls() {
    const application = await this.getApplicationDetails(this.applicationId) as ApplicationModels.IApplicationResponse;
    await this.setApplicationDetails(application);
    const applicants = await this.getApplicationApplicants(this.applicationId) as ApplicationModels.ICoApplicants;
    await this.setApplicationApplicants(applicants);
    await this.setLeadApplicantDetails();
    if (this.applicantQuestions && this.applicantQuestions.length) {
      this.createQuestionItems(this.applicantQuestions);
      await this.getApplicationQuestionsAnswer(this.applicationId);
    }
    if (this.PAYMENT_METHOD === PAYMENT_TYPES.WORLDPAY_OWNFORM) {
      await this.setWorldpayInternalData();
    }
    if (this.applicationStatus === 'Accepted' && !application.isHoldingDepositPaid) {
      this.currentStepperIndex = 10;
      this.showPayment = true;
      this.initPaymentConfiguration();
    }
  }

  /** Submit Application Functionality **/

  async submit() {
    const isValid = await this.checkFormsValidity();
    if (!isValid) {
      this.commonService.showMessage('Please provide complete information.', 'Application Details', 'error');
      return;
    }
    // if (!this.termsConditionControl) {
    //   this.commonService.showMessage('Please review the terms and conditions.', 'Terms & Conditions', 'error');
    //   return;
    // }
    if (!this.applicationDetails.isTermsAndConditionsAccepted) {
      await this.updateApplicationDetails();
      this.applicationDetails.isTermsAndConditionsAccepted = this.termsConditionControl;
    }
    this.saveGuarantorDetails();
    this.onSubmit();
  }

  private checkFormsValidity() {
    return new Promise((resolve) => {
      const applicantDetails = this.applicantDetailsForm.valid;
      const bankDetails = this.bankDetailsForm.valid;
      const address = this.addressDetailsForm.valid;
      const tenancyDetails = this.tenancyDetailForm.valid;
      const guarantorDetails = this.guarantorForm.valid;
      if (applicantDetails && tenancyDetails && guarantorDetails && bankDetails && address) {
        return resolve(true);
      }
      return resolve(false);
    });
  }

  private async onSubmit() {
    const response = await this.commonService.showConfirm('Application', 'Do you want to submit the application?');
    if (response) {
      this.submitApplication();
    }
  }

  private submitApplication(): void {
    const data: any = {};
    data.submittedBy = ENTITY_TYPE.AGENT;
    data.submittedById = '';
    this._tobService.submitApplication(this.applicationDetails.applicationId, data).subscribe(
      res => {
        this.commonService.showMessage('Your application has been submitted successfully.', 'Application', 'success');
        if (this.isStudentProperty) {
          this.showPayment = true;
          this.currentStepperIndex = 10;
        } else {
          this.router.navigate([`../../applications`], { replaceUrl: true, relativeTo: this.route });
        }
      },
      error => {
        const errorMessage = error.error ? error.error.message : error.message;
        this.commonService.showMessage((errorMessage || 'Internal server error') + ', Please contact support.', 'Application', 'error');
      }
    );
  }

  /** Submit Application Functionality **/

  /** Step Change functionality **/
  public onStepChange(event: any): void {
    const nextIndex = event.selectedIndex;
    const previousIndex = event.previouslySelectedIndex;
    if (nextIndex > previousIndex) {
      /*call API only in next step*/
      this.savePreviousStep(event);
      if (this.applicantDetailsForm.invalid) {
        this.applicantDetailsForm.markAllAsTouched();
      }
      if (this.addressDetailsForm.invalid) {
        this.addressDetailsForm.markAllAsTouched();
      }
      if (this.bankDetailsForm.invalid) {
        this.bankDetailsForm.markAllAsTouched();
      }
      if (this.tenancyDetailForm.invalid) {
        this.tenancyDetailForm.markAllAsTouched();
      }
      if (this.guarantorForm.invalid) {
        this.guarantorForm.markAllAsTouched();
      }
      if (nextIndex === 10) {
        this.initPaymentConfiguration();
      }
    }
  }

  private savePreviousStep(event: any) {
    if (this.isStudentProperty || this.applicationDetails.isSubmitted) {
      return;
    }
    const previouslySelectedIndex = event.previouslySelectedIndex;
    this.savePreviouslySelectedData(previouslySelectedIndex);
  }

  private savePreviouslySelectedData(index: number) {
    switch (index) {
      case 0:
        if (!this.applicationDetails.isSubmitted)
          this.saveApplicantsToApplication();
        break;
      case 1:
        if (!this.applicationDetails.isSubmitted && this.applicantId)
          this.saveApplicantDetails();
        break;
      case 2:
        if (!this.applicationDetails.isSubmitted && this.applicantId)
          this.saveAddressDetails();
        break;
      case 3:
        if (!this.applicationDetails.isSubmitted && this.applicantId)
          this.saveBankDetails();
        break;
      case 4:
        if (!this.applicationDetails.isSubmitted && this.applicantId)
          this.saveApplicationQuestions();
        break;
      case 5:
        if (!this.applicationDetails.isSubmitted)
          this.saveTenancyDetail();
        break;
      case 8:
        if (!this.applicationDetails.isSubmitted)
          this.saveGuarantorDetails();
        break;
      case 10:
        this.initPaymentConfiguration();
        break;
      default:
        break;
    }
  }

  saveStepData(index: number, type: string) {
    if (index === 4) {
      this.commonService.showMessage('Please accept the terms and conditions.', 'Terms & Conditions', 'error');
      return;
    }
    if (type === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
      this.selectionType = APPLICATION_ACTION_TYPE.SAVE_FOR_LATER;
    }
    if (index === 6 || index === 7 || index === 9) {
      this.onSave();
    }
    this.savePreviouslySelectedData(index);
  }

  private async onSave() {
    const title = 'Save for later';
    const message = 'Your application has been saved. Please complete your application within 14 days in order to guarantee a reservation.';
    this.commonService.showAlert(title, message, '').then(res => {
      if (res) {
        this.router.navigate([`../../applications`], { replaceUrl: true, relativeTo: this.route });
      }
    });
  }

  private async saveApplicantsToApplication() {
    this.updateOccupantsInProcess = true;
    const apiObservableArray = await this.getModifiedOccupantList();
    if (!apiObservableArray.length) {
      this.updateOccupantsInProcess = false;
    }
    setTimeout(() => {
      forkJoin(apiObservableArray).subscribe(async (response: any[]) => {
        this.updateOccupantsInProcess = false;
        this.isCoApplicantDeleted = null;
        this.occupantForm.reset(this.occupantForm.value);
        const applicants = await this.getApplicationApplicants(this.applicationId) as ApplicationModels.ICoApplicants;
        await this.setApplicationApplicants(applicants);
        await this.setLeadApplicantDetails();
        if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
          this.onSave();
        }
      }, error => {
        this.updateOccupantsInProcess = false;
        this.occupantForm.reset(this.occupantForm.value);
      });
    }, 1000);
  }

  private async getModifiedOccupantList() {
    /**Add and delete applicants*/
    let apiObservableArray = [];
    if (this.checkFormDirty(this.occupantForm) || this.isCoApplicantDeleted) {
      if (this.selectionType == 'saveForLater') {
        this.saveDataLoader = true;
      }
      let newApplicationApplicants = [];
      let deletedApplicants = [];
      let existingApplicantList = [];
      const coApplicantList = this.occupantForm.controls['coApplicants'].value;
      if (coApplicantList.length) {
        coApplicantList.map((occupant) => {
          /**Check for new occupant*/
          if (!occupant.applicationApplicantId && occupant.isAdded && !occupant.isDeleted) {
            if (!occupant.applicantId) {
              newApplicationApplicants.push(occupant);
            }
            if (occupant.applicantId) {
              /**Link the existing occupants with the application : via search*/
              // apiObservableArray.push(this._tobService.linkApplicantToApplication(this.applicationId, occupant, occupant.applicantId).pipe(delay(500)));
              existingApplicantList.push(occupant);
            }
          }
          /**Check for deleted occupant*/
          if (occupant.applicationApplicantId && occupant.isDeleted) {
            deletedApplicants.push(occupant.applicationApplicantId);
          }
        });
        if (newApplicationApplicants.length) {
          apiObservableArray.push(this._tobService.addApplicantToApplication(this.prepareOccupantData(newApplicationApplicants), this.applicationId));
        }
        if (existingApplicantList.length) {
          this._tobService.applicantionApplicantLinkageExisting(this.prepareExistingOccupantData(existingApplicantList), this.applicationId).subscribe((res) => {

          });
        }
        if (deletedApplicants.length) {
          apiObservableArray.push(this._tobService.removeApplicant(this.prepareDeletedOccupantData(deletedApplicants), this.applicationId));
        }
      }
    }
    return apiObservableArray;
  }

  private prepareOccupantData(newApplicationApplicants: any[]) {
    return {
      applicationApplicants: newApplicationApplicants,
      createdBy: 'AGENT',
      createdById: ''
    };
  }

  private prepareExistingOccupantData(existingApplicants: any[]) {
    return {
      applicationApplicants: existingApplicants,
      createdBy: "AGENT"
    };
  }

  private prepareDeletedOccupantData(deletedApplicants: string[]) {
    let paramsString = '?';
    deletedApplicants.forEach((id, i) => {
      paramsString = paramsString + `applicationApplicantId=${id}` + (deletedApplicants.length !== i + 1 ? '&' : '');
    });
    return {
      queryString: paramsString,
      data: { deletedBy: 'AGENT', deletedById: '' }
    };
  }

  onLeadSelection(item: FormGroup) {
    this.commonService.showConfirm('Lead Applicant', 'Are you sure, you want to make this applicant to lead applicant?', '', 'YES', 'NO').then(response => {
      if (response && item.controls['applicationApplicantId'].value) {
        const updateLeadData = {
          modifiedById: '',
          modifiedBy: ENTITY_TYPE.AGENT
        };
        this._tobService.updateLead(updateLeadData, this.applicationId, item.controls['applicationApplicantId'].value).subscribe(async (resp) => {
          const applicants = await this.getApplicationApplicants(this.applicationId) as ApplicationModels.ICoApplicants;
          await this.setApplicationApplicants(applicants);
          await this.setLeadApplicantDetails();
        });
      }
      else {
        item.controls['isLead'].setValue(false);
      }
    });
  }

  updateApplicantById(item: FormGroup, value) {
    if (item.controls['applicationApplicantId'].value) {
      const updateApplicantData = {
        isReferencingRequired: value
      };
      this._tobService.updateApplicantDetails(item.controls['applicantId'].value, updateApplicantData).subscribe(res => {
      });
    }
  }

  private async getApplicantCoApplicants(applicantId: string) {
    this._tobService.getApplicantCoApplicants(applicantId).subscribe(response => {
      if (response && response.data) {
        const finalData = this.occupantForm.get('coApplicants').value;
        response.data.forEach((item: any) => {
          item.isLead = false;
          finalData.push(item);
        });
        this.occupantForm.get('coApplicants')['controls'].splice(0);
        this.updateOccupantForm(finalData);
      }
    });
  }

  private getApplicationDetails(applicationId: string) {
    return new Promise((resolve, reject) => {
      this._tobService.getApplicationDetails(applicationId).subscribe(
        res => {
          resolve(res);
        },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private getAgreementTypeLookup() {
    return new Promise((resolve, reject) => {
      this._tobService.getAgreementTypeLookup().subscribe(
        res => {
          this.agreementTypesLookup = res;
          resolve(res);
        },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private setApplicationDetails(res: ApplicationModels.IApplicationResponse) {
    return new Promise((resolve) => {
      this.applicationDetails = res;
      this.applicationDetails.applicationClauses = res.applicationClauses ? res.applicationClauses : [];
      this.applicationDetails.applicationRestrictions = res.applicationRestrictions ? res.applicationRestrictions : [];
      this.applicationStatus = this.commonService.getLookupValue(this.applicationDetails.status, this.applicationStatuses);
      this.applicationDetails.applicationRestrictions = this.applicationDetails.applicationRestrictions.filter(restrict => restrict.value);
      this.applicationDetails.applicationRestrictions.forEach(
        restrict =>
        (restrict.restrictionName = this.commonService.camelize(
          restrict.key.replace(/_/g, ' ')
        ))
      );
      this.termsConditionControl = this.applicationDetails.isTermsAndConditionsAccepted;
      this.setTenancyDetails(res);
      return resolve(true);
    });
  }

  private getApplicationApplicants(applicationId: string) {
    return new Promise((resolve, reject) => {
      this._tobService.getApplicationApplicants(applicationId).subscribe(
        res => {
          this.isApplicantDetailsAvailable = true;
          resolve(res);
        },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private setApplicationApplicants(res: any) {
    return new Promise((resolve) => {
      this.occupantForm.get('coApplicants')['controls'].splice(0);
      this.applicationApplicantDetails = (res && res.data) ? res.data : [];
      const leadApplicantDetails = this.applicationApplicantDetails.filter((occupant) => occupant.isLead);
      if (leadApplicantDetails && leadApplicantDetails.length > 0) {
        this.applicantId = leadApplicantDetails[0].applicantId;
      }
      this.updateOccupantForm(this.applicationApplicantDetails);
      return resolve(true);
    });
  }

  private async setLeadApplicantDetails() {
    if (this.applicantId) {
      await this.getApplicantDetails(this.applicantId);
      if (this.applicationDetails.leadApplicantItemtype === 'M') {
        await this.getTenantBankDetails(this.applicantId);
        await this.getTenantGuarantors(this.applicantId);
      } else {
        await this.getApplicantBankDetails(this.applicantId);
        await this.getApplicantGuarantors(this.applicantId);
      }
    }
  }

  private async createApplication() {
    const requestObj: any = {};
    requestObj.createdBy = ENTITY_TYPE.AGENT;
    requestObj.propertyId = this.propertyId;
    requestObj.status = APPLICATION_STATUSES.NEW;
    requestObj.rent = this.propertyDetails?.rentAmount;
    requestObj.depositAmount = this.propertyDetails?.holdingDeposit;
    requestObj.deposit = this.propertyDetails?.deposit;
    requestObj.applicationRestrictions = this.propertyRestrictions;
    requestObj.applicationClauses = this.propertyClauses;
    this._tobService.createApplication(requestObj).subscribe(
      res => {
        this.router.navigate([`../application/${res.applicationId}`], { relativeTo: this.route });
      }
    );
  }

  private getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve, reject) => {
      this._tobService.getPropertyDetails(propertyId, params).subscribe(
        res => {
          if (res) {
            this.propertyDetails = res.data;
            const propertyType = this.commonService.getLookupValue(this.propertyDetails.rentCategory, this.rentCategories);
            if (propertyType === 'Student') {
              this.isStudentProperty = true;
              this.isStudentGuarantor();
            }
            this.propertyDetails.propertyImageUrl = this.commonService.getHeadMediaUrl(res.data.media || []);
            this.propertyDetails.webImageUrl = this.webImageUrl;
            this.isTobPropertyCardReady = true;
            if (this.tobLookupData && this.tobLookupData.noDepositScheme) {
              this.propertyDetails.noDepositScheme = this.tobLookupData.noDepositScheme;
            }
            resolve(true);
          }
        },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private getPropertyClauses(propertyId: string) {
    return new Promise((resolve, reject) => {
      this._tobService.getPropertyClauses(propertyId).subscribe(
        res => {
          this.propertyClauses = (res && res.data) ? res.data : [];
          resolve(true);
        },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private getPropertyRestrictions(propertyId) {
    return new Promise((resolve, reject) => {
      this._tobService.getPropertyRestrictions(propertyId).subscribe(
        res => {
          this.propertyRestrictions = (res && res.data) ? res.data.filter(result => result.value) : [];
          this.propertyRestrictions.forEach(restrict => restrict.restrictionName = this.commonService.camelize(restrict.key.replace(/_/g, ' ')));
          resolve(true);
        },
        error => {
          reject(undefined);
        }
      );
    });
  }


  private updateApplicantDetails() {
    const requestObj = this.applicantDetailsForm.value;
    requestObj.moveInDate = this.commonService.getFormatedDate(requestObj.moveInDate);
    this._tobService.updateApplicantDetails(this.applicantId, requestObj).subscribe(res => {
      if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
        this.onSave();
      }
    });
  }


  private getLookUpData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData();
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.setLookupData();
      });
    }
  }

  private getTobLookupData() {
    this.tobLookupData = this.commonService.getItem(PROPCO.TOB_LOOKUP_DATA, true);
    if (this.tobLookupData) {
      this.setTobLookupData();
    } else {
      this.commonService.getTobLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.TOB_LOOKUP_DATA, data);
        this.setTobLookupData();
      });
    }
  }
  private setLookupData(): void {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.letDurations = this.lookupdata.letDurations;
    this.tenantCurrentPositionTypes = this.lookupdata.tenantCurrentPositionTypes;
    this.applicantGuarantorTypes = this.lookupdata.applicantGuarantorTypes;
    this.rentFrequencyTypes = this.lookupdata.advertisementRentFrequencies;
    this.rentCategories = this.lookupdata.rentCategories;
  }

  private setTobLookupData(): void {
    this.tobLookupData = this.commonService.getItem(PROPCO.TOB_LOOKUP_DATA, true);
    this.applicationStatuses = this.tobLookupData.applicationStatuses;
    this.applicantQuestions = this.tobLookupData.applicantQuestions;
  }

  private initSearchForm(): void {
    this.searchApplicantForm = this._formBuilder.group({
      searchApplicant: ''
    });
  }

  private initApplicantDetailsForm(): void {
    this.applicantDetailsForm = this._formBuilder.group({
      title: [''],
      forename: [''],
      surname: [''],
      email: ['', [ValidationService.emailValidator]],
      mobile: ['', [ValidationService.contactValidator]],
      dateOfBirth: [''],
      occupation: [''],
      hasPets: false,
      petsInfo: ['', { disabled: false }],
      guarantor: false,
      guarantorType: ['', { disabled: false }],
      currentPosition: '',
      isReferencingRequired: false
    });
  }

  async onCancel() {
    const isCancel: boolean = await this.commonService.showConfirm('Cancel', 'Are you sure, you want to cancel this operation?', '', 'Yes', 'No') as boolean;
    if (isCancel) {
      this.router.navigate([`../../applications`], { replaceUrl: true, relativeTo: this.route });
    }
  }

  /** Occupants Functionality **/

  private initOccupantForm(): void {
    this.occupantForm = this._formBuilder.group({
      coApplicants: this._formBuilder.array([])
    });
  }

  private createItem(): void {
    const coApplicants: any = this.occupantForm.get('coApplicants');
    coApplicants.push(this._formBuilder.group({
      surname: ['', [Validators.required]],
      forename: ['', [Validators.required]],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      mobile: ['', [Validators.required, ValidationService.numberValidator]],
      applicationApplicantId: null,
      isLead: false,
      createdById: null,
      createdBy: ENTITY_TYPE.AGENT,
      isAdded: false,
      isDeleted: false,
      title: '',
      applicantId: '',
      isReferencingRequired: false
    }
    ));
  }

  addApplicant(control: FormControl, index: number) {
    const coApplicants: any = this.occupantForm.get('coApplicants');
    coApplicants.push(this._formBuilder.group({
      surname: control.value.surname,
      forename: control.value.forename,
      email: control.value.email,
      mobile: control.value.mobile,
      applicationApplicantId: null,
      isLead: index === 0 ? true : false,
      createdById: null,
      createdBy: ENTITY_TYPE.AGENT,
      isAdded: true,
      isDeleted: false,
      title: control.value.title,
      applicantId: '',
      isReferencingRequired: control.value.isReferencingRequired
    }
    ));
    coApplicants.removeAt(index);
    this.createItem();
  }

  private addSearchApplicant(response: any, index: number) {
    this.isCoApplicantDeleted = true;
    const coApplicants: any = this.occupantForm.get('coApplicants');
    coApplicants.push(this._formBuilder.group({
      surname: response.surname,
      forename: response.forename,
      email: response.email,
      mobile: response.mobile,
      applicationApplicantId: null,
      isLead: index === 0 ? true : false,
      createdById: null,
      createdBy: ENTITY_TYPE.AGENT,
      isAdded: true,
      isDeleted: false,
      title: response.title,
      applicantId: response.applicantId,
      isReferencingRequired: response?.isReferencingRequired
    }
    ));
    coApplicants.removeAt(index);
    this.createItem();
  }

  removeCoApplicant(group: FormGroup) {
    group.controls['isDeleted'].setValue(true);
    this.isCoApplicantDeleted = group.controls['isDeleted'].value;
    this.commonService.showMessage('Occupant has been deleted successfully.', 'Delete Occupant', 'error');
  }

  private updateOccupantForm(occupantsList: any[]) {
    if (Array.isArray(occupantsList) && occupantsList.length > 0) {
      const occupantsArray: any = this.occupantForm.get('coApplicants');
      occupantsList.forEach(element => {
        if (element.applicantId || element.isAdded) {
          occupantsArray.push(this._formBuilder.group({
            surname: element.surname,
            forename: element.forename,
            email: element.email,
            mobile: element.mobile,
            applicationApplicantId: element.applicationApplicantId,
            isLead: element.isLead,
            createdById: null,
            createdBy: ENTITY_TYPE.AGENT,
            isAdded: true,
            isDeleted: false,
            title: element.title,
            applicantId: element.applicantId,
            isReferencingRequired: element.isReferencingRequired
          }));
        }
      });
    }
    this.createItem();
  }

  checkFormDirty(form: any) {
    const dirtyForm = this.commonService.getDirtyValues(form);
    if (Object.keys(dirtyForm).length) {
      return true;
    }
    else if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
      this.onSave();
    }
  }

  /** Occupants Functionality **/

  initAddressDetailsForm(): void {
    this.addressDetailsForm = this._formBuilder.group({
      address: this._formBuilder.group({
        postcode: ['', [Validators.required, ValidationService.postcodeValidator]],
        addressdetails: [''],
        addressLine1: ['', Validators.required],
        addressLine2: '',
        locality: '',
        town: ['', Validators.required],
        county: '',
        country: ''
      }),
      forwardingAddress: this._formBuilder.group({
        postcode: ['', [ValidationService.postcodeValidator]],
        addressdetails: [''],
        addressLine1: '',
        addressLine2: '',
        locality: '',
        town: '',
        county: '',
        country: ''
      })
    });
  }

  getAddressList(addressType: string) {
    let postcode;
    switch (addressType) {
      case 'personal':
        postcode = this.addressDetailsForm.controls.address['controls'].postcode;
        const addressPostcode = postcode.value;
        this.showPostcodeLoader = postcode.value ? true : '';
        this.addressDetailsForm.controls.address.reset();
        this.addressDetailsForm.controls.address['controls'].postcode.setValue(addressPostcode);
        break;
      case 'correspondence-address':
        postcode = this.addressDetailsForm.controls.forwardingAddress['controls'].postcode;
        const forwardingAddressPostcode = postcode.value;
        this.showPostcodeLoader = postcode.value ? true : '';
        this.addressDetailsForm.controls.forwardingAddress.reset();
        this.addressDetailsForm.controls.forwardingAddress['controls'].postcode.setValue(forwardingAddressPostcode);
        break;
      case 'guarantor':
        postcode = this.guarantorForm.controls.address['controls'].postcode;
        const guarantorFormPostcode = postcode.value;
        this.showPostcodeLoader = postcode.value ? true : '';
        this.guarantorForm.controls.address.reset();
        this.guarantorForm.controls.address['controls'].postcode.setValue(guarantorFormPostcode);
        break;
    }
    if (postcode.valid && postcode.value) {
      this.getPostcodeAddress(addressType, postcode.value);
    }
    else {
      this.showPostcodeLoader = false;
      this.showAddressLoader = false;
      this.addressList = [];
      this.guarantorAddressList = [];
      this.forwardingAddressList = [];
    }
  }

  getPostcodeAddress(addressType: string, postcode: string) {
    this.commonService.getPostcodeAddressList(postcode).subscribe(
      res => {
        this.addressList = [];
        this.guarantorAddressList = [];
        this.forwardingAddressList = [];
        if (res && res.data && res.data.length) {
          switch (addressType) {
            case 'personal':
              this.addressList = res.data;
              this.showPostcodeLoader = false;
              break;
            case 'guarantor':
              this.guarantorAddressList = res.data;
              this.showPostcodeLoader = false;
              break;
            case 'correspondence-address':
              this.forwardingAddressList = res.data;
              this.showAddressLoader = false;
              break;
          }
        }
      },
      error => {
        this.showPostcodeLoader = false;
        this.showAddressLoader = false;
        this.addressList = [];
        this.guarantorAddressList = [];
        this.forwardingAddressList = [];
        const data: any = {};
        data.title = 'Postcode Lookup';
        data.message = error.error ? error.error.message : error.message;
        this.commonService.showMessage(data.message, data.title, 'error');
      }
    );
  }

  getAddressDetails(addressId: string, addressType: string) {
    if (addressType == 'personal') {
      this.showApplicantAddress = true;
    }
    if (addressType == 'correspondence-address') {
      this.showCorrespondAddress = true;
    }
    if (addressType == 'guarantor') {
      this.showGuarantorAddress = true;
    }
    if (!addressId || '') {
      return;
    }
    this.commonService.getPostcodeAddressDetails(addressId).subscribe(
      res => {
        if (res && res.line1) {
          this.setAddressDetails(addressType, res);
        }
      },
      error => {
        const data: any = {};
        data.title = 'Postcode Address';
        data.message = error.error ? error.error.message : error.message;
        this.commonService.showMessage(data.message, data.title, 'error');
      }
    );
  }

  setAddressDetails(addressType: string, res: any) {
    switch (addressType) {
      case 'personal':
        this.addressDetailsForm.controls.address['controls'].addressLine1.setValue(res.line1);
        this.addressDetailsForm.controls.address['controls'].addressLine2.setValue(res.line2);
        this.addressDetailsForm.controls.address['controls'].locality.setValue(res.line4);
        this.addressDetailsForm.controls.address['controls'].town.setValue(res.line5);
        this.addressDetailsForm.controls.address['controls'].county.setValue(res.provinceName);
        this.addressDetailsForm.controls.address['controls'].country.setValue(res.countryName);
        break;
      case 'correspondence-address':
        this.addressDetailsForm.controls.forwardingAddress['controls'].addressLine1.setValue(res.line1);
        this.addressDetailsForm.controls.forwardingAddress['controls'].addressLine2.setValue(res.line2);
        this.addressDetailsForm.controls.forwardingAddress['controls'].locality.setValue(res.line4);
        this.addressDetailsForm.controls.forwardingAddress['controls'].town.setValue(res.line5);
        this.addressDetailsForm.controls.forwardingAddress['controls'].county.setValue(res.provinceName);
        this.addressDetailsForm.controls.forwardingAddress['controls'].country.setValue(res.countryName);
        break;
      case 'guarantor':
        this.guarantorForm.controls.address['controls'].addressLine1.setValue(res.line1);
        this.guarantorForm.controls.address['controls'].addressLine2.setValue(res.line2);
        this.guarantorForm.controls.address['controls'].locality.setValue(res.line4);
        this.guarantorForm.controls.address['controls'].town.setValue(res.line5);
        this.guarantorForm.controls.address['controls'].county.setValue(res.provinceName);
        this.guarantorForm.controls.address['controls'].country.setValue(res.countryName);
        break;
    }
  }

  initBankDetailsForm(): void {
    this.bankDetailsForm = this._formBuilder.group({
      bankDetails: this._formBuilder.group({
        bankName: '',
        sortcode: ['', [ValidationService.bankCodeValidator, Validators.maxLength(8)]],
        accountNumber: ['', [Validators.maxLength(8)]],
        accountName: ''
      })
    });
  }

  initTenancyDetailsForm(): void {
    this.tenancyDetailForm = this._formBuilder.group({
      rent: ['', [Validators.min(1), Validators.required]],
      depositAmount: ['', Validators.required],
      deposit: ['', Validators.required],
      moveInDate: ['', Validators.required],
      preferredTenancyEndDate: ['', Validators.required],
      rentDueDay: ['', [Validators.required, Validators.max(31), Validators.min(1)]],
      numberOfAdults: ['', Validators.required],
      numberOfChildren: ['', Validators.required],
      hasSameHouseholdApplicants: [false, Validators.required],
      numberOfHouseHolds: [{ value: '', disabled: false }, Validators.required],
      isNoDepositScheme: [''],
      agreementType: null
    }, {
      validator: Validators.compose([
        ValidationService.dateLessThan('moveInDate', 'preferredTenancyEndDate')
      ])
    }
    );

    this.tenancyDetailForm.controls['rent'].valueChanges.pipe(debounceTime(500)).subscribe((res) => {
      if (this.initiaFormlLoaded) {
        this.calRent(res);
      }
      this.initiaFormlLoaded = true;
    });
  }

  setHouseHoldValue(value: number) {
    if (value === 1) {
      this.tenancyDetailForm.get('hasSameHouseholdApplicants').disable();
      this.tenancyDetailForm.get('numberOfHouseHolds').disable();
    } else {
      this.tenancyDetailForm.get('hasSameHouseholdApplicants').enable();
      this.tenancyDetailForm.get('numberOfHouseHolds').enable();
    }
  }

  private saveTenancyDetail(): void {
    this.applicationDetails.moveInDate = this.tenancyDetailForm.value.moveInDate ? this.commonService.getFormatedDate(this.tenancyDetailForm.value.moveInDate) : null;
    this.applicationDetails.rentingTime = this.tenancyDetailForm.value.rentingTime;
    this.applicationDetails.preferredTenancyEndDate = this.tenancyDetailForm.value.preferredTenancyEndDate ? this.commonService.getFormatedDate(this.tenancyDetailForm.value.preferredTenancyEndDate) : null;
    this.applicationDetails.rentDueDay = this.tenancyDetailForm.value.rentDueDay;
    this.applicationDetails.numberOfAdults = this.tenancyDetailForm.value.numberOfAdults;
    this.applicationDetails.numberOfChildren = this.tenancyDetailForm.value.numberOfChildren;
    this.applicationDetails.hasSameHouseholdApplicants = this.tenancyDetailForm.value.hasSameHouseholdApplicants;
    this.applicationDetails.numberOfHouseHolds = this.tenancyDetailForm.value.numberOfHouseHolds;
    this.applicationDetails.isNoDepositScheme = this.tenancyDetailForm.value.isNoDepositScheme;
    this.applicationDetails.rent = this.tenancyDetailForm.value.rent;
    this.applicationDetails.depositAmount = this.tenancyDetailForm.value.depositAmount;
    this.applicationDetails.deposit = this.tenancyDetailForm.value.deposit;
    this.applicationDetails.agreementType = this.tenancyDetailForm.value.agreementType;
    if (this.checkFormDirty(this.tenancyDetailForm)) {
      this.updateApplicationDetails();
    }
  }

  private async updateApplicationDetails() {
    const requestObj = JSON.parse(JSON.stringify(this.applicationDetails));
    requestObj.applicationRestrictions.map(restrict => { delete restrict.restrictionName; }
    );
    if (requestObj.numberOfAdults) {
      requestObj.hasSameHouseholdApplicants = true;
      requestObj.numberOfHouseHolds = 1;
    }
    if (requestObj.hasSameHouseholdApplicants) {
      requestObj.numberOfHouseHolds = 1;
    }
    requestObj.isTermsAndConditionsAccepted = true;
    requestObj.rent = requestObj.rent ? requestObj.rent : this.propertyDetails.advertisementRent;
    requestObj.depositAmount = requestObj.depositAmount ? requestObj.depositAmount : this.propertyDetails.holdingDeposit;
    requestObj.deposit = requestObj.deposit ? requestObj.deposit : this.propertyDetails.deposit;
    this._tobService.updateApplicationDetails(requestObj, this.applicationId).subscribe(
      res => {
        if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
          this.onSave();
        }
        this.applicationDetails.depositAmount = requestObj.depositAmount ? requestObj.depositAmount : this.propertyDetails.holdingDeposit;
        this.tenancyDetailForm.reset(this.tenancyDetailForm.value);
      },
    );
  }

  /** Application Question Functionality **/

  initApplicantQuestionForm() {
    this.applicantQuestionForm = this._formBuilder.group({
      questions: this._formBuilder.array([])
    });
  }

  private async getApplicantQuestions() {
    return new Promise((resolve, reject) => {
      this._tobService.getApplicantQuestions().subscribe(res => {
        const response = (res && res.data) ? res.data : [];
        resolve(response);
      }, error => {
        reject(undefined);
      });
    });

  }

  private getApplicationQuestionsAnswer(applicationId: string) {
    const questions: any = this.applicantQuestionForm.get('questions');
    return new Promise((resolve, reject) => {
      this._tobService.getApplicationQuestionsAnswer(applicationId).subscribe(res => {
        if (res && res.count) {
          questions.controls.forEach(element => {
            const item = res.data.find(answer => answer.questionId === element.value.applicantQuestionId);
            element.patchValue({
              toggle: item ? item.toggle : null,
              answer: item ? item.answer : null,
              answerById: item ? item.answerById : null,
              applicationQuestionId: item ? item.applicationQuestionId : null,
            });
          });
        }
        resolve(true);
      }, error => {
        reject(undefined);
      });
    });
  }

  private createQuestionItems(questionArray: any) {
    const questionFormArray: any = this.applicantQuestionForm.get('questions');
    questionArray.forEach(element => {
      const questionForm = this._formBuilder.group({
        applicantQuestionId: element.applicantQuestionId,
        question: element.text,
        applicationQuestionId: [null],
        toggle: false,
        type: element.answerType,
        answer: [undefined, element.isMandatory ? Validators.required : null],
        answerById: [null]
      });
      questionFormArray.push(questionForm);
    });
  }

  saveApplicationQuestions() {
    if (this.checkFormDirty(this.applicantQuestionForm)) {
      const questions = this.applicantQuestionForm.get('questions') as FormArray;
      let questionAnswerObj = {} as any;
      questionAnswerObj.answerById = this.applicantId;
      questionAnswerObj.answers = [];
      questions.controls.forEach(element => {
        const question = element.value;
        const answer = question.type === 'BOOLEAN' ? question.toggle : question.answer;
        if (element.dirty && answer !== null) {
          let questionDetails: any = {};
          questionDetails.toggle = question.toggle;
          questionDetails.answer = answer;
          questionDetails.applicationQuestionId = question.applicationQuestionId;
          questionAnswerObj.answers.push(questionDetails);
          element.markAsPristine();
        }
      });
      if (questionAnswerObj.answers.length) {
        this._tobService.updateApplicationQuestionsAnswers(this.applicationId, questionAnswerObj).subscribe((res) => {
          this.applicantQuestionForm.reset(this.applicantQuestionForm.value);
          if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
            this.onSave();
          }
        }, err => {
          console.log(err);
        });
      }
    }
  }

  /** Application Question Functionality **/

  isGurantorEnable() {
    if (this.applicantDetailsForm.value.guarantor) {
      this.applicantDetailsForm.controls.guarantorType.setValidators([Validators.required]);
    } else {
      this.applicantDetailsForm.controls.guarantorType.clearValidators();
    }
    this.applicantDetailsForm.get('guarantorType').updateValueAndValidity();
  }

  private patchApplicantAddressDetail() {
    if (this.applicantDetail.address.postcode) {
      this.showApplicantAddress = true;
    }
    this.addressDetailsForm.patchValue({
      address: {
        postcode: this.applicantDetail.address.postcode,
        addressLine1: this.applicantDetail.address.addressLine1,
        addressLine2: this.applicantDetail.address.addressLine2,
        town: this.applicantDetail.address.town,
        county: this.applicantDetail.address.county,
        country: this.applicantDetail.address.country,
        locality: this.applicantDetail.address.locality,
        addressdetails: ''
      }
    });
    if (this.isStudentProperty) {
      if (this.applicantDetail.forwardingAddress.postcode) {
        this.showCorrespondAddress = true;
      }
      this.addressDetailsForm.patchValue({
        forwardingAddress: {
          postcode: this.applicantDetail.forwardingAddress.postcode,
          addressLine1: this.applicantDetail.forwardingAddress.addressLine1,
          addressLine2: this.applicantDetail.forwardingAddress.addressLine2,
          town: this.applicantDetail.forwardingAddress.town,
          county: this.applicantDetail.forwardingAddress.county,
          country: this.applicantDetail.forwardingAddress.country,
          locality: this.applicantDetail.forwardingAddress.locality,
          addressdetails: ''
        }
      });
    }
  }

  private saveApplicantDetails() {
    const applicantDetails = this.applicantDetailsForm.value;
    applicantDetails.dateOfBirth = applicantDetails.dateOfBirth ? this.commonService.getFormatedDate(applicantDetails.dateOfBirth) : null;
    if (this.checkFormDirty(this.applicantDetailsForm)) {
      this.updateApplicantDetails();
    }
  }

  private saveAddressDetails() {
    const applicantDetails = this.applicantDetailsForm.value;
    applicantDetails.address = this.addressDetailsForm.value.address;
    applicantDetails.dateOfBirth = applicantDetails.dateOfBirth ? this.commonService.getFormatedDate(applicantDetails.dateOfBirth) : null;
    applicantDetails.forwardingAddress = this.addressDetailsForm.value.forwardingAddress;
    if (this.checkFormDirty(this.addressDetailsForm)) {
      this.updateApplicantDetails();
    }
  }

  private getApplicantBankDetails(applicantId: string) {
    return new Promise((resolve, reject) => {
      this._tobService.getApplicantBankDetails(applicantId).subscribe(
        res => {
          if (res) {
            this.patchBankDetails(res);
          }
          resolve(true);
        },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private getTenantBankDetails(applicantId: string) {
    return new Promise((resolve, reject) => {
      this._tobService.getTenantBankDetails(applicantId).subscribe(res => {
        if (res) {
          this.patchBankDetails(res);
        }
        resolve(true);
      },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private patchBankDetails(bankDetails: any) {
    this.bankDetailsForm.patchValue({
      bankDetails: {
        bankName: bankDetails.bankName ? bankDetails.bankName : '',
        sortcode: bankDetails.sortcode ? bankDetails.sortcode : '',
        accountNumber: bankDetails.accountNumber ? bankDetails.accountNumber : '',
        accountName: bankDetails.accountName ? bankDetails.accountName : '',
      }
    });
  }

  private saveBankDetails() {
    const bankDetails = this.bankDetailsForm.value.bankDetails;
    if (this.checkFormDirty(this.bankDetailsForm)) {
      this.updateBankDetails(bankDetails);
    }
  }

  private updateBankDetails(bankDetails: any) {
    this._tobService.updateBankDetails(this.applicantId, bankDetails).subscribe(
      res => {
        this.bankDetailsForm.reset(this.bankDetailsForm.value);
      }
    );
  }

  setTenancyDetails(details: any) {
    this.tenancyDetailForm.patchValue({
      rent: details?.rent ? details?.rent : this.propertyDetails?.rentAmount,
      depositAmount: details?.depositAmount ? details?.depositAmount : this.propertyDetails?.holdingDeposit,
      deposit: details?.deposit ? details?.deposit : this.propertyDetails?.deposit,
      moveInDate: details.moveInDate ? this.commonService.getFormatedDate(details.moveInDate) : '',
      preferredTenancyEndDate: details.preferredTenancyEndDate ? this.commonService.getFormatedDate(details.preferredTenancyEndDate) : '',
      rentDueDay: details.rentDueDay,
      numberOfAdults: details.numberOfAdults,
      numberOfChildren: details.numberOfChildren,
      hasSameHouseholdApplicants: details.hasSameHouseholdApplicants,
      numberOfHouseHolds: details.numberOfHouseHolds,
      isNoDepositScheme: details.isNoDepositScheme,
      agreementType: details?.agreementType
    });
    if (this.isStudentProperty) {
      this.tenancyDetailForm.patchValue({
        numberOfHouseHolds: this.propertyDetails.numberOfBedroom
      });
    }
  }

  /** Guarantor Details Functionality **/

  private initGuarantorForm(): void {
    this.guarantorForm = this._formBuilder.group({
      guarantorId: [''],
      title: ['', [ValidationService.speacialValidator]],
      forename: [''],
      surname: [''],
      email: ['', [ValidationService.emailValidator]],
      mobile: ['', [ValidationService.contactValidator, Validators.minLength(5), Validators.maxLength(15)]],
      address: this._formBuilder.group({
        postcode: ['', [ValidationService.postcodeValidator]],
        addressdetails: [''],
        addressLine1: [''],
        addressLine2: '',
        locality: '',
        town: [''],
        county: '',
        country: ''
      })
    });
  }

  private isStudentGuarantor() {
    this.guarantorForm.controls.title.setValidators(Validators.required);
    this.guarantorForm.controls.forename.setValidators(Validators.required);
    this.guarantorForm.controls.surname.setValidators(Validators.required);
    this.guarantorForm.controls.email.setValidators([Validators.required, ValidationService.emailValidator]);
    this.guarantorForm.controls.mobile.setValidators([Validators.required, ValidationService.contactValidator, Validators.minLength(5), Validators.maxLength(15)]);
    this.guarantorForm.controls.address['controls'].postcode.setValidators([Validators.required, ValidationService.postcodeValidator]);
    this.guarantorForm.controls.address['controls'].addressLine1.setValidators(Validators.required);
    this.guarantorForm.controls.address['controls'].town.setValidators(Validators.required);
    this.guarantorForm.controls.title.updateValueAndValidity();
    this.guarantorForm.controls.forename.updateValueAndValidity();
    this.guarantorForm.controls.surname.updateValueAndValidity();
    this.guarantorForm.controls.email.updateValueAndValidity();
    this.guarantorForm.controls.mobile.updateValueAndValidity();
    this.guarantorForm.controls.address['controls'].postcode.updateValueAndValidity();
    this.guarantorForm.controls.address['controls'].addressLine1.updateValueAndValidity();
    this.guarantorForm.controls.address['controls'].town.updateValueAndValidity();
  }

  private getApplicantGuarantors(applicantId: string) {
    return new Promise((resolve, reject) => {
      this._tobService.getApplicantGuarantors(applicantId).subscribe(
        res => {
          if (res && res.data) {
            this.setGuarantorDetails(res.data[0]);
          }
          resolve(true);
        }, error => {
          reject(undefined);
        }
      );
    });
  }

  private getTenantGuarantors(applicantId: string) {
    return new Promise((resolve, reject) => {
      this._tobService.getTenantGuarantors(applicantId).subscribe(
        res => {
          if (res && res.data) {
            this.setGuarantorDetails(res.data[0]);
            resolve(true);
          }
        }, error => {
          reject(undefined);
        }
      )
    });
  }

  private setGuarantorDetails(details: any): void {
    if (details.guarantorId) {
      this.showGuarantorAddress = true;
    }
    this.guarantorForm.patchValue({
      guarantorId: details.guarantorId,
      title: details.title,
      forename: details.forename,
      surname: details.surname,
      email: details.email,
      mobile: details.mobile,
      address: {
        postcode: details.address.postcode,
        addressLine1: details.address.addressLine1,
        addressLine2: details.address.addressLine2,
        locality: details.address.locality,
        town: details.address.town,
        county: details.address.county,
        country: details.address.country,
        addressdetails: ''
      }
    });
  }

  private saveGuarantorDetails() {
    if (this.checkFormDirty(this.guarantorForm)) {
      if (this.guarantorForm.controls['guarantorId'].value) {
        this.updateGuarantorDetails(Object.assign({}, this.guarantorForm.value));
      }
      else {
        this.createGuarantor(this.guarantorForm.value);
      }
    }
  }

  private updateGuarantorDetails(guarantorDetails: any) {
    guarantorDetails = this.commonService.replaceEmptyStringWithNull(guarantorDetails);
    const guarantorId = guarantorDetails.guarantorId;
    delete guarantorDetails.guarantorId;
    this._tobService.updateGuarantorDetails(guarantorDetails, guarantorId).subscribe(
      res => {
        if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
          this.onSave();
        }
        this.guarantorForm.reset(this.guarantorForm.value);
      }
    );
  }

  private createGuarantor(guarantorDetails: any): void {
    guarantorDetails = this.commonService.replaceEmptyStringWithNull(guarantorDetails);
    this._tobService.createGuarantor(guarantorDetails, this.applicantId).subscribe(
      res => {
        if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
          this.onSave();
        }
        this.guarantorForm.reset(this.guarantorForm.value);
        if (res) {
          this.guarantorForm.controls['guarantorId'].setValue(res.guarantorId);
        }
      }
    );
  }

  /** Terms and Conditions Functionality **/

  private initTermsAndConditionData() {
    this.termsAndConditionData = this.commonService.getItem(PROPCO.TERMS_AND_CONDITIONS, true);
    if (this.termsAndConditionData) {
      this.setTermsAndConditionData();
    } else {
      this._tobService.getTermsAndConditions().subscribe(data => {
        this.commonService.setItem(PROPCO.TERMS_AND_CONDITIONS, data);
        this.setTermsAndConditionData();
      });
    }
  }

  private setTermsAndConditionData() {
    this.termsAndConditionData = this.commonService.getItem(PROPCO.TERMS_AND_CONDITIONS, true);
  }

  async openTermsAndConditionModal() {
    const termsAndCondition = this.termsAndConditionData?.application?.termsAndCondition;
    const modal = await this.modalController.create({
      component: TermsAndConditionModalPage,
      cssClass: 'modal-container modal-width tob-modal-container',
      componentProps: {
        data: termsAndCondition,
        heading: 'Terms and Conditions'
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(res => {
      if (!this.termsConditionControl) {
        this.termsConditionControl = res.data.accepted;
      }
    });
    await modal.present();
  }

  async onTermsModelChanged(event) {
    if (!this.applicationDetails.isTermsAndConditionsAccepted) {
      await this.updateApplicationDetails();
      this.applicationDetails.isTermsAndConditionsAccepted = this.termsConditionControl;
    }
  }

  /** Terms and Conditions Functionality **/
  private initWorldpayPaymentDetails() {
    var orderCode = 'PROPCOTESTM1TBS' + Math.random();
    this.paymentDetails = {};
    var paymentConfigUrl = this.PAYMENT_PROD ? PAYMENT_CONFIG.WORLDPAY_REDIRECT.PROD_URL : PAYMENT_CONFIG.WORLDPAY_REDIRECT.TEST_URL;
    this.paymentDetails.actionUrl = paymentConfigUrl;
    this.paymentDetails.cartId = orderCode;
    this.paymentDetails.desc = 'Online Reservation - PropCo Web';
    this.paymentDetails.email = this.applicantDetailsForm.controls['email'].value;
    this.paymentDetails.instId = PAYMENT_CONFIG.WORLDPAY_REDIRECT.INST_ID;
    this.paymentDetails.amount = this.applicationDetails.depositAmount;
    this.paymentDetails.hostWebUrl = window.location.origin + window.location.pathname + '#/worldpay';
    this.paymentDetails.marchentCode = PAYMENT_CONFIG.WORLDPAY_REDIRECT.MERCHANT_CODE;
    this.paymentDetails.applicationId = this.applicationId;

    this.paymentDetails.postcode = this.addressDetailsForm.controls.address['controls'].postcode.value;
    this.paymentDetails.address1 = this.addressDetailsForm.controls.address['controls'].addressLine1.value;
    this.paymentDetails.address2 = this.addressDetailsForm.controls.address['controls'].addressLine2.value;
    this.paymentDetails.town = this.addressDetailsForm.controls.address['controls'].town.value;
    this.paymentDetails.county = this.addressDetailsForm.controls.address['controls'].county.value;
    this.paymentDetails.country = 'GB';
  }

  showWorldpayIframeAction() {
    if (this.PAYMENT_METHOD === PAYMENT_TYPES.WORLDPAY_REDIRECT && !this.PAYMENT_PROD && this.applicationDetails.depositAmount > 500) {
      this.commonService.showMessage('Deposit amount should be less than 500. Above 500 not allowed in TEST Mode', 'Invalid Amount', 'error');
      return;
    }
    this.showWorldpayIframe = true;
  }


  private initBarclayCardPaymentDetails() {
    var barclayResponseUrl = window.location.origin + window.location.pathname + '#/barclaycard';
    var paymentConfigUrl = this.PAYMENT_PROD ? PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.PROD_URL : PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.TEST_URL;
    this.paymentDetails = {};
    this.paymentDetails.actionUrl = paymentConfigUrl;
    this.paymentDetails.acceptUrl = barclayResponseUrl;
    this.paymentDetails.cancelUrl = barclayResponseUrl;
    this.paymentDetails.declineUrl = barclayResponseUrl;
    this.paymentDetails.email = this.applicantDetail?.email;
    this.paymentDetails.exceptionUrl = barclayResponseUrl;
    this.paymentDetails.orderId = 'TBS' + Math.random();
    this.paymentDetails.PSPID = PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.PSPID;
    this.paymentDetails.SHASIGN = this.createSHASIGN();
  }


  private createSHASIGN() {
    const AMOUNT = 'AMOUNT=' + (this.applicationDetails.depositAmount * 100) + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    const CURRENCY = 'CURRENCY=' + 'GBP' + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    const EMAIL = 'EMAIL=' + this.paymentDetails.email + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    const LANGUAGE = 'LANGUAGE=' + 'en_US' + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    const ORDER_ID = 'ORDERID=' + this.paymentDetails.orderId + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    const PSPID = 'PSPID=' + this.paymentDetails.PSPID + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    const ACCEPT_URL = 'ACCEPTURL=' + this.paymentDetails.acceptUrl + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    const CANCEL_URL = 'CANCELURL=' + this.paymentDetails.cancelUrl + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    const DECLINE_URL = 'DECLINEURL=' + this.paymentDetails.declineUrl + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    const EXCEPTION_URL = 'EXCEPTIONURL=' + this.paymentDetails.exceptionUrl + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    const shaSignature = ACCEPT_URL + AMOUNT + CANCEL_URL + CURRENCY + DECLINE_URL + EMAIL + EXCEPTION_URL + LANGUAGE + ORDER_ID + PSPID;
    return CryptoJS.SHA512(shaSignature).toString(CryptoJS.enc.hex).toUpperCase();

  }

  initPaymentConfiguration() {
    switch (this.PAYMENT_METHOD) {
      case PAYMENT_TYPES.WORLDPAY_REDIRECT:
        this.initWorldpayPaymentDetails();
        break;
      case PAYMENT_TYPES.BARCLAYCARD_REDIRECT:
        this.initBarclayCardPaymentDetails();
        break;
      case PAYMENT_TYPES.STRIPE_ELEMENT:
        this.prepareStripeElementData();
        break;
    }
  }

  paymentDone() {
    let paymentResponse;
    switch (this.PAYMENT_METHOD) {
      case PAYMENT_TYPES.WORLDPAY_REDIRECT:
        paymentResponse = this.commonService.getItem('worldpay_response', true);
        this.commonService.removeItem('worldpay_response');
        this.handleWorldpayResponse(paymentResponse);
        break;
      case PAYMENT_TYPES.BARCLAYCARD_REDIRECT:
        paymentResponse = this.commonService.getItem('barclaycard_response', true);
        this.commonService.removeItem('barclaycard_response');
        this.handleBarclaycardResponse(paymentResponse);
        break;
    }
  }

  handleWorldpayResponse(response) {
    this.showWorldpayIframe = false;
    if (response && response.transaction) {
      this.hidePaymentForm = true;
      const transactionId = response.transaction;
      const depositAmountPaid = this.applicationDetails.depositAmount;
      this.processPayment(transactionId, depositAmountPaid);
    } else {
      this.hidePaymentForm = false;
      this.commonService.showMessage('Sorry, your payment has failed.', 'Payment Failed', 'error');
    }
  }

  handleBarclaycardResponse(response) {
    this.showWorldpayIframe = false;
    if (response && response.STATUS === '5') {
      this.hidePaymentForm = true;
      this.processPayment(response.PAYID, this.applicationDetails.depositAmount);
    } else {
      this.initBarclayCardPaymentDetails();
      this.hidePaymentForm = false;
      if (response && response.STATUS === '1') {
      } else if (response && response.STATUS === '0') {
        this.commonService.showMessage('Invalid or incomplete request, please try again.', 'Payment Failed', 'error');
      } else {
        this.commonService.showMessage('Something went wrong on server, please try again.', 'Payment Failed', 'error');
      }
    }
  }



  processPayment(transactionId, depositAmountPaid) {
    this.commonService.showLoader();
    const paymentDetails: any = {};
    paymentDetails.propertyId = this.propertyId;
    paymentDetails.createdById = '';
    paymentDetails.transactionId = transactionId;
    paymentDetails.depositAmountPaid = depositAmountPaid;
    paymentDetails.paidBy = APPLICATION_ENTITIES.AGENT;

    this._tobService.processPayment(paymentDetails, this.applicationId).subscribe((res) => {
      this.commonService.hideLoader();
      this.proposeTenancy(transactionId);
    }, error => {
      this.commonService.hideLoader();
      this.commonService.showMessage('Something went wrong on server, please contact us.', 'Process Payment', 'error');
      this.router.navigate([`../../applications`], { replaceUrl: true, relativeTo: this.route });

    });
  }

  proposeTenancy(transactionId) {
    this.commonService.showLoader();
    const proposeTenancyDetails: any = {};
    proposeTenancyDetails.applicantId = this.applicantId;
    proposeTenancyDetails.applicationId = this.applicationId;
    proposeTenancyDetails.contractType = 1;
    proposeTenancyDetails.startDate = this.applicationDetails.moveInDate;
    proposeTenancyDetails.expiryDate = this.applicationDetails.preferredTenancyEndDate;
    proposeTenancyDetails.transactionId = transactionId;

    this._tobService.proposeTenancy(proposeTenancyDetails, this.propertyId).subscribe((res) => {
      this.commonService.hideLoader();
      this.commonService.showAlert('Tenancy', 'Tenancy has been proposed successfully on the property.').then(function (resp) {
        window.history.back();
      });

    }, error => {
      this.commonService.hideLoader();
      this.commonService.showMessage('Something went wrong on server, please try again.', 'Propose Tenancy', 'error');
      this.router.navigate([`../../applications`], { replaceUrl: true, relativeTo: this.route });
    });
  }

  flowCallbackFunction(result: any) {
    console.log('flow callback', result);
  }

  resultCallbackFunction(result: any) {
    console.log('result callback', result);
  }

  onInternalWorldpaySuccess(event) {
    if (event) {
      this.openPaymentConfirmation();
    }
  }

  async openPaymentConfirmation() {
    const message = '<h1> Congratulations! </h1>' + '<h5>Tenancy has been proposed successfully on the property.</h5>';
    const simpleModal = await this.modalController.create({
      component: SimpleModalPage,
      cssClass: 'tob-modal-container',
      backdropDismiss: false,
      componentProps: {
        data: message,
        heading: 'Tenancy',
        button: 'OK',
      }
    });

    simpleModal.onDidDismiss().then(res => {
      this.router.navigate([`../../applications`], { replaceUrl: true, relativeTo: this.route });
    });
    await simpleModal.present();
  }

  private async setWorldpayInternalData() {
    this.worldPayInternalData.applicationId = this.applicationId;
    this.worldPayInternalData.startDate = this.applicationDetails.moveInDate;
    this.worldPayInternalData.expiryDate = this.applicationDetails.preferredTenancyEndDate;
    this.worldPayInternalData.propertyId = this.propertyId;
    this.worldPayInternalData.entityType = ENTITY_TYPE.LET_APPLICANT;
    this.worldPayInternalData.entityId = this.applicantId;
    this.worldPayInternalData.amount = this.applicationDetails.depositAmount;
  }

  private calRent(currentRent) {
    const rent = parseInt(currentRent);
    if (rent > 0 && this.propertyDetails.rentFrequency > 0) {
      switch (this.propertyDetails.frequencyType) {
        case 3: /**month*/
          const weeklyRent = ((currentRent * (12 / this.propertyDetails.rentFrequency)) / 52);
          const depositAmt = weeklyRent * this.depositAutoCalWeeks;
          const holdingDepAmt = weeklyRent * this.holdingDepAutoCalWeek;
          this.tenancyDetailForm.controls['depositAmount'].setValue(holdingDepAmt.toFixed(2));
          this.tenancyDetailForm.controls['deposit'].setValue(depositAmt.toFixed(2));
          break;
      }
    }
  }


  /** Stripe Payment */
  private prepareStripeElementData() {
    let paymentConfig = this.PAYMENT_PROD ? PAYMENT_CONFIG.STRIPE_ELEMENT.PROD : PAYMENT_CONFIG.STRIPE_ELEMENT.TEST;
    let date = new Date().toLocaleDateString().replace(/\//g, '');
    date = date.slice(0, 5) + date.slice(7);
    this.stripeElementData = {
      intentData: {
        amount: this.applicationDetails?.depositAmount * 100, //https://stripe.com/docs/currencies#zero-decimal
        stripeIntentOptions: {
          currency: paymentConfig.frontEndConfig.stripeIntentOptions.currency,
          payment_method_types: paymentConfig.frontEndConfig.stripeIntentOptions.payment_method_types,
          description: this.propertyDetails?.reference
            + ' - ' + this.addressDetailsForm.controls.address['controls'].addressLine1.value
            + ', ' + this.addressDetailsForm.controls.address['controls'].postcode.value,
          metadata: {
            cartId: `WEB${this.propertyDetails?.landlordBankShortName ? this.propertyDetails?.landlordBankShortName : ''}${date}`,
            applicationId: this.applicationId
          }
        }
      },
      method: environment.PAYMENT_METHOD,
      env: environment.PAYMENT_PROD ? 'PROD' : 'TEST',
      billingAddress: {
        email: this.applicantDetailsForm.controls['email'].value,
        line1: this.addressDetailsForm.controls.address['controls'].addressLine1.value,
        line2: this.addressDetailsForm.controls.address['controls'].addressLine2.value,
        postal_code: this.addressDetailsForm.controls.address['controls'].postcode.value,
        city: this.addressDetailsForm.controls.address['controls'].town.value,
        state: this.addressDetailsForm.controls.address['controls'].county.value
      }
    }
  }

  async enableStripeElementForm() {
    this.showStripeElementForm = true;
  }

  _handleErrorStripeElement(response: any) {
    if (response.type === 'cancelled') {
      this.showStripeElementForm = false;
    }
  }
  stripeIntentResponse: any;
  _handleSuccessStripeElement(response: any) {
    this.stripeElementPaymentDone = true;
    setTimeout(() => {
      this.stripeIntentResponse = response
      this.processPayment(response.id, this.applicationDetails.depositAmount);
    }, 1000);
  }

  _calculateEndDate() {
    const tenancyDetailFormVal = this.tenancyDetailForm.value;
    if (!tenancyDetailFormVal.agreementType && !tenancyDetailFormVal.moveInDate) {
      return;
    }
    const selectedAgreementTypeObj = this.agreementTypesLookup.filter(x => x.agreementTypeId == tenancyDetailFormVal.agreementType)[0];
    let newEndDate;
    let moveInDate = new Date(tenancyDetailFormVal.moveInDate);
    switch (selectedAgreementTypeObj.durationType) {
      case 1:
        newEndDate = new Date(moveInDate.setDate(moveInDate.getDate() + selectedAgreementTypeObj.duration));
        break;
      case 2:
        newEndDate = new Date(moveInDate.setDate(moveInDate.getDate() + selectedAgreementTypeObj.duration * 7));
        break;
      case 3:
        newEndDate = new Date(moveInDate.setMonth(moveInDate.getMonth() + selectedAgreementTypeObj.duration));
        break;
      case 4:
        newEndDate = new Date(moveInDate.setMonth(moveInDate.getMonth() + selectedAgreementTypeObj.duration * 3));
        break;
      case 5:
        newEndDate = new Date(moveInDate.setFullYear(moveInDate.getFullYear() + selectedAgreementTypeObj.duration));
        break;
      case 6:
        console.log('NA');
      default:
        console.log('no default')
    }
    if (selectedAgreementTypeObj.isLessOneDay) {
      newEndDate = new Date(newEndDate.setDate(newEndDate.getDate() - 1));
    }
    this.tenancyDetailForm.controls['preferredTenancyEndDate'].setValue(this.commonService.getFormatedDate(newEndDate));
  }
}
