import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { TobService } from '../tob.service';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { NegotiateModalPage } from 'src/app/shared/modals/negotiate-modal/negotiate-modal.page';

@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.page.html',
  styleUrls: ['./offer-detail.page.scss'],
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

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private _formBuilder: FormBuilder,
    private _tobService: TobService,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('propertyId');
    this.offerId = this.route.snapshot.paramMap.get('offerId');

    // if (typeof this.offerId !== 'undefined' && this.offerId != null) {
    //   // this.getOfferDetails(this.offerId);
    // }
    // else if (typeof this.propertyId !== 'undefined' && this.propertyId != null) {
    //   // this.isUpdateoffer = false;

    // }
    this.initForms();
    this.initApiCalls();
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

  getApplicantDetails(applicantId: string) {
    this.applicantId = applicantId;
    this._tobService.getApplicantDetails(applicantId).subscribe(res => {
      if (res) {
        this.applicantDetail = res;
        this.disableSearchApplicant = true;
        this.resultsAvailable = false;
        this.searchApplicantForm.get('searchApplicant').setValue('');
      }
    },
      error => {
      })
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

  initForms() {
    this.initSearchForm();
    this.initMakeAnOfferForm();
    this.initConfirmationForm();
  }

  initApiCalls() {
    this.getLookUpData();
    this.getTobLookupData();
    this.getPropertyDetails(this.propertyId);
    this.getPropertyClauses(this.propertyId);
    this.getPropertyRestrictions(this.propertyId);
  }

  private getPropertyDetails(propertyId) {
    this._tobService.getPropertyDetails(propertyId).subscribe(res => {
      this.propertyDetails = res.data;
      this.propertyDetails.propertyImageUrl = this.commonService.getHeadMediaUrl(res.data.media || []);
      // this.propertyDetails.minRent = this.propertyDetails.advertisementRent * 90 / 100;
      // this.propertyDetails.maxRent = this.propertyDetails.advertisementRent * 110 / 100;
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
        this.submitOffer();
      }
    }
  }

  private submitOffer() {
    if (this.makeAnOfferForm.valid) {
      this.updateApplicantDetails();
      this._tobService.createOffer(this.prepareCreateOffer()).subscribe(res => {
        this.commonService.showMessage('Your offer has been created successfully.', 'Offer', 'success');
        // this.router.navigate(['applicant/my-offers']);
      }, error => {
        this.commonService.showMessage(error.error ? error.error.message : error.message, 'Offer', 'error');
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

  prepareCreateOffer(): object{
    const offerFormValues = this.makeAnOfferForm.value;
    const confirmationForm = this.confirmationForm.value;
    const requestObj: any = {};
    requestObj.entityType = 'AGENT';
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
    requestObj.comments = confirmationForm.comments
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

  getTobLookupData() {
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
      comments: ''
    });
  }


  setRequired() {
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
        } else {
          this.confirmationForm.controls.applicantConfirmedDate.clearValidators();
          this.confirmationForm.get('applicantConfirmedDate').updateValueAndValidity();
          this.confirmationForm.controls.applicantConfirmedDate.disable();
        }
        break;
      case 'landlord':
        if (this.confirmationForm.value.isLandlordConfirmed) {
          this.confirmationForm.controls.landlordConfirmedDate.setValidators(this.setRequired());
          this.confirmationForm.controls.landlordConfirmedDate.enable();
        } else {
          this.confirmationForm.controls.landlordConfirmedDate.clearValidators();
          this.confirmationForm.get('landlordConfirmedDate').updateValueAndValidity();
          this.confirmationForm.controls.landlordConfirmedDate.disable();
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

}
