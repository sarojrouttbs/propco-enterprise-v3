import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ENTITY_TYPE, OFFER_STATUSES, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { TobService } from '../tob.service';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { NegotiateModalPage } from 'src/app/shared/modals/negotiate-modal/negotiate-modal.page';

@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.page.html',
  styleUrls: ['./offer-detail.page.scss', '../common-css/offer-application-detail.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
export class OfferDetailPage implements OnInit {
  lookupdata: any;
  toblookupdata: any;
  letDurations: OfferModels.ILookupResponse[];
  howLong = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
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
  disableSearchApplicant: boolean = false;
  applicantId: string;
  resultsAvailable: boolean = null;
  rentFrequencyTypes: OfferModels.ILookupResponse[];
  offerDetails: OfferModels.IOfferResponse;
  isTobPropertyCardReady: boolean = false;
  isApplicantDetailsAvailable: boolean = false;
  isOffersDetailsAvailable: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private _formBuilder: FormBuilder,
    private _tobService: TobService,
    private modalController: ModalController,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('propertyId');
    this.offerId = this.route.snapshot.paramMap.get('offerId');
    if (typeof this.offerId !== 'undefined' && this.offerId != null) {
      this.initViewApiCalls();
    }
    else if (typeof this.propertyId !== 'undefined' && this.propertyId != null) {
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
    this.applicantList = this.searchApplicantForm.get('searchApplicant').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.searchApplicant(value) : new Observable()));
  }

  async getApplicantDetails(applicantId: string) {
    this.applicantId = applicantId;
    this._tobService.getApplicantDetails(applicantId).subscribe(res => {
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
    },
      error => {
      })
  }

  private patchApplicantDetail(){
    this.makeAnOfferForm.patchValue({
      moveInDate: this.applicantDetail.moveInDate,
      rentingTime: this.applicantDetail.rentingTime,
      numberOfAdults: this.applicantDetail.numberOfAdults ? this.applicantDetail.numberOfAdults : 1,
      numberOfChildren: this.applicantDetail.numberOfChildren ? this.applicantDetail.numberOfChildren : 0,
      occupation: this.applicantDetail.occupation,
      hasGuarantor: this.applicantDetail.guarantorType ? true : false,
      guarantorType: this.applicantDetail.guarantorType,
      hasPets: this.applicantDetail.petsInfo ? true : false,
      petsInfo: this.applicantDetail.petsInfo,
      currentPosition: this.applicantDetail.currentPosition
    });
  }

  async deleteApplicant() {
    const isAgree: boolean = await this.commonService.showConfirm('Delete Applicant', 'Are you sure, you want to remove this applicant ?', '', 'Yes', 'No') as boolean;
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
    let response = this._tobService.searchApplicant(applicantId);
    return response;
  }

  private initForms() {
    this.initSearchForm();
    this.initMakeAnOfferForm();
    this.initConfirmationForm();
  }

  private initCreateApiCalls() {
    this.getLookUpData();
    this.getTobLookupData();
    this.getPropertyDetails(this.propertyId);
    this.getPropertyClauses(this.propertyId);
    this.getPropertyRestrictions(this.propertyId);
    this.isOffersDetailsAvailable = true;
    this.isApplicantDetailsAvailable = true;
  }

  async initViewApiCalls() {
    this.getLookUpData();
    this.getTobLookupData();
    await this.getOfferDetails(this.offerId);
    await this.getPropertyDetails(this.offerDetails.propertyId);
    await this.getApplicantDetails(this.offerDetails.applicantId);
  }

  private async getOfferDetails(offerId): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this._tobService.getOfferDetails(offerId).subscribe(
        res => {
          this.offerDetails = res;
          if (this.offerDetails) {
            this.patchOfferDetails();
            this.getOfferStatusList(this.offerDetails.status);
          }
          resolve(true);
        },
        error => {
          reject(error)
        }
      );
    });
    return promise;
  }

  private async patchOfferDetails() {
    this.confirmationForm.patchValue({
      isApplicantConfirmed: this.offerDetails.isApplicantConfirmed,
      applicantConfirmedDate: this.offerDetails.applicantConfirmedDate,
      isLandlordConfirmed: this.offerDetails.isLandlordConfirmed,
      landlordConfirmedDate: this.offerDetails.landlordConfirmedDate,
    })
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
    });
    this.propertyClauses = this.offerDetails.offerClauses ? this.offerDetails.offerClauses : [];
    this.propertyRestrictions = this.offerDetails.offerRestrictions ? this.offerDetails.offerRestrictions : [];
    try {
      this.propertyRestrictions.map(restrict => {
        restrict.restrictionName = this.commonService.camelize(restrict.key.replace(/_/g, ' '));
      });
    } catch (e) {
    }
    this.isOffersDetailsAvailable = true;
  }

  private getPropertyDetails(propertyId) {
    this._tobService.getPropertyDetails(propertyId).subscribe(res => {
      this.propertyDetails = res.data;
      this.propertyDetails.propertyImageUrl = this.commonService.getHeadMediaUrl(res.data.media || []);
      this.getNoDeposit();
      if (!this.offerId) {
        this.makeAnOfferForm.patchValue({
          amount: this.propertyDetails.advertisementRent
        });
      }
      this.makeAnOfferForm.controls['amount'].setValidators([
        Validators.required,
        Validators.min(this.propertyDetails.minRent),
        Validators.max(this.propertyDetails.maxRent)
      ]);
      this.makeAnOfferForm.get('amount').updateValueAndValidity();
      this.isTobPropertyCardReady = true;
    }, (error) => {
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


  private getPropertyClauses(propertyId) {
    this._tobService.getPropertyClauses(propertyId).subscribe(res => {
      this.propertyClauses = (res && res.data) ? res.data : [];
      this.negotiatableClauses = this.propertyClauses.filter(result => result.isNegotiable);
    }, (error) => {
    });
  }

  private getPropertyRestrictions(propertyId) {
    this._tobService.getPropertyRestrictions(propertyId).subscribe(res => {
      this.propertyRestrictions = res && res.data ? res.data.filter(result => result.value) : [];
      this.negotiatableRestrictions = this.propertyRestrictions.filter(result => result.isNegotiable);
      this.propertyRestrictions.map(restrict => restrict.restrictionName = this.commonService.camelize(restrict.key.replace(/_/g, ' ')));
    }, (error) => {
    });
  }

  async onSubmit() {
    if (!this.applicantDetail) {
      this.commonService.showAlert('Applicant Not Added', 'Please search an applicant from the search box.');
      return;
    }
    if (this.makeAnOfferForm.invalid || this.confirmationForm.invalid) {
      this.commonService.showAlert('Offer Details', 'Please fill all required fields');
      this.makeAnOfferForm.markAllAsTouched();
      this.confirmationForm.markAllAsTouched();
      return;
    }
    if (this.makeAnOfferForm.valid && this.confirmationForm.valid && this.applicantDetail) {
      const isConfirm: boolean = await this.commonService.showConfirm('Submit Offer', 'Are you sure, you want to submit this offer?', '', 'Yes', 'No') as boolean;
      if (isConfirm) {
        this.offerId ? this.updateOffer() : this.submitOffer();
      }
    }
  }

  private updateOffer() {
    if (!this.checkForOfferAgreedCondition()) {
      return;
    };
    this.updateApplicantDetails();
    this.updateOfferDetails();
  }

  private updateOfferDetails() {
    this._tobService.updateOffer(this.prepareUpdateOffer(), this.offerId).subscribe(response => {
      // if (this.offerDetails.status !== this.makeAnOfferForm.controls.status.value) {
      //   this.updateOfferStatus();;
      // }
      let counterOfferStatus = this.makeAnOfferForm.controls.status.value;
      if (this.offerDetails.amount !== Number(this.makeAnOfferForm.controls.amount.value)) {
        counterOfferStatus = OFFER_STATUSES.COUNTER_OFFER_BY_LL_AGENT;
      }
      if (this.offerDetails.status !== this.makeAnOfferForm.controls.status.value) {
        counterOfferStatus = this.makeAnOfferForm.controls.status.value;
      }
      if (this.offerDetails.status !== counterOfferStatus) {
        this.updateOfferStatus(counterOfferStatus);
      }
      else {
        this.commonService.showMessage('Offer details have been updated.', 'Update Offer', 'success');
        this.router.navigate([`tob/${this.offerDetails.propertyId}/offers`], { replaceUrl: true });
      }
    })
  }

  private async updateOfferStatus(counterOfferStatus) {
    const confirmationForm = this.confirmationForm.value;
    const status = counterOfferStatus ? counterOfferStatus : this.makeAnOfferForm.controls.status.value;
    const requestObj: any = {};
    requestObj.entityType = ENTITY_TYPE.AGENT;
    requestObj.sendEmailToLandlord = confirmationForm.sendEmailToLandlord;
    requestObj.sendEmailToApplicant = confirmationForm.sendEmailToApplicant;
      this._tobService.updateOfferStatus(this.offerId, status, requestObj).subscribe(response => {
        this.commonService.showMessage('Offer details have been updated.', 'Update Offer', 'success');
        this.router.navigate([`tob/${this.offerDetails.propertyId}/offers`], { replaceUrl: true });
      })
  }

  private prepareUpdateOffer(): object {
    const offerFormValues = this.makeAnOfferForm.value;
    const confirmationForm = this.confirmationForm.value;
    const requestObj: any = {};
    requestObj.entityType = ENTITY_TYPE.AGENT;
    requestObj.amount = offerFormValues.amount;
    requestObj.moveInDate = this.commonService.getFormatedDate(offerFormValues.moveInDate);
    requestObj.rentingTime = offerFormValues.rentingTime;
    requestObj.numberOfAdults = offerFormValues.numberOfAdults;
    requestObj.numberOfChildren = offerFormValues.numberOfChildren;
    requestObj.comments = offerFormValues.comments
    requestObj.isApplicantConfirmed = confirmationForm.isApplicantConfirmed;
    requestObj.applicantConfirmedDate = requestObj.isApplicantConfirmed ? this.commonService.getFormatedDate(confirmationForm.applicantConfirmedDate) : null;
    requestObj.isLandlordConfirmed = confirmationForm.isLandlordConfirmed;
    requestObj.landlordConfirmedDate = confirmationForm.isLandlordConfirmed ? this.commonService.getFormatedDate(confirmationForm.landlordConfirmedDate) : null;
    requestObj.sendEmailToLandlord = confirmationForm.sendEmailToLandlord;
    requestObj.sendEmailToApplicant = confirmationForm.sendEmailToApplicant;
    return requestObj;
  }

  private checkForOfferAgreedCondition() {
    const STATUS_ACCEPTED = 1;
    if (this.offerDetails.status == STATUS_ACCEPTED && (!this.confirmationForm.controls.isApplicantConfirmed.value || !this.confirmationForm.controls.isLandlordConfirmed.value)) {
      this.commonService.showAlert('Offer', 'This offer is not confirmed by Landlord or Applicant. Please confirm the offer before marking it as Accepted.');
      return false;
    } else {
      return true;
    }
  }

  private submitOffer() {
    if (this.makeAnOfferForm.valid) {
      this.updateApplicantDetails();
      this._tobService.createOffer(this.prepareCreateOffer()).subscribe(res => {
        let applicantName = this.applicantDetail.fullName || (this.applicantDetail.title + ' ' + this.applicantDetail.forename + ' ' + this.applicantDetail.surname)
        this.commonService.showAlert('Offer Created', 'Congratulations! You have successfully created an offer on behalf of Applicant ' + applicantName).then(res => {
          if (res) {
            this.router.navigate([`tob/${this.propertyId}/offers`], { replaceUrl: true });
          }
        })
      }, error => {
        // this.commonService.showMessage(error.error ? error.error.message : error.message, 'Offer', 'error');
      });
    }
    else {
      if (this.makeAnOfferForm.invalid) {
        this.commonService.showMessage('Please fill all the required fields.', 'Offer Details', 'error');
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
    requestObj.status = 0; //create default status is 0 = unknown
    requestObj.propertyId = this.propertyId;
    requestObj.amount = offerFormValues.amount;
    requestObj.moveInDate = this.commonService.getFormatedDate(offerFormValues.moveInDate);
    requestObj.rentingTime = offerFormValues.rentingTime;
    requestObj.numberOfAdults = offerFormValues.numberOfAdults;
    requestObj.numberOfChildren = offerFormValues.numberOfChildren;
    requestObj.isApplicantConfirmed = confirmationForm.isApplicantConfirmed;
    requestObj.applicantConfirmedDate = this.commonService.getFormatedDate(confirmationForm.applicantConfirmedDate);
    requestObj.isLandlordConfirmed = confirmationForm.isLandlordConfirmed;
    requestObj.landlordConfirmedDate = this.commonService.getFormatedDate(confirmationForm.landlordConfirmedDate);
    requestObj.sendEmailToLandlord = confirmationForm.sendEmailToLandlord;
    requestObj.comments = offerFormValues.comments
    requestObj.offerClauses = this.propertyClauses;
    requestObj.offerClauses.forEach(element => {
      if (element.negotiations && element.negotiations.length > 0) {
        element.negotiations.map(negotiation => {
          delete negotiation.createdAt;
        });
      }
    });
    requestObj.offerRestrictions = this.propertyRestrictions;
    requestObj.offerRestrictions.forEach(element => {
      if (element.negotiations && element.negotiations.length > 0) {
        element.negotiations.map(negotiation => {
          delete negotiation.createdAt;
          delete negotiation.restrictionName;
        });
      }
    });
    return requestObj;
  }

  private updateApplicantDetails() {
    const requestObj = this.makeAnOfferForm.value;
    requestObj.moveInDate = this.commonService.getFormatedDate(requestObj.moveInDate);
    this._tobService.updateApplicantDetails(this.applicantId, requestObj).subscribe(res => {
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
  }

  private setTobLookupData(): void {
    this.toblookupdata = this.commonService.getItem(PROPCO.TOB_LOOKUP_DATA, true);
    this.offerStatuses = this.toblookupdata.offerStatuses;
  }

  private initSearchForm(): void {
    this.searchApplicantForm = this._formBuilder.group({
      searchApplicant: ''
    });
  }

  private initMakeAnOfferForm(): void {
    this.makeAnOfferForm = this._formBuilder.group({
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
    });
  }

  private initConfirmationForm(): void {
    this.confirmationForm = this._formBuilder.group({
      isApplicantConfirmed: false,
      applicantConfirmedDate: [{ value: '', disabled: true }],
      isLandlordConfirmed: false,
      landlordConfirmedDate: [{ value: '', disabled: true }],
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
          this.makeAnOfferForm.controls.guarantorType.setValidators(this.setRequired());
          this.makeAnOfferForm.controls.guarantorType.enable();
        } else {
          this.makeAnOfferForm.controls.guarantorType.clearValidators();
          this.makeAnOfferForm.get('guarantorType').updateValueAndValidity();
          this.makeAnOfferForm.controls.guarantorType.disable();
        }
        break;
      case 'applicant':
        if (this.confirmationForm.value.isApplicantConfirmed) {
          this.confirmationForm.controls.applicantConfirmedDate.setValidators(this.setRequired());
          this.confirmationForm.controls.applicantConfirmedDate.enable();
          this.confirmationForm.get('applicantConfirmedDate').setValue(new Date());
        } else {
          this.confirmationForm.controls.applicantConfirmedDate.clearValidators();
          this.confirmationForm.get('applicantConfirmedDate').updateValueAndValidity();
          this.confirmationForm.controls.applicantConfirmedDate.disable();
          this.confirmationForm.get('applicantConfirmedDate').setValue('');
        }
        break;
      case 'landlord':
        if (this.confirmationForm.value.isLandlordConfirmed) {
          this.confirmationForm.controls.landlordConfirmedDate.setValidators(this.setRequired());
          this.confirmationForm.controls.landlordConfirmedDate.enable();
          this.confirmationForm.get('landlordConfirmedDate').setValue(new Date());
        } else {
          this.confirmationForm.controls.landlordConfirmedDate.clearValidators();
          this.confirmationForm.get('landlordConfirmedDate').updateValueAndValidity();
          this.confirmationForm.controls.landlordConfirmedDate.disable();
          this.confirmationForm.get('landlordConfirmedDate').setValue('');

        }
        break;
      case 'pets':
        if (this.makeAnOfferForm.value.hasPets) {
          this.makeAnOfferForm.controls.petsInfo.enable();
        }
        else {
          this.makeAnOfferForm.controls.petsInfo.disable();
        }
        break;
    }
  }

  async presentModal(obj, type) {
    let headingText = (type === 'CLAUSE') ? 'Clause - ' + obj.clauseName : 'Restriction - ' + obj.restrictionName;
    obj.negotiations = obj.negotiations ? obj.negotiations : [];
    const modal = await this.modalController.create({
      component: NegotiateModalPage,
      cssClass: 'modal-container',
      componentProps: {
        data: obj,
        heading: headingText
      },
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
    });
    await modal.present();
  }

  async onCancel() {
    const isCancel: boolean = await this.commonService.showConfirm('Cancel', 'Are you sure, you want to cancel this operation?', '', 'Yes', 'No') as boolean;
    if (isCancel) {
      const propertyId = this.offerId ? this.offerDetails.propertyId : this.propertyId;
      this.router.navigate([`tob/${propertyId}/offers`], { replaceUrl: true });
    }
  }

  private getOfferStatusList(offerStatus) {
    if (typeof offerStatus != undefined && offerStatus !== '') {
      let statusArray = [];
      let offerStatusesLookup: OfferModels.ILookupResponse[] = this.offerStatuses;
      this.offerStatuses = [];
      switch (offerStatus) {
        case OFFER_STATUSES.NEW:
          statusArray = [
            OFFER_STATUSES.AGREED_IN_PRINCIPLE, OFFER_STATUSES.ACCEPTED,
            OFFER_STATUSES.REJECTED, OFFER_STATUSES.WITHDRAWN_BY_APPLICANT];
          break;
        case OFFER_STATUSES.ACCEPTED:
          statusArray = [
            OFFER_STATUSES.AGREED_IN_PRINCIPLE, OFFER_STATUSES.WITHDRAWN_BY_APPLICANT,
            OFFER_STATUSES.WITHDRAWN_BY_LANDLORD];
          break;
        case OFFER_STATUSES.REJECTED:
        case OFFER_STATUSES.WITHDRAWN_BY_APPLICANT:
        case OFFER_STATUSES.WITHDRAWN_BY_LANDLORD:
          statusArray = [OFFER_STATUSES.ACCEPTED, OFFER_STATUSES.AGREED_IN_PRINCIPLE];
          break;
        case OFFER_STATUSES.AGREED_IN_PRINCIPLE:
          statusArray = [
            OFFER_STATUSES.ACCEPTED, OFFER_STATUSES.REJECTED,
            OFFER_STATUSES.WITHDRAWN_BY_APPLICANT, OFFER_STATUSES.WITHDRAWN_BY_LANDLORD];
          break;
        case OFFER_STATUSES.COUNTER_OFFER_BY_LL_AGENT:
        case OFFER_STATUSES.COUNTER_OFFER_BY_APPLICANT:
          statusArray = [
            OFFER_STATUSES.AGREED_IN_PRINCIPLE, OFFER_STATUSES.ACCEPTED,
            OFFER_STATUSES.REJECTED, OFFER_STATUSES.WITHDRAWN_BY_APPLICANT,
            OFFER_STATUSES.WITHDRAWN_BY_LANDLORD];
          break;
      }
      statusArray.push(offerStatus);
      offerStatusesLookup.forEach((lookupObj) => {
        if (statusArray.indexOf(lookupObj.index) != -1) {
          this.offerStatuses.push(lookupObj);
        }
      });
    }
  }

}
