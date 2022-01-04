import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PROPCO, APPLICATION_STATUSES } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { TobService } from '../tob.service';
import { switchMap, debounceTime } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ValidationService } from 'src/app/shared/services/validation.service';


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
  letDurations: OfferModels.ILookupResponse[];
  howLong = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  occupants = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  childrens = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  tenantCurrentPositionTypes: OfferModels.ILookupResponse[];
  applicantGuarantorTypes: OfferModels.ILookupResponse[];
  currentStepperIndex = 0;
  applicantDetailsForm: FormGroup;
  propertyId: any;
  applicationId: any;
  propertyDetails: any;
  propertyClauses;
  propertyRestrictions;
  searchApplicantForm: FormGroup;
  applicantList: Observable<OfferModels.IApplicantLisResponse>;
  applicantDetail: OfferModels.IApplicantDetails;
  disableSearchApplicant: boolean = false;
  applicantId: string;
  resultsAvailable: boolean = null;
  rentFrequencyTypes: OfferModels.ILookupResponse[];
  offerDetails: OfferModels.IOfferResponse;
  occupantForm: FormGroup;
  isCoApplicantDeleted: any;
  addressDetailsForm: FormGroup;
  bankDetailsForm: FormGroup;
  propertyType = null; /*0: private , 1:student*/
  showPostcodeLoader: Boolean = null;
  showAddressLoader: Boolean = null;
  addressList: any[];
  guarantorAddressList: any[];
  correspondenceAddressList: any[];
  applicationsDetails: ApplicationModels.IApplicationResponse;
  applicationApplicantDetails: any[];

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
    this.applicationId = this.route.snapshot.paramMap.get('applicationId');
    if (typeof this.applicationId !== 'undefined' && this.applicationId != null) {
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

  async getApplicantDetails(applicantId: string, index: number) {
    this.applicantId = applicantId;
    this._tobService.getApplicantDetails(applicantId).subscribe(res => {
      if (res) {
        this.applicantDetail = res;
        this.resultsAvailable = false;
        this.searchApplicantForm.get('searchApplicant').setValue('');
        this.patchApplicantDetail();
        this.addSearchApplicant(res, index);
      }
    },
      error => {
      })
  }

  private patchApplicantDetail() {
    this.applicantDetailsForm.patchValue({
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
    this.initApplicantDetailsForm();
    this.initOccupantForm();
    this.initAddressDetailsForm();
    this.initBankDetailsForm();
  }

  private async initCreateApiCalls() {
    this.getLookUpData();
    this.getTobLookupData();
    await this.getPropertyDetails(this.propertyId);
    await this.getPropertyClauses(this.propertyId);
    await this.getPropertyRestrictions(this.propertyId);
    await this.createApplication();
  }

  private async initViewApiCalls() {
    this.getLookUpData();
    this.getTobLookupData();
    this.getApplicationDetails(this.applicationId);
    this.getPropertyDetails(this.propertyId);
    this.getPropertyClauses(this.propertyId);
    this.getPropertyRestrictions(this.propertyId);
    this.getApplicationApplicants(this.applicationId);
  }

  saveApplicantsToApplication() {
    let apiObservableArray = [];
    if (this.checkFormDirty(this.occupantForm) || this.isCoApplicantDeleted) {
      this.occupantForm.controls['coApplicants'].value.map((element) => {
        if (!element.applicantId && !element.applicationApplicantId && element.isAdded && !element.isDeleted) {
          apiObservableArray.push(this._tobService.addApplicantToApplication(this.applicationId, element));
        }

        if (element.applicantId && !element.applicationApplicantId && element.isAdded && !element.isDeleted) {
          apiObservableArray.push(this._tobService.linkApplicantToApplication(this.applicationId, element, element.applicantId));
        }

        if (element.applicationApplicantId && element.isDeleted) {
          apiObservableArray.push(this._tobService.deleteApplicationApplicant(
            this.applicationId, element.applicationApplicantId,
            { "deletedById": element.applicantId, "deletedBy": "APPLICANT" },
          ));
        }
      });
    }

    setTimeout(() => {
      forkJoin(apiObservableArray).subscribe(() => {
        this.isCoApplicantDeleted = null;
        this.occupantForm.reset(this.occupantForm.value);
        this.getApplicationApplicants(this.applicationId);
      }, error => {
      });
    }, 1000);
  }

  getApplicationApplicants(applicationId) {
    return new Promise((resolve, reject) => {
      this._tobService.getApplicationDetails(applicationId).subscribe(
        res => {
          this.applicationsDetails = (res && res.data) ? res.data : [];
          resolve(true);
        },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private getApplicationDetails(applicationId) {
    return new Promise((resolve, reject) => {
      this._tobService.getApplicationApplicants(applicationId).subscribe(
        res => {
          this.applicationApplicantDetails = (res && res.data) ? res.data : [];
          this.updateOccupantForm(this.applicationApplicantDetails);
          resolve(true);
        },
        error => {
          reject(undefined);
        }
      );
    });
  }

  private async createApplication() {
    let requestObj: any = {};
    requestObj.createdBy = 'AGENT';
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

  private getPropertyDetails(propertyId) {
    return new Promise((resolve, reject) => {
      this._tobService.getPropertyDetails(propertyId).subscribe(
        res => {
          if (res) {
            this.getNoDeposit();
            this.propertyDetails = res.data;
            this.propertyType = this.commonService.getLookupValue(this.lookupdata.rentCategories, this.propertyDetails.rentCategory);
            this.propertyDetails.propertyImageUrl = this.commonService.getHeadMediaUrl(res.data.media || []);
            resolve(true);
          }
        },
        error => {
          reject(undefined);
          console.log(error);
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

  private getPropertyClauses(propertyId) {
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
          this.propertyRestrictions = res && res.data ? res.data.filter(result => result.value) : [];
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
  }

  private initSearchForm(): void {
    this.searchApplicantForm = this._formBuilder.group({
      searchApplicant: ''
    });
  }

  private initApplicantDetailsForm(): void {
    this.applicantDetailsForm = this._formBuilder.group({
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

  private setRequired() {
    return [Validators.required];
  }

  isEnable(type) {
    switch (type) {
      case 'guarantor':
        if (this.applicantDetailsForm.value.hasGuarantor) {
          this.applicantDetailsForm.controls.guarantorType.setValidators(this.setRequired());
          this.applicantDetailsForm.controls.guarantorType.enable();
        } else {
          this.applicantDetailsForm.controls.guarantorType.clearValidators();
          this.applicantDetailsForm.get('guarantorType').updateValueAndValidity();
          this.applicantDetailsForm.controls.guarantorType.disable();
        }
        break;
      case 'pets':
        if (this.applicantDetailsForm.value.hasPets) {
          this.applicantDetailsForm.controls.petsInfo.enable();
        }
        else {
          this.applicantDetailsForm.controls.petsInfo.disable();
        }
        break;
    }
  }

  async onCancel() {
    const isCancel: boolean = await this.commonService.showConfirm('Cancel', 'Are you sure, you want to cancel this operation?', '', 'Yes', 'No') as boolean;
    if (isCancel) {
      const propertyId = this.propertyId;
      this.router.navigate([`tob/${propertyId}/applications`], { replaceUrl: true });
    }
  }

  /** Occupants Functionality **/

  initOccupantForm(): void {
    this.occupantForm = this._formBuilder.group({
      coApplicants: this._formBuilder.array([])
    });
  }

  createItem() {
    this.occupantFormArray.push(this._formBuilder.group({
      surname: ['', [Validators.required, ValidationService.alphabetValidator]],
      forename: ['', [Validators.required, ValidationService.alphabetValidator]],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      mobile: ['', [Validators.required, ValidationService.numberValidator]],
      applicationApplicantId: null,
      isLead: false,
      createdById: null,
      createdBy: 'AGENT',
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
      createdBy: 'AGENT',
      isAdded: true,
      isDeleted: false,
      title: '',
      applicantId: ''
    }
    ))
    this.occupantFormArray.removeAt(index);
    this.createItem();
  }

  addSearchApplicant(response: any, index: number) {
    this.occupantFormArray.push(this._formBuilder.group({
      surname: response.surname,
      forename: response.forename,
      email: response.email,
      mobile: response.mobile,
      applicationApplicantId: null,
      isLead: false,
      createdById: null,
      createdBy: 'AGENT',
      isAdded: true,
      isDeleted: false,
      title: '',
      applicantId: response.applicantId
    }
    ))
    this.occupantFormArray.removeAt(index);
    this.createItem();
  }

  removeCoApplicant(group: FormGroup) {
    this.commonService.showConfirm('Remove Applicant', 'Are you sure, you want to remove this applicant ?', '', 'YES', 'NO').then(response => {
      if (response) {
        group.controls['isDeleted'].setValue(true);
        this.isCoApplicantDeleted = group.controls['isDeleted'].value;
      }
    })
  }

  updateOccupantForm(occupantsList) {
    if (Array.isArray(occupantsList) && occupantsList.length > 0) {
      let occupantsArray = this.occupantFormArray;
      occupantsList.forEach(element => {
        occupantsArray.push(this._formBuilder.group({
          surname: element.surname,
          forename: element.forename,
          email: element.email,
          mobile: element.mobile,
          applicationApplicantId: element.applicationApplicantId,
          isLead: element.isLead,
          createdById: null,
          createdBy: 'AGENT',
          isAdded: true,
          isDeleted: false,
          title: '',
          applicantId: element.applicantId
        }));
      });
    }
    this.createItem();
  }

  checkFormDirty(form: any) {
    let dirtyForm = this.commonService.getDirtyValues(form);
    if (Object.keys(dirtyForm).length) {
      return true;
    }
    // else if (this.selectionType == 'saveForLater') {
    //   this.onSave();
    // }
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

  getAddressList(addressType) {
    let postcode;
    switch(addressType) {
      case 'personal':
        postcode = this.addressDetailsForm.controls.address['controls'].postcode;
        postcode.value ? (this.showPostcodeLoader = true) : '';
        break;
      case 'correspondence-address':
        postcode = this.addressDetailsForm.controls.correspondenceAddress['controls'].postcode;
        postcode.value ? (this.showAddressLoader = true) : '';
        break;
      // case 'guarantor':
      //   postcode = this.guarantorForm.controls.address['controls'].postcode;
      //   postcode.value ? (this.showPostcodeLoader = true) : '';
      //   break;
    }
    if (postcode.valid && postcode.value) {
      this.commonService.getPostcodeAddressList(postcode.value).subscribe(
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
          this.correspondenceAddressList = [];
          const data: any = {};
          data.title = 'Postcode Lookup';
          data.message = error.error ? error.error.message : error.message;
          this.commonService.showMessage(data.message, data.title, 'error');
        }
      );
    }
  }

  getAddressDetails(addressId, addressType) {
    this.commonService.getPostcodeAddressDetails(addressId).subscribe(
      res => {
        if (res && res.line1) {
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
              this.addressDetailsForm.controls.correspondenceAddress['controls'].locality.setValue(res.line2);
              this.addressDetailsForm.controls.correspondenceAddress['controls'].town.setValue(res.line5);
              this.addressDetailsForm.controls.correspondenceAddress['controls'].county.setValue(res.provinceName);
              this.addressDetailsForm.controls.correspondenceAddress['controls'].country.setValue(res.countryName);
              break;
            case 'guarantor':
              // this.guarantorForm.controls.address['controls'].addressLine1.setValue(res.line1);
              // this.guarantorForm.controls.address['controls'].addressLine2.setValue(res.line2);
              // // this.guarantorForm['controls'].town.setValue(res.line5);
              // this.guarantorForm.controls.address['controls'].county.setValue(res.provinceName);
              // this.guarantorForm.controls.address['controls'].country.setValue(res.countryName);
              // break;
          }
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
}