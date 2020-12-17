import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/shared/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LetAllianceService } from '../let-alliance.service';
import { DatePipe } from '@angular/common';
import { PROPCO } from 'src/app/shared/constants';
import { COMPLETION_METHODS } from 'src/app/shared/constants';
import { forkJoin } from 'rxjs';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';

@Component({
  selector: 'app-guarantor-details',
  templateUrl: './guarantor-details.page.html',
  styleUrls: ['./guarantor-details.page.scss'],
})
export class GuarantorDetailsPage implements OnInit {

  guarantorDetailsForm: FormGroup;
  selectGuarantorForm: FormGroup;
  guarantorDetailsAccordion: any = {};
  guarantorDetails: applicationModels.ITenantResponse;
  applicantId: any;
  applicationId: any;
  lookupdata: any;
  laLookupdata: any;

  guarantorList: any[] = [];

  laProductList: any[] = [];
  laCaseProductList: any[];
  laApplicationProductList: any[];

  isGuarantorTabDetailSubmit;

  managementStatusTypes: any[] = [];
  guarantorTypes: any[] = [];
  titleTypes: any[] = [];
  maritalStatusTypes: any[] = [];
  completionMethods: any[] = COMPLETION_METHODS;

  adultDate = this.datepipe.transform(new Date().setDate(new Date().getDay() - (18 * 365)), 'yyyy-MM-dd');

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private letAllianceService: LetAllianceService,
    public datepipe: DatePipe,
  ) { }

  ngOnInit() {
    this.guarantorDetailsAccordion.expanded = false;
    this.applicationId = this.route.snapshot.queryParamMap.get('applicationId');
    this.applicantId = this.route.snapshot.queryParamMap.get('applicantId');
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
      this.setLALookupData(this.lookupdata);
    } else {
      this.letAllianceService.getLALookupData().subscribe(data => {
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
  }

  private initGuarantorDetailsTabForm(): void {
    this.guarantorDetailsForm = this.fb.group({
      productId: ['', Validators.required],
      title: ['', Validators.required],
      forename: [''],
      middleName: [''],
      surname: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: [''],
      maritalStatus: [''],
      nationality: ['']
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
      this.letAllianceService.getTenantGuarantorList(this.applicantId).subscribe(
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
    if(guarantorId != 0){
      const promise = new Promise((resolve, reject) => {
        this.letAllianceService.getGuarantorDetails(guarantorId).subscribe(
          res => {
            this.guarantorDetails = res ? res : {};
            if(this.guarantorDetails){
              this.initPatching();
            }
            resolve(this.guarantorDetails);
          },
          error => {
            console.log(error);
            resolve();
          }
        );
      });
      return promise;
    }
  }

  getLAProductList() {
    const promise = new Promise((resolve, reject) => {
      this.letAllianceService.getLAProductList().subscribe(
        res => {
          this.laProductList = res ? this.removeDuplicateObjects(res) : [];
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

    this.letAllianceService.createGuarantorApplication(applicationRequestObj).subscribe(
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
        //applicantId: this.guarantorDetails.tenantId,
        applicantItemType: 'G', // not suraj
        case: {
        },
        application: {
          title: this.guarantorDetailsForm.get('title').value,
          forename: this.guarantorDetailsForm.get('forename').value,
          surname: this.guarantorDetailsForm.get('surname').value,
          dateOfBirth: this.datepipe.transform(this.guarantorDetailsForm.get('dateOfBirth').value, 'yyyy-MM-dd'),
          productId: this.guarantorDetailsForm.get('productId').value, 
          sendTenantLink: false,
          autoSubmitLink: false,
          email: this.guarantorDetailsForm.get('email').value,
          maritalStatus: this.guarantorDetailsForm.get('maritalStatus').value,
          nationality: 'British', //this.guarantorDetailsForm.get('nationality').value, // British
          isGuarantor: true,
        }
      };
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

  removeDuplicateObjects(array: any[]) {
    return [...new Set(array.map(res => JSON.stringify(res)))]
      .map(res1 => JSON.parse(res1));
  }

  getLookupValue(index: any, lookup: any) {
    return this.commonService.getLookupValue(index, lookup);
  }

}
