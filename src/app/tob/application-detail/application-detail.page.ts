import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PROPCO } from 'src/app/shared/constants';
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
  occupantForm: FormGroup;
  isCoApplicantDeleted: any;
  addressDetailsForm: FormGroup;
  bankDetailsForm: FormGroup;
  applicantQuestionForm: FormGroup;
  tenancyDetailForm: FormGroup;
  propertyType = null; /*0: private , 1:student*/
  showPostcodeLoader: Boolean = null;
  showAddressLoader: Boolean = null;
  addressList: any[];
  guarantorAddressList: any[];
  correspondenceAddressList: any[];
  currentDate = this.commonService.getFormatedDate(new Date());
  maxMoveInDate = this.commonService.getFormatedDate(new Date().setFullYear(new Date().getFullYear() + 5));
  itemList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

  async getApplicantDetails(applicantId: string) {
    this.applicantId = applicantId;
    this._tobService.getApplicantDetails(applicantId).subscribe(res => {
      if (res) {
        this.applicantDetail = res;
        this.disableSearchApplicant = true;
        this.resultsAvailable = false;
        this.searchApplicantForm.get('searchApplicant').setValue('');
        this.patchApplicantDetail();
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
    this.initApplicantQuestionForm();
    this.initTenancyDetailsForm();
  }

  private async initCreateApiCalls() {
    this.getLookUpData();
    this.getTobLookupData();
    this.getPropertyDetails(this.propertyId);
    this.getPropertyClauses(this.propertyId);
    this.getPropertyRestrictions(this.propertyId);
    await this.getApplicantQuestions();
  }

  async initViewApiCalls() {
    this.getLookUpData();
    this.getTobLookupData();
    this.getApplicantQuestions();
  }

  private getPropertyDetails(propertyId) {
    this._tobService.getPropertyDetails(propertyId).subscribe(res => {
      this.propertyDetails = res.data;
      this.propertyType = this.commonService.getLookupValue(this.lookupdata.rentCategories, this.propertyDetails?.rentCategory);
      this.propertyDetails.propertyImageUrl = this.commonService.getHeadMediaUrl(res.data.media || []);
      this.getNoDeposit();
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

  addNewAddressGroup() {
    const add = this.occupantForm.get('coApplicants') as FormArray;
    add.push(this._formBuilder.group({
      street: [],
      city: []
    }))
  }

    initOccupantForm(): void {
      this.occupantForm = this._formBuilder.group({
        coApplicants: this._formBuilder.array([])
      });
    }
  
    getApplicantionApplicantList() {
      (this.occupantForm.get("coApplicants") as FormArray)['controls'].splice(0);
      // this._tobService.getApplicantList(this.applicationId).subscribe(res => {
      //   if (res && res.data) {
      //     this.updateOccupantForm(res.data);
      //   } else {
      //     this.updateOccupantForm([]);
      //   }
      // }, error => {
      // });
    }
  
    addCoApplicant(result) {
      let data = Object.assign({}, result);
      return new Promise((resolve, reject) => {
        // this.applicantService.addOccupantData(data, this.applicationId, this.modifiedById).subscribe((res) => {
        //   return resolve(res.applicantId);
        // }, error => {
        //   return reject(false);
        // });
      });
    }
  
    async setLead(comp: FormGroup) {
      let isLead = comp.controls['isLead'].value;
      let leadApplicatId = comp.controls['applicantId'].value;
  
      let formArray: FormArray = this.formArr;
      if (isLead && comp.controls['aplicationApplicantId'].value) {
        formArray.controls.forEach((currentGroup: FormGroup) => {
          if (leadApplicatId !== currentGroup.controls['applicantId'].value) {
            currentGroup.controls['isLead'].setValue(false);
          }
        });
        this.updateLeadService(this.applicationId, comp.controls['aplicationApplicantId'].value, false);
      } else {
        /*add applicant first */
        let newApplicantId = await this.addCoApplicant(comp.value);
        this.updateLeadService(this.applicationId, newApplicantId, true);
      }
    }
  
    updateLeadService(applicationId, aplicationApplicantId, getApp) {
      // this.showRadio = false;
      // let updateLeadData = {
      //   modifiedById: this.modifiedById,
      //   modifiedBy: "APPLICANT"
      // };
      // this._tobService.updateLead(updateLeadData, applicationId, aplicationApplicantId).subscribe((res) => {
      //   this.commonService.showMessage('Lead occupant has been changed successfully.', 'Lead Occupant', 'success');
      //   if (getApp) {
      //     this.getApplicantionApplicantList();
      //   }
      // }, error => {
      //   this.commonService.showMessage('Something went wrong on server, please try again.', 'Lead Occupant', 'error');
      // });
    }
  
    saveOccupants() {
      let leadApplicantId = '';
      let apiObservableArray = [];
      if (this.checkFormDirty(this.occupantForm) || this.isCoApplicantDeleted) {
        // if (this.selectionType == 'saveForLater') {
        //   this.saveDataLoader = true;
        // }
        let newOccupantData = this.occupantForm.controls['coApplicants'].value.map((result) => {
          if (result.isLead) {
            // leadApplicantId = result.aplicationApplicantId;
            leadApplicantId = result.applicantId;
          }
          if (!result.aplicationApplicantId && result.isAdded && !result.isDeleted) {
            // apiObservableArray.push(this.applicantService.addOccupantData(result, this.applicationId, leadApplicantId));
          }
          if (result.aplicationApplicantId && result.isDeleted) {
            // apiObservableArray.push(this._tobService.removeApplicant({
            //   "deletedById": "",
            //   "deletedBy": "APPLICANT"
            // }, this.applicationId, result.aplicationApplicantId));
          }
        });
      }
  
      setTimeout(() => {
        forkJoin(apiObservableArray).subscribe(() => {
          this.occupantForm.reset(this.occupantForm.value);
          this.getApplicantionApplicantList();
          // if (this.selectionType == 'saveForLater') {
          //   this.onSave();
          // }
        }, error => {
        });
      }, 1000);
    }
  
    createItem() {
      this.formArr.push(this._formBuilder.group({
        surname: ['', [Validators.required, ValidationService.alphabetValidator]],
        forename: ['', [Validators.required, ValidationService.alphabetValidator]],
        email: ['', [Validators.required, ValidationService.emailValidator]],
        mobile: ['', [Validators.required, ValidationService.numberValidator]],
        aplicationApplicantId: null,
        isLead: false,
        createdById: null,
        createdBy: 'APPLICANT',
        isAdded: false,
        isDeleted: false,
        title: '',
        applicantId: ''
      }
      ));
    }
  
    get formArr() {
      return this.occupantForm.get('coApplicants') as FormArray;
    }
  
    removeCoApplicant(group: FormGroup) {
      group.controls['isDeleted'].setValue(true);
      // this.isCoApplicantDeleted = group.controls['isDeleted'].value;
      this.commonService.showMessage('Occupant has been deleted successfully.', 'Delete Occupant', 'error');
    }
  
    addApplicant(control, index) {
      this.formArr.push(this._formBuilder.group({
        surname: control.value.surname,
        forename: control.value.forename,
        email: control.value.email,
        mobile: control.value.mobile,
        aplicationApplicantId: null,
        isLead: false,
        createdById: null,
        createdBy: 'APPLICANT',
        isAdded: true,
        isDeleted: false,
        title: '',
        applicantId: ''
      }
      ));
      this.formArr.removeAt(index);
      this.createItem();
    }
  
    updateOccupantForm(occupantsList) {
      if (Array.isArray(occupantsList) && occupantsList.length > 0) {
        let occupantsArray = this.formArr;
        occupantsList.forEach(element => {
          // if (element.isLead) {
          //   this.modifiedById = element.aplicationApplicantId;
          // }
          // if (this.loggedInUserId === element.applicantId) {
          //   if (element.isLead) {
          //     this.showRadio = true;
          //   }
          //   this.modifiedById = element.applicationApplicantId
          // }
          occupantsArray.push(this._formBuilder.group({
            surname: element.surname,
            forename: element.forename,
            email: element.email,
            mobile: element.mobile,
            aplicationApplicantId: element.applicationApplicantId,
            isLead: element.isLead,
            createdById: null,
            createdBy: 'APPLICANT',
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

  initTenancyDetailsForm(): void {
    this.tenancyDetailForm = this._formBuilder.group({
      moveInDate: ['', Validators.required],
      preferredTenancyEndDate: ['', Validators.required],
      rentDueDay: ['', [Validators.required, Validators.max(31), Validators.min(1)]],
      numberOfAdults: ['', Validators.required],
      numberOfChildren: ['', Validators.required],
      hasSameHouseholdApplicants: [false, Validators.required],
      numberOfHouseHolds: [{ value: '', disabled: false }, Validators.required]
    }, {
      validator: Validators.compose([
        ValidationService.dateLessThan('moveInDate', 'preferredTenancyEndDate')
      ])
    }
    );
  }

  setHouseHoldValue(value) {
    if (value === 1) {
      this.tenancyDetailForm.get('hasSameHouseholdApplicants').disable();
      this.tenancyDetailForm.get('numberOfHouseHolds').disable();
    } else {
      this.tenancyDetailForm.get('hasSameHouseholdApplicants').enable();
      this.tenancyDetailForm.get('numberOfHouseHolds').enable();
    }
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
    this._tobService.getApplicantQuestions().subscribe(async (res)  => {
      if (res && res.data) {
        await this.createQuestionItems(res.data);
        await this.getApplicationQuestionsAnswer(this.applicationId);
      }
    }, error => {
      console.log(error);
    });
  }

  private async getApplicationQuestionsAnswer(applicationId) {
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
      console.log(error);
    });
  }

  private createQuestionItems(questionArray) {
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

    // setTimeout(() => {
    //   forkJoin(apiObservableArray).subscribe(() => {
    //     this.saveDataLoader = false;
    //     this.applicantQuestionForm.reset(this.applicantQuestionForm.value);
    //     if (this.selectionType == 'saveForLater') {
    //       this.onSave();
    //     }
    //   }, error => {
    //     // this.commonService.showMessage(ERROR_MESSAGE.DEFAULT, 'Application Question Answers', 'error');
    //   });
    // }, 1000);
  }

  /** Application Question Functionality **/
}