import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ENTITY_TYPE,
  OFFER_STATUSES,
  PROPCO,
  DEFAULTS,
  DATE_FORMAT,
  SYSTEM_OPTIONS,
} from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { TobService } from '../tob.service';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { NegotiateModalPage } from 'src/app/shared/modals/negotiate-modal/negotiate-modal.page';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.page.html',
  styleUrls: [
    '../common-css/offer-application-detail.scss',
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class OfferDetailPage implements OnInit {
  lookupdata: any;
  toblookupdata: any;
  letDurations: OfferModels.ILookupResponse[];
  howLong = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30,
  ];
  occupants = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  childrens = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  tenantCurrentPositionTypes: OfferModels.ILookupResponse[];
  applicantGuarantorTypes: OfferModels.ILookupResponse[];
  offerStatuses: OfferModels.ILookupResponse[];
  currentStepperIndex = 0;
  makeAnOfferForm: FormGroup;
  confirmationForm: FormGroup;
  propertyId: any;
  offerId: any;
  propertyDetails: any;
  propertyClauses;
  propertyRestrictions;
  negotiatableClauses;
  negotiatableRestrictions;
  searchApplicantForm: FormGroup;
  applicantList: Observable<OfferModels.IApplicantLisResponse>;
  applicantDetail: OfferModels.IApplicantDetails;
  disableSearchApplicant = false;
  applicantId: string;
  resultsAvailable = null;
  rentFrequencyTypes: OfferModels.ILookupResponse[];
  offerDetails: OfferModels.IOfferResponse;
  isTobPropertyCardReady = false;
  isApplicantDetailsAvailable = false;
  isOffersDetailsAvailable = false;
  DEFAULTS = DEFAULTS;
  updatedFormValues: any = [];
  DATE_FORMAT = DATE_FORMAT;
  applicantConfirmedDateInput = true;
  landlordConfirmedDateInput = true;
  webImageUrl: string;
  tenantRelationShipsList;
  employmentTypeList;
  propertyType;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private tobService: TobService,
    private modalController: ModalController,
    private router: Router
  ) { }

  ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('propertyId');
    if (!this.propertyId) {
      this.propertyId =
        this.route.snapshot.parent.parent.paramMap.get('propertyId');
    }

    this.offerId = this.route.snapshot.paramMap.get('offerId');
    if (typeof this.offerId !== 'undefined' && this.offerId != null) {
      this.initViewApiCalls();
    } else if (
      typeof this.propertyId !== 'undefined' &&
      this.propertyId != null
    ) {
      this.initCreateApiCalls();
    }
    this.initForms();
  }

  onSearch(event: any) {
    const searchString = event.target.value;
    if (searchString.length > 2) {
      this.resultsAvailable = true;
    } else {
      this.resultsAvailable = false;
    }
    this.applicantList = this.searchApplicantForm
      .get('searchApplicant')
      .valueChanges.pipe(
        debounceTime(300),
        switchMap((value: string) =>
          value && value.length > 2
            ? this.searchApplicant(value)
            : new Observable()
        )
      );
  }

  async getApplicantDetails(applicantId: string) {
    this.applicantId = applicantId;
    this.tobService.getApplicantDetails(applicantId).subscribe(
      (res) => {
        if (res) {
          this.applicantDetail = res;
          this.isApplicantDetailsAvailable = true;
          this.disableSearchApplicant = true;
          this.resultsAvailable = false;
          this.searchApplicantForm.get('searchApplicant').setValue('');
          this.patchApplicantDetail();
          this.isEnable('guarantor');
          this.isEnable('pets');
        }
      });
  }

  private patchApplicantDetail() {
    this.makeAnOfferForm.patchValue({
      moveInDate: this.applicantDetail.moveInDate,
      rentingTime: this.applicantDetail.rentingTime,
      numberOfAdults: this.applicantDetail.numberOfAdults
        ? this.applicantDetail.numberOfAdults
        : 1,
      numberOfChildren: this.applicantDetail.numberOfChildren
        ? this.applicantDetail.numberOfChildren
        : 0,
      occupation: this.applicantDetail.occupation,
      hasGuarantor: this.applicantDetail.guarantorType ? true : false,
      guarantorType: this.applicantDetail.guarantorType,
      hasPets: this.applicantDetail.petsInfo ? true : false,
      petsInfo: this.applicantDetail.petsInfo,
      currentPosition: this.applicantDetail.currentPosition,
      employmentType: this.applicantDetail.employmentType,
      annualIncome: this.applicantDetail.annualIncome
    });
  }

  async deleteApplicant() {
    const isAgree: boolean = (await this.commonService.showConfirm(
      'Delete Applicant',
      'Are you sure, you want to remove this applicant ?',
      '',
      'Yes',
      'No'
    )) as boolean;
    if (isAgree) {
      this.applicantDetail = null;
      this.searchApplicantForm.get('searchApplicant').setValue('');
      this.disableSearchApplicant = false;
    }
  }

  resetSearch() {
    this.searchApplicantForm.get('searchApplicant').setValue('');
    this.resultsAvailable = false;
  }

  private searchApplicant(applicantId: string): Observable<any> {
    return this.tobService.searchApplicant(applicantId);
  }

  private initForms() {
    this.initSearchForm();
    this.initMakeAnOfferForm();
    this.initConfirmationForm();
  }

  private async initCreateApiCalls() {
    this.getLookUpData();
    this.getTobLookupData();
    let tmpImageObj: any = await this.getSystemOptions(SYSTEM_OPTIONS.WEB_IMAGE_URL);
    this.webImageUrl = tmpImageObj ? tmpImageObj.WEB_IMAGE_URL : '';
    this.getPropertyDetails(this.propertyId);
    this.getPropertyClauses(this.propertyId);
    this.getPropertyRestrictions(this.propertyId);
    this.isOffersDetailsAvailable = true;
    this.isApplicantDetailsAvailable = true;
  }

  async initViewApiCalls() {
    this.getLookUpData();
    this.getTobLookupData();
    let tmpImageObj: any = await this.getSystemOptions(SYSTEM_OPTIONS.WEB_IMAGE_URL);
    this.webImageUrl = tmpImageObj ? tmpImageObj.WEB_IMAGE_URL : '';
    await this.getOfferDetails(this.offerId);
    await this.getPropertyDetails(this.offerDetails.propertyId);
    await this.getApplicantDetails(this.offerDetails.applicantId);
  }

  private async getOfferDetails(offerId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.tobService.getOfferDetails(offerId).subscribe(
        (res) => {
          this.offerDetails = res;
          if (this.offerDetails) {
            this.patchOfferDetails();
            this.getOfferStatusList(this.offerDetails.status);
          }
          resolve(true);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  private async patchOfferDetails() {
    this.confirmationForm.patchValue({
      isApplicantConfirmed: this.offerDetails.isApplicantConfirmed,
      applicantConfirmedDate: this.offerDetails.applicantConfirmedDate,
      isLandlordConfirmed: this.offerDetails.isLandlordConfirmed,
      landlordConfirmedDate: this.offerDetails.landlordConfirmedDate,
    });
    this.isEnable('applicant');
    this.isEnable('landlord');
    this.makeAnOfferForm.patchValue({
      status: this.offerDetails.status,
      amount: this.offerDetails.amount,
      comments: this.offerDetails.comments,
      moveInDate: this.offerDetails.moveInDate,
      rentingTime: this.offerDetails.rentingTime,
      numberOfAdults: this.offerDetails.numberOfAdults,
      numberOfChildren: this.offerDetails.numberOfChildren,
      tenantRelationship: this.offerDetails.tenantRelationship,
      relationshipInfo: this.offerDetails.relationshipInfo,
      isEligibleToRent: this.offerDetails.isEligibleToRent,
      hasAdverseCreditHistory: this.offerDetails.hasAdverseCreditHistory
    });
    this.propertyClauses = this.offerDetails.offerClauses ? this.offerDetails.offerClauses : [];
    this.propertyRestrictions = this.offerDetails.offerRestrictions ? this.offerDetails.offerRestrictions : [];
    try {
      this.propertyRestrictions.map((restrict) => {
        restrict.restrictionName = this.commonService.camelize(
          restrict.key.replace(/_/g, ' ')
        );
      });
    } catch (e) { }
    this.isOffersDetailsAvailable = true;
  }

  private getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    this.tobService.getPropertyDetails(propertyId, params).subscribe(
      (res) => {
        this.propertyDetails = res.data;
        this.propertyType = this.commonService.getLookupValue(this.lookupdata.rentCategories, this.propertyDetails.rentCategory);
        this.updateOfferFormValidation();
        this.propertyDetails.propertyImageUrl = this.commonService.getHeadMediaUrl(res.data.media || []);
        this.propertyDetails.webImageUrl = this.webImageUrl;
        this.getNoDeposit();
        if (!this.offerId) {
          this.makeAnOfferForm.patchValue({
            amount: this.propertyDetails.advertisementRent,
          });
        }
        this.makeAnOfferForm.controls['amount'].setValidators([
          Validators.required,
          Validators.min(this.propertyDetails.minRent),
          Validators.max(this.propertyDetails.maxRent),
        ]);
        this.makeAnOfferForm.get('amount').updateValueAndValidity();
        this.isTobPropertyCardReady = true;
      });
  }

  private getNoDeposit() {
    this.tobService.getNoDepositScheme().subscribe(
      (res) => {
        if (res) {
          this.propertyDetails.noDepositScheme = res.noDepositScheme;
        }
      });
  }

  private getPropertyClauses(propertyId) {
    this.tobService.getPropertyClauses(propertyId).subscribe(
      (res) => {
        this.propertyClauses = res && res.data ? res.data : [];
        this.negotiatableClauses = this.propertyClauses.filter(
          (result) => result.isNegotiable
        );
      });
  }

  private getPropertyRestrictions(propertyId) {
    this.tobService.getPropertyRestrictions(propertyId).subscribe(
      (res) => {
        this.propertyRestrictions =
          res && res.data ? res.data.filter((result) => result.value) : [];
        this.negotiatableRestrictions = this.propertyRestrictions.filter(
          (result) => result.isNegotiable
        );
        this.propertyRestrictions.map(
          (restrict) =>
          (restrict.restrictionName = this.commonService.camelize(
            restrict.key.replace(/_/g, ' ')
          ))
        );
      });
  }

  async onSubmit() {
    if (!this.applicantDetail) {
      this.commonService.showAlert(
        'Applicant Not Added',
        'Please search an applicant from the search box.'
      );
      return;
    }
    if (this.makeAnOfferForm.invalid || this.confirmationForm.invalid) {
      this.commonService.showAlert(
        'Offer Details',
        'Please fill all required fields'
      );
      this.makeAnOfferForm.markAllAsTouched();
      this.confirmationForm.markAllAsTouched();
      return;
    }
    if (
      this.makeAnOfferForm.valid &&
      this.confirmationForm.valid &&
      this.applicantDetail
    ) {
      const isConfirm: boolean = (await this.commonService.showConfirm(
        'Submit Offer',
        'Are you sure, you want to submit this offer?',
        '',
        'Yes',
        'No'
      )) as boolean;
      if (isConfirm) {
        this.offerId ? this.updateOffer() : this.submitOffer();
      }
    }
  }

  private updateOffer() {
    if (!this.checkForOfferAgreedCondition()) {
      return;
    }
    this.updateApplicantDetails();
    this.updateOfferDetails();
  }

  private updateOfferDetails() {
    let isStatusUpdated = false;
    let isStatusAndFormBothUpdated = false;
    let isOnlyFormUpdated = false;
    this.getUpdatedValues();

    if ((this.updatedFormValues.length > 1 && this.updatedFormValues.includes('status')) || (this.updatedFormValues.includes('amount'))) {
      isStatusAndFormBothUpdated = true;
    } else if (this.updatedFormValues.length === 1 && this.updatedFormValues.includes('status')) {
      isStatusUpdated = true;
    } else {
      isOnlyFormUpdated = true;
    }

    if (isStatusUpdated) {
      const counterOfferStatus = this.makeAnOfferForm.controls.status.value;
      if (this.offerDetails.status !== counterOfferStatus) {
        this.updateOfferStatus(counterOfferStatus);
      }
    }

    if (isStatusAndFormBothUpdated) {
      this.updateOfferWithStatus();
    }

    if (isOnlyFormUpdated) {
      this.updateOfferOnly();
    }
  }

  private async updateOfferStatus(counterOfferStatus) {
    const confirmationForm = this.confirmationForm.value;
    const status = counterOfferStatus
      ? counterOfferStatus
      : this.makeAnOfferForm.controls.status.value;
    const requestObj: any = {};
    requestObj.entityType = ENTITY_TYPE.AGENT;
    requestObj.sendEmailToLandlord = confirmationForm.sendEmailToLandlord;
    requestObj.sendEmailToApplicant = confirmationForm.sendEmailToApplicant;
    this.tobService
      .updateOfferStatus(this.offerId, status, requestObj)
      .subscribe((response) => {
        this.commonService.showMessage(
          'Offer details have been updated.',
          'Update Offer',
          'success'
        );
        if (!this.offerId) {
          this.router.navigate([`../offers`], {
            replaceUrl: true,
            relativeTo: this.route,
          });
        } else {
          this.router.navigate([`../../offers`], {
            replaceUrl: true,
            relativeTo: this.route,
          });
        }
      });
  }

  private prepareUpdateOffer(): object {
    const offerFormValues = this.makeAnOfferForm.value;
    const confirmationForm = this.confirmationForm.value;
    const requestObj: any = {};
    requestObj.entityType = ENTITY_TYPE.AGENT;
    requestObj.amount = offerFormValues.amount;
    requestObj.moveInDate = this.commonService.getFormatedDate(
      offerFormValues.moveInDate
    );
    requestObj.rentingTime = offerFormValues.rentingTime;
    requestObj.numberOfAdults = offerFormValues.numberOfAdults;
    requestObj.numberOfChildren = offerFormValues.numberOfChildren;
    requestObj.comments = offerFormValues.comments;
    requestObj.isApplicantConfirmed = confirmationForm.isApplicantConfirmed;
    requestObj.applicantConfirmedDate = requestObj.isApplicantConfirmed
      ? this.commonService.getFormatedDate(
        confirmationForm.applicantConfirmedDate
      )
      : null;
    requestObj.tenantRelationship = offerFormValues.tenantRelationship;
    requestObj.relationshipInfo = offerFormValues.relationshipInfo;
    requestObj.isEligibleToRent = offerFormValues.isEligibleToRent;
    requestObj.hasAdverseCreditHistory = offerFormValues.hasAdverseCreditHistory;
    requestObj.isLandlordConfirmed = confirmationForm.isLandlordConfirmed;
    requestObj.landlordConfirmedDate = confirmationForm.isLandlordConfirmed
      ? this.commonService.getFormatedDate(
        confirmationForm.landlordConfirmedDate
      )
      : null;
    requestObj.sendEmailToLandlord = confirmationForm.sendEmailToLandlord;
    requestObj.sendEmailToApplicant = confirmationForm.sendEmailToApplicant;
    return requestObj;
  }

  private checkForOfferAgreedCondition() {
    const STATUS_ACCEPTED = 1;
    if (
      this.offerDetails.status === STATUS_ACCEPTED &&
      (!this.confirmationForm.controls.isApplicantConfirmed.value ||
        !this.confirmationForm.controls.isLandlordConfirmed.value)
    ) {
      this.commonService.showAlert(
        'Offer',
        'This offer is not confirmed by Landlord or Applicant. Please confirm the offer before marking it as Accepted.'
      );
      return false;
    } else {
      return true;
    }
  }

  private submitOffer() {
    if (this.makeAnOfferForm.valid) {
      this.updateApplicantDetails();
      this.tobService.createOffer(this.prepareCreateOffer()).subscribe(
        (resp) => {
          const applicantName =
            this.applicantDetail.fullName ||
            this.applicantDetail.title +
            ' ' +
            this.applicantDetail.forename +
            ' ' +
            this.applicantDetail.surname;
          this.commonService
            .showAlert(
              'Offer Created',
              'Congratulations! You have successfully created an offer on behalf of Applicant ' +
              applicantName
            )
            .then((res) => {
              if (res) {
                this.router.navigate([`../offers`], {
                  replaceUrl: true,
                  relativeTo: this.route,
                });
              }
            });
        },
        (error) => {
          this.commonService.showMessage(
            error.error ? error.error.message : error.message,
            'Offer',
            'error'
          );
        }
      );
    } else {
      if (this.makeAnOfferForm.invalid) {
        this.router.navigate([`../offers`], {
          replaceUrl: true,
          relativeTo: this.route,
        });
        this.commonService.showMessage(
          'Please fill all the required fields.',
          'Offer Details',
          'error'
        );
        if (this.makeAnOfferForm.invalid) {
          this.makeAnOfferForm.markAllAsTouched();
        }
      }
    }
  }

  private prepareCreateOffer(): object {
    const offerFormValues = this.makeAnOfferForm.value;
    const confirmationForm = this.confirmationForm.value;
    const requestObj: any = {};
    requestObj.entityType = ENTITY_TYPE.AGENT;
    requestObj.applicantId = this.applicantId;
    requestObj.status = 0; // create default status is 0 = unknown
    requestObj.propertyId = this.propertyId;
    requestObj.amount = offerFormValues.amount;
    requestObj.moveInDate = this.commonService.getFormatedDate(
      offerFormValues.moveInDate
    );
    requestObj.rentingTime = offerFormValues.rentingTime;
    requestObj.numberOfAdults = offerFormValues.numberOfAdults;
    requestObj.numberOfChildren = offerFormValues.numberOfChildren;
    requestObj.isApplicantConfirmed = confirmationForm.isApplicantConfirmed;
    requestObj.applicantConfirmedDate = confirmationForm.applicantConfirmedDate ? this.commonService.getFormatedDate(
      confirmationForm.applicantConfirmedDate
    ) : null;
    requestObj.isLandlordConfirmed = confirmationForm.isLandlordConfirmed;
    requestObj.landlordConfirmedDate = confirmationForm.landlordConfirmedDate ? this.commonService.getFormatedDate(
      confirmationForm.landlordConfirmedDate
    ) : null;
    requestObj.sendEmailToLandlord = confirmationForm.sendEmailToLandlord;
    requestObj.comments = offerFormValues.comments;
    requestObj.offerClauses = this.propertyClauses;
    requestObj.offerClauses.forEach((element) => {
      if (element.negotiations && element.negotiations.length > 0) {
        element.negotiations.map((negotiation) => {
          delete negotiation.createdAt;
        });
      }
    });
    requestObj.offerRestrictions = this.propertyRestrictions;
    requestObj.offerRestrictions.forEach((element) => {
      if (element.negotiations && element.negotiations.length > 0) {
        element.negotiations.map((negotiation) => {
          delete negotiation.createdAt;
          delete negotiation.restrictionName;
        });
      }
    });
    requestObj.tenantRelationship = offerFormValues.tenantRelationship;
    requestObj.relationshipInfo = offerFormValues.relationshipInfo;
    requestObj.isEligibleToRent = offerFormValues.isEligibleToRent;
    requestObj.hasAdverseCreditHistory = offerFormValues.hasAdverseCreditHistory;
    return requestObj;
  }

  private updateApplicantDetails() {
    const requestObj = this.makeAnOfferForm.value;
    requestObj.moveInDate = this.commonService.getFormatedDate(
      requestObj.moveInDate
    );
    this.tobService
      .updateApplicantDetails(this.applicantId, requestObj)
      .subscribe(
        (res) => { }
      );
  }

  private getLookUpData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData();
    } else {
      this.commonService.getLookup().subscribe(
        (data) => {
          this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
          this.setLookupData();
        });
    }
  }

  private getTobLookupData() {
    this.toblookupdata = this.commonService.getItem(
      PROPCO.TOB_LOOKUP_DATA,
      true
    );
    if (this.toblookupdata) {
      this.setTobLookupData();
    } else {
      this.commonService.getTobLookup().subscribe(
        (data) => {
          this.commonService.setItem(PROPCO.TOB_LOOKUP_DATA, data);
          this.setTobLookupData();
        });
    }
  }
  private setLookupData(): void {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.letDurations = this.lookupdata.letDurations;
    this.tenantCurrentPositionTypes =
      this.lookupdata.tenantCurrentPositionTypes;
    this.applicantGuarantorTypes = this.lookupdata.applicantGuarantorTypes;
    this.rentFrequencyTypes = this.lookupdata.advertisementRentFrequencies;
    this.tenantRelationShipsList = this.lookupdata.tenantRelationships;
    this.employmentTypeList = this.lookupdata.employmentTypes;
  }

  private setTobLookupData(): void {
    this.toblookupdata = this.commonService.getItem(
      PROPCO.TOB_LOOKUP_DATA,
      true
    );
    this.offerStatuses = this.toblookupdata.offerStatuses;
  }

  private initSearchForm(): void {
    this.searchApplicantForm = this.formBuilder.group({
      searchApplicant: '',
    });
  }

  private initMakeAnOfferForm(): void {
    this.makeAnOfferForm = this.formBuilder.group({
      amount: ['', Validators.required],
      status: [0],
      moveInDate: ['', Validators.required],
      rentingTime: ['', Validators.required],
      numberOfAdults: [1],
      numberOfChildren: [0, Validators.required],
      currentPosition: [''],
      occupation: [''],
      hasGuarantor: false,
      guarantorType: [{ value: '', disabled: true }],
      hasPets: [false],
      petsInfo: [{ value: '', disabled: true }],
      comments: [''],
      tenantRelationship: ['', Validators.required],
      employmentType: ['', Validators.required],
      annualIncome: ['', this.requiredIfNotZeroValidator()],
      relationshipInfo: [],
      hasAdverseCreditHistory: [],
      isEligibleToRent: []
    });
    this.makeAnOfferForm.get('tenantRelationship').valueChanges.subscribe((r) => {
      if (r && r == 5) {
        this.makeAnOfferForm.get('relationshipInfo').setValidators(Validators.required);
        this.makeAnOfferForm.get('relationshipInfo').updateValueAndValidity();
      } else {
        this.makeAnOfferForm.get('relationshipInfo').clearValidators();
        this.makeAnOfferForm.get('relationshipInfo').updateValueAndValidity();
      }
    });
  }

  private initConfirmationForm(): void {
    this.confirmationForm = this.formBuilder.group({
      isApplicantConfirmed: false,
      applicantConfirmedDate: '',
      isLandlordConfirmed: false,
      landlordConfirmedDate: '',
      sendEmailToApplicant: false,
      sendEmailToLandlord: false,
    });
  }

  private setRequired() {
    return [Validators.required];
  }

  isEnable(type) {
    switch (type) {
      case 'guarantor':
        if (this.makeAnOfferForm.value.hasGuarantor) {
          this.makeAnOfferForm.controls.guarantorType.setValidators(
            this.setRequired()
          );
          this.makeAnOfferForm.controls.guarantorType.enable();
        } else {
          this.makeAnOfferForm.controls.guarantorType.clearValidators();
          this.makeAnOfferForm.get('guarantorType').updateValueAndValidity();
          this.makeAnOfferForm.controls.guarantorType.disable();
        }
        break;
      case 'applicant':
        if (this.confirmationForm.value.isApplicantConfirmed) {
          this.confirmationForm.controls.applicantConfirmedDate.setValidators(
            this.setRequired()
          );
          // this.confirmationForm.controls.applicantConfirmedDate.enable();
          this.applicantConfirmedDateInput = false;
          this.confirmationForm
            .get('applicantConfirmedDate')
            .setValue(this.commonService.getFormatedDate(new Date()));
        } else {
          this.confirmationForm.controls.applicantConfirmedDate.clearValidators();
          this.confirmationForm
            .get('applicantConfirmedDate')
            .updateValueAndValidity();
          // this.confirmationForm.controls.applicantConfirmedDate.disable();
          this.applicantConfirmedDateInput = true;
          this.confirmationForm.get('applicantConfirmedDate').setValue(this.commonService.getFormatedDate(new Date()));
        }
        break;
      case 'landlord':
        if (this.confirmationForm.value.isLandlordConfirmed) {
          this.confirmationForm.controls.landlordConfirmedDate.setValidators(
            this.setRequired()
          );
          // this.confirmationForm.controls.landlordConfirmedDate.enable();
          this.landlordConfirmedDateInput = false;
          this.confirmationForm
            .get('landlordConfirmedDate')
            .setValue(new Date());
        } else {
          this.confirmationForm.controls.landlordConfirmedDate.clearValidators();
          this.confirmationForm
            .get('landlordConfirmedDate')
            .updateValueAndValidity();
          // this.confirmationForm.controls.landlordConfirmedDate.disable();
          this.landlordConfirmedDateInput = true;
          this.confirmationForm.get('landlordConfirmedDate').setValue('');
        }
        break;
      case 'pets':
        if (this.makeAnOfferForm.value.hasPets) {
          this.makeAnOfferForm.controls.petsInfo.enable();
        } else {
          this.makeAnOfferForm.controls.petsInfo.disable();
        }
        break;
    }
  }

  async presentModal(obj, type) {
    const headingText =
      type === 'CLAUSE'
        ? 'Clause - ' + obj.clauseName
        : 'Restriction - ' + obj.restrictionName;
    obj.negotiations = obj.negotiations ? obj.negotiations : [];
    const modal = await this.modalController.create({
      component: NegotiateModalPage,
      cssClass: 'modal-container tob-modal-container',
      componentProps: {
        data: obj,
        heading: headingText,
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss();
    await modal.present();
  }

  async onCancel() {
    const isCancel: boolean = (await this.commonService.showConfirm(
      'Cancel',
      'Are you sure, you want to cancel this operation?',
      '',
      'Yes',
      'No'
    )) as boolean;
    if (isCancel) {
      const propertyId = this.offerId
        ? this.offerDetails.propertyId
        : this.propertyId;
      if (!this.offerId) {
        this.router.navigate([`../offers`], {
          replaceUrl: true,
          relativeTo: this.route,
        });
      } else {
        this.router.navigate([`../../offers`], {
          replaceUrl: true,
          relativeTo: this.route,
        });
      }
    }
  }

  private getOfferStatusList(offerStatus) {
    if (typeof offerStatus !== undefined && offerStatus !== '') {
      let statusArray = [];
      const offerStatusesLookup: OfferModels.ILookupResponse[] =
        this.offerStatuses;
      this.offerStatuses = [];
      switch (offerStatus) {
        case OFFER_STATUSES.NEW:
          statusArray = [
            OFFER_STATUSES.AGREED_IN_PRINCIPLE,
            OFFER_STATUSES.ACCEPTED,
            OFFER_STATUSES.REJECTED,
            OFFER_STATUSES.WITHDRAWN_BY_APPLICANT,
          ];
          break;
        case OFFER_STATUSES.ACCEPTED:
          statusArray = [
            OFFER_STATUSES.AGREED_IN_PRINCIPLE,
            OFFER_STATUSES.WITHDRAWN_BY_APPLICANT,
            OFFER_STATUSES.WITHDRAWN_BY_LANDLORD,
          ];
          break;
        case OFFER_STATUSES.REJECTED:
        case OFFER_STATUSES.WITHDRAWN_BY_APPLICANT:
        case OFFER_STATUSES.WITHDRAWN_BY_LANDLORD:
          statusArray = [
            OFFER_STATUSES.ACCEPTED,
            OFFER_STATUSES.AGREED_IN_PRINCIPLE,
          ];
          break;
        case OFFER_STATUSES.AGREED_IN_PRINCIPLE:
          statusArray = [
            OFFER_STATUSES.ACCEPTED,
            OFFER_STATUSES.REJECTED,
            OFFER_STATUSES.WITHDRAWN_BY_APPLICANT,
            OFFER_STATUSES.WITHDRAWN_BY_LANDLORD,
          ];
          break;
        case OFFER_STATUSES.COUNTER_OFFER_BY_LL_AGENT:
        case OFFER_STATUSES.COUNTER_OFFER_BY_APPLICANT:
          statusArray = [
            OFFER_STATUSES.AGREED_IN_PRINCIPLE,
            OFFER_STATUSES.ACCEPTED,
            OFFER_STATUSES.REJECTED,
            OFFER_STATUSES.WITHDRAWN_BY_APPLICANT,
            OFFER_STATUSES.WITHDRAWN_BY_LANDLORD,
          ];
          break;
      }
      statusArray.push(offerStatus);
      offerStatusesLookup.forEach((lookupObj) => {
        if (statusArray.indexOf(lookupObj.index) !== -1) {
          this.offerStatuses.push(lookupObj);
        }
      });
    }
  }

  private updateOfferWithStatus() {
    this.tobService
      .updateOffer(this.prepareUpdateOffer(), this.offerId)
      .subscribe((response) => {
        let counterOfferStatus = this.makeAnOfferForm.controls.status.value;
        if (this.offerDetails.amount !== Number(this.makeAnOfferForm.controls.amount.value)) {
          counterOfferStatus = OFFER_STATUSES.COUNTER_OFFER_BY_LL_AGENT;
        }
        if (this.offerDetails.status !== this.makeAnOfferForm.controls.status.value) {
          counterOfferStatus = this.makeAnOfferForm.controls.status.value;
        }
        if (this.offerDetails.status !== counterOfferStatus) {
          this.updateOfferStatus(counterOfferStatus);
        } else {
          this.commonService.showMessage(
            'Offer details have been updated.',
            'Update Offer',
            'success'
          );

          if (!this.offerId) {
            this.router.navigate([`../offers`], {
              replaceUrl: true,
              relativeTo: this.route,
            });
          } else {
            this.router.navigate([`../../offers`], {
              replaceUrl: true,
              relativeTo: this.route,
            });
          }
        }
      });
  }

  private updateOfferOnly() {
    this.tobService
      .updateOffer(this.prepareUpdateOffer(), this.offerId)
      .subscribe((response) => {
        this.commonService.showMessage(
          'Offer details have been updated.',
          'Update Offer',
          'success'
        );
        if (!this.offerId) {
          this.router.navigate([`../offers`], {
            replaceUrl: true,
            relativeTo: this.route,
          });
        } else {
          this.router.navigate([`../../offers`], {
            replaceUrl: true,
            relativeTo: this.route,
          });
        }
      });
  }

  private getUpdatedValues() {
    this.updatedFormValues = [];
    this.makeAnOfferForm['_forEachChild']((control, name) => {
      if (control.dirty) {
        this.updatedFormValues.push(name);
      }
    });
    this.confirmationForm['_forEachChild']((control, name) => {
      if (control.dirty) {
        this.updatedFormValues.push(name);
      }
    });
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

  private updateOfferFormValidation(): void {
    if (this.propertyType != 'Student') {
      this.letDurations = this.letDurations.filter(x => x.value == '6 months' || x.value == '12 months');
      return;
    }
    this.makeAnOfferForm.controls['tenantRelationship'].clearValidators();
    this.makeAnOfferForm.controls['tenantRelationship'].updateValueAndValidity();
    this.makeAnOfferForm.controls['relationshipInfo'].clearValidators();
    this.makeAnOfferForm.controls['relationshipInfo'].updateValueAndValidity();
    this.makeAnOfferForm.controls['isEligibleToRent'].clearValidators();
    this.makeAnOfferForm.controls['isEligibleToRent'].updateValueAndValidity();
    this.makeAnOfferForm.controls['hasAdverseCreditHistory'].clearValidators();
    this.makeAnOfferForm.controls['hasAdverseCreditHistory'].updateValueAndValidity();
    this.makeAnOfferForm.controls['employmentType'].clearValidators();
    this.makeAnOfferForm.controls['employmentType'].updateValueAndValidity();
    this.makeAnOfferForm.controls['annualIncome'].clearValidators();
    this.makeAnOfferForm.controls['annualIncome'].updateValueAndValidity();
  }

  private requiredIfNotZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '' || value === 0) {
        return { 'required': true };
      }
      if (value === 0) {
        return null;
      }
      return Validators.required(control);
    };
  }
}
