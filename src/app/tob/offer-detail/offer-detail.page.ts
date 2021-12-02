import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { TobService } from '../tob.service';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
  letDurations: any[];
  howLong = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  occupants = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  childrens = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  tenantCurrentPositionTypes: any[];
  applicantGuarantorTypes: any[];
  offerStatuses: any[];
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
  applicantList: Observable<OfferModels.IApplicantResponse>;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private _formBuilder: FormBuilder,
    private _tobService: TobService
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
    this.applicantList = this.searchApplicantForm.get('searchApplicant').valueChanges.pipe(debounceTime(300),
    switchMap((value: string) => (value && value.length > 2) ? this.searchApplicant(value) : new Observable()));

  }

  onSearch(event: any) {
    // this.applicantList = this.searchApplicantForm.get('searchApplicant').valueChanges.pipe(debounceTime(300),
      // switchMap((value: string) => (value && value.length) ? this.searchApplicant(value) : new Observable()));
  }

  onSelectionChange(applicantId){
    console.log(applicantId)
  }

  private searchApplicant(value: any): Observable<any> {
    let response = this._tobService.searchApplicant(value);
    response.subscribe(res => { },
      error => {
        console.log(error);
      }
    );
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

  private submitOffer() {
    if (this.makeAnOfferForm.valid) {
      // this.showLoader = true;
      const offerFormValues = this.makeAnOfferForm.value;
      const confirmationForm = this.confirmationForm.value;
      const requestObj: any = {};
      requestObj.entityType = 'AGENT';
      requestObj.status = 0; //create default status is 0 = unknown
      requestObj.propertyId = this.propertyId;
      requestObj.amount = offerFormValues.amount;
      requestObj.comments = offerFormValues.comments;
      requestObj.moveInDate = this.commonService.getFormatedDate(offerFormValues.moveInDate);
      requestObj.rentingTime = offerFormValues.rentingTime;
      requestObj.numberOfAdults = offerFormValues.numberOfAdults;
      requestObj.numberOfChildren = offerFormValues.numberOfChildren;
      requestObj.isApplicantConfirmed = confirmationForm.isApplicantConfirmed,
        requestObj.applicantConfirmedDate = confirmationForm.applicantConfirmedDate,
        requestObj.isLandlordConfirmed = confirmationForm.isLandlordConfirmed,
        requestObj.landlordConfirmedDate = confirmationForm.landlordConfirmedDate,
        requestObj.sendEmailToApplicant = confirmationForm.sendEmailToApplicant,
        requestObj.sendEmailToLandlord = confirmationForm.sendEmailToLandlord,
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

      // this.updateApplicantDetails();
      this._tobService.createOffer(requestObj).subscribe(res => {
        this.commonService.showMessage('Your offer has been created successfully.', 'Offer', 'success');
        // this.router.navigate(['applicant/my-offers']);
        // this.showLoader = false;
      }, error => {
        // this.showLoader = false;
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
      status: ['', Validators.required],
      moveInDate: [''],
      rentingTime: [''],
      numberOfAdults: ['1'],
      numberOfChildren: [''],
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

  async presentModal(clauseObj, type) {
    let headingText = (type === 'CLAUSE') ? 'Clause - ' + clauseObj.clauseName : 'Restriction - ' + clauseObj.restrictionName;
    clauseObj.negotiations = clauseObj.negotiations ? clauseObj.negotiations : [];
    // let offerStatus = this.offerDetails ? this.offerDetails.status : '';
    // const modal = await this.modalController.create({
    //   component: NotesModalPage,
    //   componentProps: {
    //     data: clauseObj,
    //     heading: headingText,
    //     offerStatus: offerStatus,
    //   }
    // });

    // const data = modal.onDidDismiss().then(res => {
    // });
    // await modal.present();
  }

}
