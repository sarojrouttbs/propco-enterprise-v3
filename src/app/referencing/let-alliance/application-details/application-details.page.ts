import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PROPCO } from 'src/app/shared/constants';
import { AddressModalPage } from 'src/app/shared/modals/address-modal/address-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchPropertyPage } from 'src/app/shared/modals/search-property/search-property.page';
import { MatStepper } from '@angular/material/stepper';
import { TenantListModalPage } from 'src/app/shared/modals/tenant-list-modal/tenant-list-modal.page';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.page.html',
  styleUrls: ['./application-details.page.scss'],
})
export class ApplicationDetailsPage implements OnInit {
  @ViewChild('stepper', { static: false }) stepper: MatStepper;
  tenancyDetailsForm: FormGroup;
  propertyDetailsForm: FormGroup;
  tenantDetailsForm: FormGroup;
  tenancyDetailsAccordion: any = {};
  propertyDetailsAccordion: any = {};
  tenantDetailsAccordion: any = {};
  propertyId = null;
  lookupdata: any;
  currentStepperIndex = 0;
  hasTenants = false;
  isPropertyTabDetailSubmit;
  isTenantTabDetailSubmit;
  current = 0;
  previous;

  address: any = {
    addressLine1: 'address Line 1',
    addressLine2: 'address Line 2',
    locality: 'address Line 3',
    postcode: 'address Line 4'
  };

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    ) {
  }

  ngOnInit() {
    this.tenancyDetailsAccordion.expanded = true;
    this.propertyDetailsAccordion.expanded = false;
    this.tenantDetailsAccordion.expanded = true;
  }
  
  ionViewDidEnter() {
    this.propertyId = this.route.snapshot.queryParamMap.get('pId');
    this.initiateApplication();
  }

  initiateApplication() {
    if (!this.propertyId) {
      this.searchProperty();
    } else {
      this.getLookupData();
      this.initiateForms();
      //this.initialApiCall();
    }
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }
  }

  private setLookupData(data) {
  }

  async searchProperty() {
    const modal = await this.modalController.create({
      component: SearchPropertyPage,
      cssClass: 'modal-container entity-search',
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
       if (res.data.propertyId) {
         this.propertyId = res.data.propertyId;
         this.initiateApplication();
         //this.selectTenant();
       } else {
         this.router.navigate(['/let-alliance/dashboard'], { replaceUrl: true });
       }
     });
    await modal.present();
  }

  /* async selectTenant() {
    const modal = await this.modalController.create({
      component: TenantListModalPage,
      cssClass: 'modal-container tenant-list',
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
       if (res.data.length > 0) {
         this.hasTenants = true;
         this.initiateApplication();
       } else {
         this.router.navigate(['/let-alliance/dashboard'], { replaceUrl: true });
       }
     });
    await modal.present();
  } */

  private initiateForms() {
    this.initTenancyDetailsForm();
    this.initPropertyDetailsForm();
    this.initTenantDetailTabForm();
  }

  private initTenancyDetailsForm(): void {
    this.tenancyDetailsForm = this.fb.group({
      product: ['', Validators.required],
      occupants: ['', Validators.required],
      tenancyStartDate: [''],
      terms: ['', Validators.required],
      offerNDS: ['', Validators.required],
      referencePaid: ['', Validators.required],
    });
  }

  private initPropertyDetailsForm(): void {
    this.propertyDetailsForm = this.fb.group({
      propertyLetType: ['', Validators.required],
      propertyRent: ['', Validators.required],
    });
  }

  private initTenantDetailTabForm(): void {
    this.tenantDetailsForm = this.fb.group({
      completeMethod: ['', Validators.required],
      product: ['', Validators.required],
      tenantType: [''],
      title: ['', Validators.required],
      otherTitle: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: ['', Validators.required],
      lastName: [''],
      dateOfBirth: ['', Validators.required],
      tenantOtherName: ['', Validators.required],
      tenantTypeTitle: [''],
      foreName: [''],
      otherMiddle: [''],
      otherSurname: [''],
      email: [''],
      maritalStatus: [''],
      nationality: [''],
      registerationNumber: [''],
      rentShare: ['', Validators.required],

    });
  }

  async editAddress() {
    const modal = await this.modalController.create({
      component: AddressModalPage,
      cssClass: 'modal-container'
    });
    await modal.present();
  }

  refresh(){
    location.reload();
  }

  goBack() {
    history.back();
  }

  currentSelected(event): void {
    this.previous = this.current;
    this.current = event;

    switch (this.previous) {
      case 0: {
        this.propertyDetail();
        break;
      }
      case 1: {
        this.tenantDetail();
        break;
      }
      default: {
        break;
      }
    }
  }

  propertyDetail(): void {
    this.isPropertyTabDetailSubmit = true;
    if (this.tenancyDetailsForm.invalid) {
      this.tenancyDetailsForm.markAllAsTouched();
    }

    if (this.propertyDetailsForm.invalid) {
      this.propertyDetailsForm.markAllAsTouched();
    }
  }

  tenantDetail(): void {
    this.isTenantTabDetailSubmit = true;
    if (this.tenancyDetailsForm.invalid) {
      this.tenancyDetailsForm.markAllAsTouched();
    }
  }
}
