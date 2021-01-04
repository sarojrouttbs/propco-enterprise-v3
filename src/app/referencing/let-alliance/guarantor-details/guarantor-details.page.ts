import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/shared/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PROPCO, REFERENCING } from 'src/app/shared/constants';
import { COMPLETION_METHODS } from 'src/app/shared/constants';
import { forkJoin } from 'rxjs';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';
import { ReferencingService } from '../../referencing.service';

@Component({
  selector: 'app-guarantor-details',
  templateUrl: './guarantor-details.page.html',
  styleUrls: ['./guarantor-details.page.scss'],
})
export class GuarantorDetailsPage implements OnInit {

  guarantorDetailsForm: FormGroup;
  selectGuarantorForm: FormGroup;
  guarantorDetailsAccordion: any = {};
  guarantorDetails: applicationModels.IGuarantorResponse;
  applicantId: any;
  applicationId: any;
  lookupdata: any;
  laLookupdata: any;

  guarantorList: any[] = [];

  laProductList: any[] = [];
  laCaseProductList: any[];
  laApplicationProductList: any[];

  isGuarantorTabDetailSubmit: boolean;

  managementStatusTypes: any[] = [];
  guarantorTypes: any[] = [];
  titleTypes: any[] = [];
  maritalStatusTypes: any[] = [];
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
    this.guarantorDetailsAccordion.expanded = false;
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
      this.initialApiCall();
    }
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
      this.setLALookupData(this.laLookupdata);
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
    this.guarantorTypes = this.laLookupdata.guarantorTypes;
    this.titleTypes = this.laLookupdata.titleTypes;
    this.maritalStatusTypes = this.laLookupdata.maritalStatusTypes;
    this.tenantTypes = this.laLookupdata.tenantTypes;
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
      surname: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: [''],
      maritalStatus: ['', [Validators.required]],
      nationality: [''],
      registerationNumber: [''],
      hasTenantOtherName: [false],
      otherNames: this.fb.group({
        title: '',
        forename: [''],
        middlename: [''],
        surname: ['']
      }),
    });

    this.selectGuarantorForm = this.fb.group({
      guarantor: ['']
    });
  }

  private async initialApiCall() {
    this.commonService.showLoader();
    forkJoin([
      this.getTenantGuarantorList(),
      this.getLAProductList()
    ]).subscribe(async (values) => {
      //this.setValidatorsForForms();
    });
  }

  getTenantGuarantorList() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getTenantGuarantorList(this.applicantId).subscribe(
        res => {
          this.guarantorList = res && res.data? res.data : [];
          resolve(this.laProductList);
        },
        error => {
          console.log(error);
          resolve(this.laProductList);
      });
    });

    return promise;
  }

  getGuarantorDetails(guarantorId: any) {
    if(guarantorId == 0){
      this.initGuarantorDetailsTabForm();
      this.guarantorDetails = {} as applicationModels.IGuarantorResponse;
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

  getLAProductList() {
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
    this.guarantorDetailsForm.patchValue({
      title: this.guarantorDetails.title,
      forename: this.guarantorDetails.forename,
      surname: this.guarantorDetails.surname,
      dateOfBirth: this.guarantorDetails.dateOfBirth,
      email: this.guarantorDetails.email,
      maritalStatus: this.guarantorDetails.maritalStatus,
      nationality: this.guarantorDetails.nationality,
    });
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
        this.commonService.showMessage('Something went wrong on server, please try again.', 'Create an Application', 'Error');
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
        applicantId: this.guarantorDetails.guarantorId ? this.guarantorDetails.guarantorId : '',
        applicantItemType: 'G',
        case: {
        },
        application: {
          productId: this.guarantorDetailsForm.get('productId').value,
          tenantTypeId: this.guarantorDetailsForm.get('tenantTypeId').value,
          title: (this.guarantorDetailsForm.get('title').value).toString(),
          otherTitle: this.guarantorDetailsForm.get('otherTitle').value,
          forename: this.guarantorDetailsForm.get('forename').value,
          middlename: this.guarantorDetailsForm.get('middlename').value,
          surname: this.guarantorDetailsForm.get('surname').value,
          email: this.guarantorDetailsForm.get('email').value,
          dateOfBirth: this.datepipe.transform(this.guarantorDetailsForm.get('dateOfBirth').value, 'yyyy-MM-dd'),
          maritalStatus: this.guarantorDetailsForm.get('maritalStatus').value,
          nationality: 'British', //this.tenantDetailsForm.get('nationality').value, // British
          //registerationNumber: this.tenantDetailsForm.get('registerationNumber').value,
          sendTenantLink: false,
          autoSubmitLink: false,
          isGuarantor: true,
          hasTenantOtherName: this.guarantorDetailsForm.get('hasTenantOtherName').value,
          otherNames: this.guarantorDetailsForm.get('hasTenantOtherName').value ? [this.guarantorDetailsForm.get('otherNames').value] : []
        }
      };

      if(applicationDetails.applicantId === ''){
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
        this.router.navigate(['/let-alliance/dashboard'], {replaceUrl: true });
      } 
    });

    await modal.present();
  }

  getLookupValue(index: any, lookup: any) {
    return this.commonService.getLookupValue(index, lookup);
  }

}
