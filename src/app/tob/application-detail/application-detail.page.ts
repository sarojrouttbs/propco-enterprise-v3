import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PROPCO, APPLICATION_STATUSES, APPLICATION_ACTION_TYPE, ENTITY_TYPE, PAYMENT_TYPES, PAYMENT_CONFIG, APPLICATION_ENTITIES } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { TobService } from '../tob.service';
import { switchMap, debounceTime } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { ModalController } from '@ionic/angular';
import { TermsAndConditionModalPage } from 'src/app/shared/modals/terms-and-condition-modal/terms-and-condition-modal.page';
import { environment } from 'src/environments/environment';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';
import * as CryptoJS from 'crypto-js/crypto-js';

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
  toblookupdata: any;
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
  disableSearchApplicant: boolean = false;
  resultsAvailable: boolean = null;
  isStudentProperty: boolean = false;
  showPostcodeLoader: Boolean = null;
  showAddressLoader: Boolean = null;
  showPayment: boolean = false;
  saveDataLoader: boolean = false;
  addressList: any[];
  guarantorAddressList: any[];
  correspondenceAddressList: any[];
  leadApplicationApplicantId: any;
  selectionType: any;
  titleList = [
    { index: 0, value: 'Mr' },
    { index: 1, value: 'Mrs' },
    { index: 2, value: 'Ms' }
  ];
  maxMoveInDate = this.commonService.getFormatedDate(new Date().setFullYear(new Date().getFullYear() + 5));
  currentDate = this.commonService.getFormatedDate(new Date());
  termsConditionControl: boolean = false;
  termsAndConditionData: any = {};
  applicationStatus: string;

  PAYMENT_METHOD = environment.PAYMENT_METHOD;
  PAYMENT_PROD = environment.PAYMENT_PROD;
  paymentDetails: any = {};
  showWorldpayIframe: boolean = false;
  hidePaymentForm: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private _formBuilder: FormBuilder,
    private _tobService: TobService,
    private router: Router,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('propertyId');
    this.applicationId = this.route.snapshot.paramMap.get('applicationId');
    if (typeof this.applicationId !== 'undefined' && this.applicationId !== null) {
      this.initViewApiCalls();
    }
    else if (typeof this.propertyId !== 'undefined' && this.propertyId !== null) {
      this.initCreateApiCalls();
    }
    this.initForms();
    this.initApiCalls();
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
    if (applicantId && isSearch) {
      let existingApplicant = this.applicationApplicantDetails.filter((occupant) => {
        return (occupant.applicantId === applicantId);
      });
      if (existingApplicant.length) {
        this.commonService.showAlert('Applicant', 'Applicant is already added to the application');
        this.resultsAvailable = false;
        return;
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
        }

      }
    },
      error => {
      })
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
      currentPosition: this.applicantDetail.currentPosition
    });
  }

  resetSearch() {
    this.searchApplicantForm.get('searchApplicant').setValue('');
    this.resultsAvailable = false;
  }

  private searchApplicant(applicantId: string): Observable<any> {
    let response = this._tobService.searchApplicant(applicantId);
    return response;
  }

  private async initApiCalls() {
    this.getLookUpData();
    this.getTobLookupData();
    await this.getPropertyDetails(this.propertyId);
    this.getNoDeposit();
    this.initTermsAndConditionData();
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
    if (this.applicationStatus === 'Accepted') {
      this.currentStepperIndex = 10;
      this.showPayment = true;
      this.initPaymentConfiguration();
    }
    const questionData = await this.getApplicantQuestions();
    this.createQuestionItems(questionData);
    this.getApplicationQuestionsAnswer(this.applicationId);

  }

  /** Submit Application Functionality **/

  async submit() {
    let isValid = await this.checkFormsValidity();
    if (!isValid) {
      this.commonService.showMessage('Please provide complete information.', 'Application Details', 'error');
      return;
    }
    if (!this.termsConditionControl) {
      this.commonService.showMessage('Please review the terms and conditions.', 'Terms & Conditions', 'error');
      return;
    }
    this.saveGuarantorDetails();
    this.onSubmit();
  }

  private checkFormsValidity() {
    return new Promise((resolve, reject) => {
      let valid = false;
      let applicantDetails = this.applicantDetailsForm.valid;
      let bankDetails = this.bankDetailsForm.valid;
      let address = this.addressDetailsForm.valid;
      let tenancyDetails = this.tenancyDetailForm.valid;
      let guarantorDetails = this.guarantorForm.valid;
      if (applicantDetails && tenancyDetails && guarantorDetails && bankDetails && address) {
        valid = true;
      }
      return resolve(valid);
    });
  }

  private async onSubmit() {
    const response = await this.commonService.showConfirm('Application', 'Do you want to submit the application?');
    if (response) {
      this.submitApplication();
    }
  }

  private submitApplication(): void {
    // this.showLoader = true;
    let data: any = {};
    data.submittedBy = ENTITY_TYPE.AGENT;
    data.submittedById = '';
    this._tobService.submitApplication(this.applicationDetails.applicationId, data).subscribe(
      res => {
        this.commonService.showMessage('Your application has been submitted successfully.', 'Application', 'success');
        if (this.isStudentProperty) {
          this.showPayment = true;
          this.currentStepperIndex = 10;
          // this.radioTabModel = 'payment';
        } else {
          this.router.navigate([`tob/${this.propertyId}/applications`], { replaceUrl: true });
        }
        // this.showLoader = false;
      },
      error => {
        // this.showLoader = false;
        const errorMessage = error.error ? error.error.message : error.message;
        this.commonService.showMessage((errorMessage || 'Internal server error') + ', Please contact support.', 'Application', 'error');
      }
    );
  }

  /** Submit Application Functionality **/

  /** Step Change functionality **/
  public onStepChange(event: any): void {
    let nextIndex = event.selectedIndex;
    let previousIndex = event.previouslySelectedIndex;
    if (nextIndex > previousIndex) {
      /*call API only in next step*/
      this.savePreviousStep(event);
      // this.findInvalidControls();
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
    if (this.applicationDetails.isSubmitted) {
      return;
    }
    let previouslySelectedIndex = event.previouslySelectedIndex;
    this.savePreviouslySelectedData(previouslySelectedIndex);

  }

  private savePreviouslySelectedData(index: number) {
    switch (index) {
      case 0:
        if (!this.applicationDetails.isSubmitted) {
          this.saveApplicantsToApplication();
        }
      case 1:
        if (!this.applicationDetails.isSubmitted && this.applicantId) {
          this.saveApplicantDetails();
        }
        break;
      case 2:
        if (!this.applicationDetails.isSubmitted && this.applicantId) {
          this.saveAddressDetails();
        }
        break;
      case 3:
        if (!this.applicationDetails.isSubmitted && this.applicantId) {
          this.saveBankDetails();
        }
        break;
      case 4:
        if (!this.applicationDetails.isSubmitted) {
          this.saveApplicationQuestions();
        }
        break;
      case 5:
        if (!this.applicationDetails.isSubmitted) {
          this.saveTenancyDetail();
        }
        break;
      case 8:
        if (!this.applicationDetails.isSubmitted) {
          this.saveGuarantorDetails();
        }
        break;
      case 10:
        this.initPaymentConfiguration();
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
    let title = 'Save for later';
    let message = 'Your application has been saved. Please complete your application within 14 days in order to guarantee a reservation.'
    this.commonService.showAlert(title, message, '').then(res => {
      if (res) {
        this.router.navigate([`tob/${this.propertyId}/applications`], { replaceUrl: true });
      }
    })
  }

  private saveApplicantsToApplication() {
    let apiObservableArray = [];
    this.occupantForm.controls['coApplicants'].value.map((element) => {
      if (!element.applicationApplicantId && element.isAdded && !element.isDeleted) {
        if (!element.applicantId) {
          let isLeadApplicant: boolean = element.isLead;
          apiObservableArray.push(this._tobService.addApplicantToApplication(this.applicationId, element, isLeadApplicant));
        }
        if (element.applicantId) {
          let isLeadApplicant: boolean = element.isLead;
          apiObservableArray.push(this._tobService.linkApplicantToApplication(this.applicationId, element, element.applicantId, isLeadApplicant));
        }
      }
    });

    setTimeout(() => {
      forkJoin(apiObservableArray).subscribe(async (response: any[]) => {
        this.occupantForm.reset(this.occupantForm.value);
        const applicants = await this.getApplicationApplicants(this.applicationId) as ApplicationModels.ICoApplicants;
        await this.setApplicationApplicants(applicants);
        await this.setLeadApplicantDetails();
        if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
          this.onSave();
        }
      }, error => {
        this.occupantForm.reset(this.occupantForm.value);
      });
    }, 1000)
  }

  onLeadSelection(item: FormGroup) {
    this.commonService.showConfirm('Lead Applicant', 'Are you sure, you want to make this applicant to lead applicant?', '', 'YES', 'NO').then(response => {
      if (response && item.controls['applicationApplicantId'].value) {
        let updateLeadData = {
          modifiedById: '',
          modifiedBy: ENTITY_TYPE.AGENT
        };
        this._tobService.updateLead(updateLeadData, this.applicationId, item.controls['applicationApplicantId'].value).subscribe(async (response) => {
          const applicants = await this.getApplicationApplicants(this.applicationId) as ApplicationModels.ICoApplicants;
          await this.setApplicationApplicants(applicants);
          await this.setLeadApplicantDetails();
        })
      }
      else {
        item.controls['isLead'].setValue(false);
      }
    })
  }

  private async getApplicantCoApplicants(applicantId: string) {
    this._tobService.getApplicantCoApplicants(applicantId).subscribe(response => {
      if (response && response.data) {
        let finalData = this.occupantForm.get("coApplicants").value;
        response.data.forEach((item: any) => {
          item.isLead = false;
          finalData.push(item)
        });
        (this.occupantForm.get("coApplicants") as FormArray)['controls'].splice(0);
        this.updateOccupantForm(finalData)
      }
    })
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

  private setApplicationDetails(res: ApplicationModels.IApplicationResponse) {
    return new Promise((resolve, reject) => {
      this.applicationDetails = res;
      this.applicationDetails.applicationClauses = res.applicationClauses ? res.applicationClauses : []
      this.applicationDetails.applicationRestrictions = res.applicationRestrictions ? res.applicationRestrictions : [];
      this.applicationStatus = this.commonService.getLookupValue(this.applicationDetails.status, this.applicationStatuses);
      // if (this.applicationStatus === 'Accepted') {
      //   this.currentStepperIndex = 10;
      //   this.showPayment = true;
      //   this.initPaymentConfiguration();
      // }
      this.applicationDetails.applicationRestrictions = this.applicationDetails.applicationRestrictions.filter(restrict => restrict.value);
      this.applicationDetails.applicationRestrictions.map(
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
          resolve(res);
        },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private setApplicationApplicants(res: any) {
    return new Promise((resolve, reject) => {
      (this.occupantForm.get("coApplicants") as FormArray)['controls'].splice(0);
      this.applicationApplicantDetails = (res && res.data) ? res.data : [];
      let leadApplicantDetails = this.applicationApplicantDetails.filter((occupant) => occupant.isLead);
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
      if (this.applicationDetails.leadApplicantItemtype === "M") {
        this.getTenantBankDetails(this.applicantId);
        this.getTenantGuarantors(this.applicantId);
      } else {
        this.getApplicantBankDetails(this.applicantId);
        this.getApplicantGuarantors(this.applicantId);
      }
    }
  }

  private async createApplication() {
    let requestObj: any = {};
    requestObj.createdBy = ENTITY_TYPE.AGENT;
    requestObj.propertyId = this.propertyId;
    requestObj.status = APPLICATION_STATUSES.NEW;
    requestObj.rent = this.propertyDetails.advertisementRent;
    requestObj.applicationRestrictions = this.propertyRestrictions;
    requestObj.applicationClauses = this.propertyClauses;
    this._tobService.createApplication(requestObj).subscribe(
      res => {
        this.router.navigate([`tob/${this.propertyId}/application/${res.applicationId}`], { replaceUrl: true });
      },
      error => {
      }
    );
  }

  private getPropertyDetails(propertyId: string) {
    return new Promise((resolve, reject) => {
      this._tobService.getPropertyDetails(propertyId).subscribe(
        res => {
          if (res) {
            this.propertyDetails = res.data;
            const propertyType = this.commonService.getLookupValue(this.propertyDetails.rentCategory, this.rentCategories);
            if (propertyType === 'Student') {
              this.isStudentProperty = true;
              this.isStudentGuarantor();
            }
            this.propertyDetails.propertyImageUrl = this.commonService.getHeadMediaUrl(res.data.media || []);
            resolve(true);
          }
        },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private getNoDeposit() {
    this._tobService.getNoDepositScheme().subscribe(res => {
      if (res) {
        this.propertyDetails.noDepositScheme = res.noDepositScheme;
      }
    }, (error) => {
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
          this.propertyRestrictions.map(restrict => restrict.restrictionName = this.commonService.camelize(restrict.key.replace(/_/g, ' ')));
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
    }, error => {
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
      }, error => {
      });
    }
  }

  private getTobLookupData() {
    this.toblookupdata = this.commonService.getItem(PROPCO.TOB_LOOKUP_DATA, true);
    if (this.toblookupdata) {
      this.setTobLookupData();
    } else {
      this.commonService.getTobLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.TOB_LOOKUP_DATA, data);
        this.setTobLookupData();
      }, error => {
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
    this.toblookupdata = this.commonService.getItem(PROPCO.TOB_LOOKUP_DATA, true);
    this.applicationStatuses = this.toblookupdata.applicationStatuses;
  }

  private initSearchForm(): void {
    this.searchApplicantForm = this._formBuilder.group({
      searchApplicant: ''
    });
  }

  private initApplicantDetailsForm(): void {
    this.applicantDetailsForm = this._formBuilder.group({
      title: [''],
      forename: ['', [ValidationService.alphabetValidator]],
      surname: ['', [ValidationService.alphabetValidator]],
      email: ['', [ValidationService.emailValidator]],
      mobile: ['', [ValidationService.numberValidator]],
      dateOfBirth: ['', Validators.required],
      occupation: [''],
      hasPets: false,
      petsInfo: ['', { disabled: false }],
      guarantor: false,
      guarantorType: ['', { disabled: false }],
      currentPosition: ''
    });
  }

  private setRequired() {
    return [Validators.required];
  }

  async onCancel() {
    const isCancel: boolean = await this.commonService.showConfirm('Cancel', 'Are you sure, you want to cancel this operation?', '', 'Yes', 'No') as boolean;
    if (isCancel) {
      this.router.navigate([`tob/${this.propertyId}/applications`], { replaceUrl: true });
    }
  }

  /** Occupants Functionality **/

  private initOccupantForm(): void {
    this.occupantForm = this._formBuilder.group({
      coApplicants: this._formBuilder.array([])
    });
  }

  private createItem(): void {
    this.occupantFormArray.push(this._formBuilder.group({
      surname: ['', [Validators.required, ValidationService.alphabetValidator]],
      forename: ['', [Validators.required, ValidationService.alphabetValidator]],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      mobile: ['', [Validators.required, ValidationService.numberValidator]],
      applicationApplicantId: null,
      isLead: false,
      createdById: null,
      createdBy: ENTITY_TYPE.AGENT,
      isAdded: false,
      isDeleted: false,
      title: '',
      applicantId: ''
    }
    ));
  }

  get occupantFormArray() {
    return this.occupantForm.get('coApplicants') as FormArray;
  }

  addApplicant(control: FormControl, index: number) {
    this.occupantFormArray.push(this._formBuilder.group({
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
      applicantId: ''
    }
    ))
    this.occupantFormArray.removeAt(index);
    this.createItem();
  }

  private addSearchApplicant(response: any, index: number) {
    this.occupantFormArray.push(this._formBuilder.group({
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
      applicantId: response.applicantId
    }
    ))
    this.occupantFormArray.removeAt(index);
    this.createItem();
  }

  removeCoApplicant(item: FormGroup) {
    this.commonService.showConfirm('Remove Applicant', 'Are you sure, you want to remove this applicant ?', '', 'YES', 'NO').then(response => {
      if (response) {
        if (item.controls['applicationApplicantId'].value) {
          this._tobService.deleteApplicationApplicant(this.applicationId, item.controls['applicationApplicantId'].value, { "deletedBy": "AGENT" }).subscribe(async (response) => {
            const applicants = await this.getApplicationApplicants(this.applicationId) as ApplicationModels.ICoApplicants;
            await this.setApplicationApplicants(applicants);
          })
        }
        else {
          item.controls['isDeleted'].setValue(true);
        }
      }
    })
  }

  private updateOccupantForm(occupantsList: any[]) {
    if (Array.isArray(occupantsList) && occupantsList.length > 0) {
      let occupantsArray = this.occupantFormArray;
      occupantsList.forEach(element => {
        if (element.applicantId) {
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
            applicantId: element.applicantId
          }));
        }
      });
    }
    this.createItem();
  }

  checkFormDirty(form: any) {
    let dirtyForm = this.commonService.getDirtyValues(form);
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
        postcode: ['', Validators.required],
        addressdetails: [''],
        addressLine1: ['', Validators.required],
        addressLine2: '',
        locality: '',
        town: ['', Validators.required],
        county: '',
        country: ''
      }),
      correspondenceAddress: this._formBuilder.group({
        postcode: '',
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
        postcode.value ? (this.showPostcodeLoader = true) : '';
        break;
      case 'correspondence-address':
        postcode = this.addressDetailsForm.controls.correspondenceAddress['controls'].postcode;
        postcode.value ? (this.showAddressLoader = true) : '';
        break;
      case 'guarantor':
        postcode = this.guarantorForm.controls.address['controls'].postcode;
        postcode.value ? (this.showPostcodeLoader = true) : '';
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
      this.correspondenceAddressList = [];
    }
  }

  getPostcodeAddress(addressType: string, postcode: string) {
    this.commonService.getPostcodeAddressList(postcode).subscribe(
      res => {
        this.addressList = [];
        this.guarantorAddressList = [];
        this.correspondenceAddressList = [];
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
              this.correspondenceAddressList = res.data;
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
        this.correspondenceAddressList = [];
        const data: any = {};
        data.title = 'Postcode Lookup';
        data.message = error.error ? error.error.message : error.message;
        this.commonService.showMessage(data.message, data.title, 'error');
      }
    );
  }

  getAddressDetails(addressId: string, addressType: string) {
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
        this.addressDetailsForm.controls.correspondenceAddress['controls'].addressLine1.setValue(res.line1);
        this.addressDetailsForm.controls.correspondenceAddress['controls'].addressLine2.setValue(res.line2);
        this.addressDetailsForm.controls.correspondenceAddress['controls'].locality.setValue(res.line4);
        this.addressDetailsForm.controls.correspondenceAddress['controls'].town.setValue(res.line5);
        this.addressDetailsForm.controls.correspondenceAddress['controls'].county.setValue(res.provinceName);
        this.addressDetailsForm.controls.correspondenceAddress['controls'].country.setValue(res.countryName);
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
      moveInDate: ['', Validators.required],
      preferredTenancyEndDate: ['', Validators.required],
      rentDueDay: ['', [Validators.required, Validators.max(31), Validators.min(1)]],
      numberOfAdults: ['', Validators.required],
      numberOfChildren: ['', Validators.required],
      hasSameHouseholdApplicants: [false, Validators.required],
      numberOfHouseHolds: [{ value: '', disabled: false }, Validators.required],
      isNoDepositScheme: ['']
    }, {
      validator: Validators.compose([
        ValidationService.dateLessThan('moveInDate', 'preferredTenancyEndDate')
      ])
    }
    );
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
    this.applicationDetails.moveInDate = this.commonService.getFormatedDate(this.tenancyDetailForm.value.moveInDate);
    this.applicationDetails.rentingTime = this.tenancyDetailForm.value.rentingTime;
    this.applicationDetails.preferredTenancyEndDate = this.commonService.getFormatedDate(this.tenancyDetailForm.value.preferredTenancyEndDate);
    this.applicationDetails.rentDueDay = this.tenancyDetailForm.value.rentDueDay;
    this.applicationDetails.numberOfAdults = this.tenancyDetailForm.value.numberOfAdults;
    this.applicationDetails.numberOfChildren = this.tenancyDetailForm.value.numberOfChildren;
    // this.applicationDetails.noOfOccupants = this.tenancyDetailForm.value.noOfOccupants;
    this.applicationDetails.hasSameHouseholdApplicants = this.tenancyDetailForm.value.hasSameHouseholdApplicants;
    this.applicationDetails.numberOfHouseHolds = this.tenancyDetailForm.value.numberOfHouseHolds;
    this.applicationDetails.isNoDepositScheme = this.tenancyDetailForm.value.isNoDepositScheme;

    if (this.checkFormDirty(this.tenancyDetailForm)) {
      this.updateApplicationDetails();
    }
  }

  private updateApplicationDetails() {
    // if (this.selectionType == 'saveForLater') {
    //   this.saveDataLoader = true;
    // }
    let requestObj = JSON.parse(JSON.stringify(this.applicationDetails));
    requestObj.applicationRestrictions.map(restrict => { delete restrict.restrictionName; }
    );
    if (requestObj.numberOfAdults) {
      requestObj.hasSameHouseholdApplicants = true;
      requestObj.numberOfHouseHolds = 1;
    }
    if (requestObj.hasSameHouseholdApplicants) {
      requestObj.numberOfHouseHolds = 1;
    }
    requestObj.isTermsAndConditionsAccepted = this.termsConditionControl;
    requestObj.rent = requestObj.rent ? requestObj.rent : this.propertyDetails.advertisementRent;
    requestObj.depositAmount = requestObj.depositAmount ? requestObj.depositAmount : this.propertyDetails.holdingDeposit;
    this._tobService.updateApplicationDetails(requestObj, this.applicationId).subscribe(
      res => {
        // this.saveDataLoader = false;
        if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
          this.onSave();
        }
        this.applicationDetails.depositAmount = requestObj.depositAmount ? requestObj.depositAmount : this.propertyDetails.holdingDeposit;
        this.tenancyDetailForm.reset(this.tenancyDetailForm.value);
      },
      error => {
        // this.saveDataLoader = false;
      }
    );
  }

  /** Application Question Functionality **/

  initApplicantQuestionForm() {
    this.applicantQuestionForm = this._formBuilder.group({
      questions: this._formBuilder.array([])
    });
  }

  get questionFormArray() {
    return this.applicantQuestionForm.get('questions') as FormArray;
  }

  private async getApplicantQuestions() {
    return new Promise((resolve, reject) => {
      this._tobService.getApplicantQuestions().subscribe(res => {
        const response = (res && res.data) ? res.data : undefined;
        resolve(response)
      }, error => {
        reject(undefined)
      });
    });

  }

  private getApplicationQuestionsAnswer(applicationId: string) {
    this._tobService.getApplicationQuestionsAnswer(applicationId).subscribe(res => {
      if (res && res.count) {
        this.questionFormArray.controls.forEach(element => {
          let item = res.data.find(answer => answer.questionId === element.value.applicantQuestionId);
          element.patchValue({
            toggle: item ? item.toggle : null,
            answer: item ? item.answer : null,
            answerById: item ? item.answerById : null,
            applicationQuestionId: item ? item.applicationQuestionId : null,
          });
        });
      }
    }, error => {
    });
  }

  private createQuestionItems(questionArray: any) {
    const questionFormArray = this.questionFormArray;
    questionArray.forEach(element => {
      let questionForm = this._formBuilder.group({
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

  private saveApplicationQuestions() {
    let apiObservableArray = [];
    let applicantQuestions = this.applicantQuestionForm.controls.questions.value;
    if (this.checkFormDirty(this.applicantQuestionForm)) {
      // if (this.selectionType == 'saveForLater') {
      //   this.saveDataLoader = true;
      // }
      applicantQuestions.forEach(question => {
        let questionDetails: any = {};
        questionDetails.toggle = question.toggle;
        questionDetails.answer = question.type === 'BOOLEAN' ? question.toggle : question.answer;
        questionDetails.answerById = question.answerById;
        apiObservableArray.push(this._tobService.updateApplicationQuestionAnswer(this.applicationId, question.applicationQuestionId, questionDetails));
      });
    }
    forkJoin(apiObservableArray).subscribe(() => {
      // this.saveDataLoader = false;
      this.applicantQuestionForm.reset(this.applicantQuestionForm.value);
      if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
        this.onSave();
      }
    }, error => {
    });
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
      this.addressDetailsForm.patchValue({
        correspondenceAddress: {
          postcode: this.applicantDetail.correspondenceAddress.postcode,
          addressLine1: this.applicantDetail.correspondenceAddress.addressLine1,
          addressLine2: this.applicantDetail.correspondenceAddress.addressLine2,
          town: this.applicantDetail.correspondenceAddress.town,
          county: this.applicantDetail.correspondenceAddress.county,
          country: this.applicantDetail.correspondenceAddress.country,
          locality: this.applicantDetail.address.locality,
          addressdetails: ''
        }
      });
    }
  }

  private saveApplicantDetails() {
    let applicantDetails = this.applicantDetailsForm.value;
    applicantDetails.dateOfBirth = this.commonService.getFormatedDate(applicantDetails.dateOfBirth);
    if (this.checkFormDirty(this.applicantDetailsForm)) {
      this.updateApplicantDetails();
    }
  }

  private saveAddressDetails() {
    let applicantDetails = this.applicantDetailsForm.value;
    applicantDetails.address = this.addressDetailsForm.value.address;
    applicantDetails.dateOfBirth = this.commonService.getFormatedDate(applicantDetails.dateOfBirth);
    applicantDetails.correspondenceAddress = this.addressDetailsForm.value.correspondenceAddress;
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
      this._tobService.getTenantBankDetails(applicantId).subscribe(
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

  private patchBankDetails(bankDetails: any) {
    this.bankDetailsForm.patchValue({
      bankDetails: {
        bankName: bankDetails.bankName ? bankDetails.bankName : "",
        sortcode: bankDetails.sortcode ? bankDetails.sortcode : "",
        accountNumber: bankDetails.accountNumber ? bankDetails.accountNumber : "",
        accountName: bankDetails.accountName ? bankDetails.accountName : "",
      }
    });
  }

  private saveBankDetails() {
    let bankDetails = this.bankDetailsForm.value.bankDetails;
    if (this.checkFormDirty(this.bankDetailsForm)) {
      this.updateBankDetails(bankDetails);
    }
  }

  private updateBankDetails(bankDetails: any) {
    // if (this.selectionType == 'saveForLater') {
    //   this.saveDataLoader = true;
    // }
    this._tobService.updateBankDetails(this.applicantId, bankDetails).subscribe(
      res => {
        // this.saveDataLoader = false;
        // if (this.selectionType == 'saveForLater') {
        //   this.onSave();
        // }
        this.bankDetailsForm.reset(this.bankDetailsForm.value);
      },
      error => {
        // this.saveDataLoader = false;
      }
    );
  }

  setTenancyDetails(details: any) {
    this.tenancyDetailForm.patchValue({
      moveInDate: details.moveInDate,
      preferredTenancyEndDate: details.preferredTenancyEndDate,
      rentDueDay: details.rentDueDay,
      numberOfAdults: details.numberOfAdults,
      numberOfChildren: details.numberOfChildren,
      hasSameHouseholdApplicants: details.hasSameHouseholdApplicants,
      numberOfHouseHolds: details.numberOfHouseHolds,
      isNoDepositScheme: details.isNoDepositScheme
    });
  }

  /** Guarantor Details Functionality **/

  private initGuarantorForm(): void {
    this.guarantorForm = this._formBuilder.group({
      guarantorId: [''],
      title: ['', [ValidationService.speacialValidator]],
      forename: ['', [ValidationService.alphabetValidator]],
      surname: ['', [ValidationService.alphabetValidator]],
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
    this.guarantorForm.controls.email.setValidators(Validators.required);
    this.guarantorForm.controls.mobile.setValidators(Validators.required);
    this.guarantorForm.controls.address['controls'].postcode.setValidators(Validators.required);
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

  private getApplicantGuarantors(applicantId: string): void {
    this._tobService.getApplicantGuarantors(applicantId).subscribe(
      res => {
        if (res && res.data) {
          this.setGuarantorDetails(res.data[0]);
        }
      },
      error => {
      }
    );
  }

  private getTenantGuarantors(applicantId: string): void {
    this._tobService.getTenantGuarantors(applicantId).subscribe(
      res => {
        if (res && res.data) {
          this.setGuarantorDetails(res.data[0]);
        }
      },
      error => {
      }
    );
  }

  private setGuarantorDetails(details: any): void {
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
    // if (this.selectionType == 'saveForLater') {
    //   this.saveDataLoader = true;
    // }
    guarantorDetails = this.commonService.replaceEmptyStringWithNull(guarantorDetails);
    let guarantorId = guarantorDetails.guarantorId;
    delete guarantorDetails.guarantorId;
    this._tobService.updateGuarantorDetails(guarantorDetails, guarantorId).subscribe(
      res => {
        // this.saveDataLoader = false;
        if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
          this.onSave();
        }
        this.guarantorForm.reset(this.guarantorForm.value);
      },
      error => {
        // this.saveDataLoader = false;
      }
    );
  }

  private createGuarantor(guarantorDetails: any): void {
    // if (this.selectionType == 'saveForLater') {
    //   this.saveDataLoader = true;
    // }
    guarantorDetails = this.commonService.replaceEmptyStringWithNull(guarantorDetails);
    this._tobService.createGuarantor(guarantorDetails, this.applicantId).subscribe(
      res => {
        // this.saveDataLoader = false;
        if (this.selectionType === APPLICATION_ACTION_TYPE.SAVE_FOR_LATER) {
          this.onSave();
        }
        this.guarantorForm.reset(this.guarantorForm.value);
        if (res) {
          this.guarantorForm.controls['guarantorId'].setValue(res.guarantorId);
        }
      },
      error => {
        // this.saveDataLoader = false;
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
      }, error => { });
    }
  }

  private setTermsAndConditionData() {
    this.termsAndConditionData = this.commonService.getItem(PROPCO.TERMS_AND_CONDITIONS, true);
  }

  async openTermsAndConditionModal() {
    const termsAndCondition = this.termsAndConditionData?.application?.termsAndCondition;
    const modal = await this.modalController.create({
      component: TermsAndConditionModalPage,
      cssClass: 'modal-container modal-width',
      componentProps: {
        data: termsAndCondition,
        heading: 'Terms and Conditions'
      },
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
      if (!this.termsConditionControl) {
        this.termsConditionControl = res.data.accepted;
      }
    });
    await modal.present();
  }

  async onTermsModelChanged(event) {
    if (!this.applicationDetails.isTermsAndConditionsAccepted) {
      await this.updateApplicationDetails();
      this.applicationDetails.isTermsAndConditionsAccepted = this.termsConditionControl
    }
  }

  /** Terms and Conditions Functionality **/
  private initWorldpayPaymentDetails() {
    var orderCode = 'PROPCOTESTM1TBS' + Math.random();
    this.paymentDetails = {};
    var paymentConfigUrl = this.PAYMENT_PROD ? PAYMENT_CONFIG.WORLDPAY_REDIRECT.PROD_URL: PAYMENT_CONFIG.WORLDPAY_REDIRECT.TEST_URL;
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
    var paymentConfigUrl = this.PAYMENT_PROD ? PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.PROD_URL: PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.TEST_URL;
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
    // console.log('Payment Details', this.paymentDetails);
}


  private createSHASIGN() {
    var AMOUNT = 'AMOUNT=' + (this.applicationDetails.depositAmount * 100) + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    var CURRENCY = 'CURRENCY=' + 'GBP' + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    var EMAIL = 'EMAIL=' + this.paymentDetails.email + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    var LANGUAGE = 'LANGUAGE=' + 'en_US' + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    var ORDER_ID = 'ORDERID=' + this.paymentDetails.orderId + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    var PSPID = 'PSPID=' + this.paymentDetails.PSPID + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    var ACCEPT_URL = 'ACCEPTURL=' + this.paymentDetails.acceptUrl + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    var CANCEL_URL = 'CANCELURL=' + this.paymentDetails.cancelUrl + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    var DECLINE_URL = 'DECLINEURL=' + this.paymentDetails.declineUrl + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    var EXCEPTION_URL = 'EXCEPTIONURL=' + this.paymentDetails.exceptionUrl + PAYMENT_CONFIG.BARCLAYCARD_REDIRECT.SHA_IN_PASS;
    var shaSignature = ACCEPT_URL + AMOUNT + CANCEL_URL + CURRENCY + DECLINE_URL + EMAIL + EXCEPTION_URL + LANGUAGE + ORDER_ID + PSPID;
    // console.log('shaSignature', shaSignature);
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
    }
  }

  paymentDone() {
    let paymentResponse;
    switch (this.PAYMENT_METHOD) {
      case PAYMENT_TYPES.WORLDPAY_REDIRECT:
        paymentResponse = this.commonService.getItem('worldpay_response', true);
        this.commonService.removeItem('worldpay_response');
        //this.libraryObject.destroy();
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
      // this.showConfirmation = true;
      // this.radioTabModel = 'confirmation';
      let transactionId = response.transaction;
      let depositAmountPaid = this.applicationDetails.depositAmount;
      this.processPayment(transactionId, depositAmountPaid);
    } else {
      this.hidePaymentForm = false;
      this.commonService.showMessage('Sorry, your payment has failed.', 'Payment Failed', 'error');
    }
  }

  handleBarclaycardResponse(response) {
    this.showWorldpayIframe = false;
    if (response && response.STATUS == '5') {
      this.hidePaymentForm = true;
      // this.showConfirmation = true;
      // this.radioTabModel = 'confirmation';
      this.processPayment(response.PAYID, this.applicationDetails.depositAmount);
    } else {
      this.initBarclayCardPaymentDetails();
      this.hidePaymentForm = false;
      if (response && response.STATUS == '1') {
        // this.commonService.showMessage('Payment cancelled', 'Barclay Card', 'error');
      }
      else if (response && response.STATUS == '0') {
        this.commonService.showMessage('Invalid or incomplete request, please try again.', 'Payment Failed', 'error');
      }
      else {
        this.commonService.showMessage('Something went wrong on server, please try again.', 'Payment Failed', 'error');
      }
    }
  }


  processPayment(transactionId, depositAmountPaid) {
    this.commonService.showLoader();
    let paymentDetails: any = {};
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
      // this.router.navigate(['applicant/applications'], { replaceUrl: true });
      this.router.navigate([`tob/${this.propertyId}/applications`], { replaceUrl: true });
    });
  }

  proposeTenancy(transactionId) {
    this.commonService.showLoader();
    const proposeTenancyDetails: any = {};
    proposeTenancyDetails.applicationId = this.applicationId;
    proposeTenancyDetails.contractType = 1;
    proposeTenancyDetails.startDate = this.applicationDetails.moveInDate;
    proposeTenancyDetails.expiryDate = this.applicationDetails.preferredTenancyEndDate;
    proposeTenancyDetails.transactionId = transactionId;

    this._tobService.proposeTenancy(proposeTenancyDetails, this.propertyId).subscribe((res) => {
      this.commonService.hideLoader();
      this.openPaymentConfirmation();
    }, error => {
      this.commonService.hideLoader();
      this.commonService.showMessage('Something went wrong on server, please try again.', 'Propose Tenancy', 'error');
      this.router.navigate([`tob/${this.propertyId}/applications`], { replaceUrl: true });
    });
  }

  flowCallbackFunction(result: any) {
    console.log('flow callback', result);
  }

  resultCallbackFunction(result: any) {
    console.log('result callback', result);
  }

  async openPaymentConfirmation() {
    // this.refreshedTenantDetail = await this.getNewTenantWebToken();
    let message = '<h1> Congratulations! </h1>' + '<h5>Your payment has been completed successfully and property has been reserved.</h5>' + '<p>Now you have been converted into tenant. You will be redirected to tenant dashboard.</p>';
    const simplaModal = await this.modalController.create({
      component: SimpleModalPage,
      backdropDismiss: false,
      componentProps: {
        data: message,
        heading: 'Successful Payment',
        button: 'Ok',
      }
    });

    simplaModal.onDidDismiss().then(res => {
      // this.redirectToTenantPage();
      // this.commonService.logout();
      // this.document.location.href = environment.HOST_WEBURL;
    });
    await simplaModal.present();
  }

}