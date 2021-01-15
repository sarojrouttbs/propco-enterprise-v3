import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/shared/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PROPCO, REFERENCING, REFERENCING_TENANT_TYPE } from 'src/app/shared/constants';
import { COMPLETION_METHODS } from 'src/app/shared/constants';
import { forkJoin } from 'rxjs';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';
import { ReferencingService } from '../../referencing.service';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'la-guarantor-details',
  templateUrl: './guarantor-details.page.html',
  styleUrls: ['./guarantor-details.page.scss'],
})
export class GuarantorDetailsPage implements OnInit {

  guarantorDetailsForm: FormGroup;
  selectGuarantorForm: FormGroup;
  guarantorDetailsAccordion: any = {};
  guarantorDetails: letAllianceModels.IGuarantorResponse;
  applicantId: any;
  applicationId: any;
  lookupdata: any;
  referencingLookupdata: any;

  guarantorList: any[] = [];

  referencingProductList: any[] = [];
  referencingCaseProductList: any[];
  referencingApplicationProductList: any[];

  isGuarantorTabDetailSubmit: boolean;

  managementStatusTypes: any[] = [];
  guarantorTypes: any[] = [];
  titleTypes: any[] = [];
  maritalStatusTypes: any[] = [];
  nationList: any[] = [];
  completionMethods: any[] = COMPLETION_METHODS;
  referenceNumber: any;
  tenantTypes: any[] = [];

  adultDate = this.datepipe.transform(new Date().setDate(new Date().getDay() - (18 * 365)), 'yyyy-MM-dd');

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private referencingService: ReferencingService,
    public datepipe: DatePipe,
    private currencyPipe: CurrencyPipe
  ) { }

  ngOnInit() {
    this.guarantorDetailsAccordion.expanded = true;
    this.applicationId = this.route.snapshot.queryParamMap.get('applicationId');
    this.applicantId = this.route.snapshot.queryParamMap.get('applicantId');
    this.referenceNumber = this.route.snapshot.queryParamMap.get('referenceNumber');
    this.initiateApplication();
  }

  ionViewDidEnter() {
  }

  initiateApplication() {
    if(this.applicantId && this.applicationId){
      this.getLookupData();
      this.initGuarantorDetailsTabForm();
      this.initSelectGuarantorForm();
      this.initialApiCall();
    }
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.referencingLookupdata = this.commonService.getItem(PROPCO.REFERENCING_LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }

    if (this.referencingLookupdata) {
      this.setReferencingLookupData(this.referencingLookupdata);
    } else {
      this.referencingService.getLookupData(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(data => {
        this.commonService.setItem(PROPCO.REFERENCING_LOOKUP_DATA, data);
        this.referencingLookupdata = data;
        this.setReferencingLookupData(data);
      });
    }
  }

  private setLookupData(data: any): void {
    this.nationList = data.tenantNations;
  }

  private setReferencingLookupData(data: any): void {
    this.managementStatusTypes = data.managementStatusTypes;
    this.guarantorTypes = data.guarantorTypes;
    this.titleTypes = data.titleTypes;
    this.maritalStatusTypes = data.maritalStatusTypes;
    this.tenantTypes = data.tenantTypes;
  }

  private initGuarantorDetailsTabForm(): void {
    this.guarantorDetailsForm = this.fb.group({
      completeMethod: [{ value: 2, disabled: true }],
      productId: ['', Validators.required],
      tenantTypeId: [1, Validators.required],
      title: ['', Validators.required],
      otherTitle: [''],
      companyName: [''],
      forename: [''],
      middlename: [''],
      surname: [''],
      dateOfBirth: ['', Validators.required],
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

  private initSelectGuarantorForm(): void {
    this.selectGuarantorForm = this.fb.group({
      guarantor: ['a1']
    });
  }

  private async initialApiCall() {
    this.commonService.showLoader();
    forkJoin([
      this.getTenantGuarantorList(),
      this.getProductList()
    ]).subscribe(async (values) => {
      this.setValidatorsForForms();
    });
  }

  getTenantGuarantorList() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getTenantGuarantorList(this.applicantId).subscribe(
        res => {
          this.guarantorList = res && res.data? res.data : [];
          resolve(this.referencingProductList);
        },
        error => {
          console.log(error);
          resolve(this.referencingProductList);
      });
    });

    return promise;
  }

  getGuarantorDetails(guarantorId: any) {
    if(guarantorId == 'a1'){
      this.initGuarantorDetailsTabForm();
      this.guarantorDetails = {} as letAllianceModels.IGuarantorResponse;
    }
    else{
      const promise = new Promise((resolve, reject) => {
        this.referencingService.getGuarantorDetails(guarantorId).subscribe(
          res => {
            this.guarantorDetails = res ? res : {};
            if(this.guarantorDetails){
              this.initPatching();
            }
            resolve(this.guarantorDetails);
          },
          error => {
            console.log(error);
            resolve(this.guarantorDetails);
          }
        );
      });
      return promise;
    }
  }

  getProductList() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getProductList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(
        res => {
          this.referencingProductList = res ? this.commonService.removeDuplicateObjects(res) : [];
          this.referencingCaseProductList = this.referencingProductList.filter(obj => {
            return obj.productName.includes('Per Property');
          });
  
          this.referencingApplicationProductList = this.referencingProductList.filter(obj => {
            return !obj.productName.includes('Per Property');
          });
          resolve(this.referencingProductList);
        },
        error => {
          console.log(error);
          resolve(this.referencingProductList);
      });
    });

    return promise;
  }

  private initPatching(): void {
    this.guarantorDetailsForm.patchValue({
      title: this.guarantorDetails.title,
      forename: this.guarantorDetails.forename,
      surname: this.guarantorDetails.surname,
      dateOfBirth: this.guarantorDetails.dateOfBirth,
      email: this.guarantorDetails.email,
      maritalStatus: this.guarantorDetails.maritalStatus,
      nationality: this.guarantorDetails.nationality,
      rentShare: 0
    });
  }
  
  setValidatorsForForms() {
    if (this.guarantorDetailsForm.get('tenantTypeId').value == REFERENCING_TENANT_TYPE.INDIVIDUAL) {
      this.guarantorDetailsForm.get('forename').setValidators(Validators.required);
      this.guarantorDetailsForm.get('surname').setValidators(Validators.required);
      this.guarantorDetailsForm.get('maritalStatus').setValidators(Validators.required);
      this.guarantorDetailsForm.get('companyName').clearValidators();
      this.guarantorDetailsForm.get('registrationNumber').clearValidators();

      if(this.guarantorDetailsForm.get('hasTenantOtherName').value){
        this.guarantorDetailsForm.get('otherNames').get('forename').setValidators(Validators.required);
        this.guarantorDetailsForm.get('otherNames').get('surname').setValidators(Validators.required);
        
      }
      else{
        this.guarantorDetailsForm.get('otherNames').get('forename').clearValidators();
        this.guarantorDetailsForm.get('otherNames').get('surname').clearValidators();
      }
    } 

    else if (this.guarantorDetailsForm.get('tenantTypeId').value == REFERENCING_TENANT_TYPE.COMPANY) {
      this.guarantorDetailsForm.get('companyName').setValidators(Validators.required);
      this.guarantorDetailsForm.get('registrationNumber').setValidators(Validators.required);
      this.guarantorDetailsForm.get('forename').clearValidators();
      this.guarantorDetailsForm.get('surname').clearValidators();
      this.guarantorDetailsForm.get('maritalStatus').clearValidators();
      this.guarantorDetailsForm.get('otherNames').get('title').clearValidators();

      if(this.guarantorDetailsForm.get('hasTenantOtherName').value){
        this.guarantorDetailsForm.get('otherNames').get('forename').setValidators(Validators.required);
        this.guarantorDetailsForm.get('otherNames').get('surname').setValidators(Validators.required);
        
      }
      else{
        this.guarantorDetailsForm.get('otherNames').get('forename').clearValidators();
        this.guarantorDetailsForm.get('otherNames').get('surname').clearValidators();
      }
    }

    this.guarantorDetailsForm.get('forename').updateValueAndValidity();
    this.guarantorDetailsForm.get('surname').updateValueAndValidity();
    this.guarantorDetailsForm.get('companyName').updateValueAndValidity();
    this.guarantorDetailsForm.get('registrationNumber').updateValueAndValidity();
    this.guarantorDetailsForm.get('maritalStatus').updateValueAndValidity();
    this.guarantorDetailsForm.get('otherNames').get('forename').updateValueAndValidity();
    this.guarantorDetailsForm.get('otherNames').get('surname').updateValueAndValidity();
  }

  onBlurCurrency(val: any, form: FormGroup) {
    if (!val) {
      if (form == this.guarantorDetailsForm) {
        this.guarantorDetailsForm.patchValue({
          rentShare: 0
        });
      }
    }
  }

  refresh(){
    location.reload();
  }

  goBack() {
    history.back();
  }

  checkTenantDetailsTabValidation(): void {
    this.isGuarantorTabDetailSubmit = true;
    if (this.guarantorDetailsForm.invalid) {
      this.guarantorDetailsForm.markAllAsTouched();
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

    this.referencingService.createGuarantorApplication(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, applicationRequestObj, this.applicationId).subscribe(
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
        console.log(error);
      }
    );
  }

  private checkFormsValidity(): any {
    return new Promise((resolve, reject) => {
      let valid = false;
      const isValidGuarantorDetailsForm = this.guarantorDetailsForm.valid;
      if (!isValidGuarantorDetailsForm) {
        this.checkTenantDetailsTabValidation();
      }

      if (isValidGuarantorDetailsForm) {
        valid = true;
      }
      return resolve(valid);
    });
  }

  private createApplicationFormValues(): any {
    const applicationDetails =
      {
        applicantId: this.guarantorDetails ? this.guarantorDetails.guarantorId : 'a1',
        applicantItemType: 'G',
        case: {
        },
        
        application: {
          productId: this.guarantorDetailsForm.get('productId').value,
          tenantTypeId: this.guarantorDetailsForm.get('tenantTypeId').value,
          title: this.guarantorDetailsForm.get('title').value ? (this.guarantorDetailsForm.get('title').value).toString() : '',
          otherTitle: this.guarantorDetailsForm.get('otherTitle').value,
          forename: this.guarantorDetailsForm.get('tenantTypeId').value == REFERENCING_TENANT_TYPE.INDIVIDUAL ? this.guarantorDetailsForm.get('forename').value : this.guarantorDetailsForm.get('companyName').value,
          middlename: this.guarantorDetailsForm.get('middlename').value,
          surname: this.guarantorDetailsForm.get('surname').value,
          email: this.guarantorDetailsForm.get('email').value,
          dateOfBirth: this.datepipe.transform(this.guarantorDetailsForm.get('dateOfBirth').value, 'yyyy-MM-dd'),
          rentShare: parseFloat(this.guarantorDetailsForm.get('rentShare').value),
          maritalStatus: this.guarantorDetailsForm.get('maritalStatus').value,
          nationality: this.getLookupValue(this.guarantorDetailsForm.get('nationality').value, this.nationList),
          registrationNumber: this.guarantorDetailsForm.get('registrationNumber').value,
          sendTenantLink: true,
          autoSubmitLink: true,
          isGuarantor: true,
          hasTenantOtherName: this.guarantorDetailsForm.get('hasTenantOtherName').value,
          otherNames: this.guarantorDetailsForm.get('hasTenantOtherName').value ? [this.guarantorDetailsForm.get('otherNames').value] : [],
          status: 0
        }
      };

      if(applicationDetails.applicantId == 'a1'){
        delete applicationDetails.applicantId;
      }

    return applicationDetails;
  }

  async cancelApplication(){
    const modal = await this.modalController.create({
      component: SimpleModalPage,
      cssClass: 'modal-container alert-prompt',
      backdropDismiss: false,
      componentProps: {
        data: `<div class="center-block">The data entered has not been saved. Are you sure?
        </div>`,
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
        this.router.navigate(['/let-alliance/dashboard'], {replaceUrl: true });
      } 
    });

    await modal.present();
  }

  getLookupValue(index: any, lookup: any) {
    return this.commonService.getLookupValue(index, lookup);
  }

}
