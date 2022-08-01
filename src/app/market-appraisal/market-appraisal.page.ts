import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BookMaModalPage } from '../shared/modals/book-ma-modal/book-ma-modal.page';
import { DATE_FORMAT, MARKET_APPRAISAL } from '../shared/constants';
import { CommonService } from '../shared/services/common.service';
import { ValidationService } from '../shared/services/validation.service';
import { MarketAppraisalService } from './market-appraisal.service';
@Component({
  selector: 'app-market-appraisal',
  templateUrl: './market-appraisal.page.html',
  styleUrls: ['./market-appraisal.page.scss'],
})
export class MarketAppraisalPage implements OnInit {

  type = MARKET_APPRAISAL.contact_type;
  maForm: FormGroup;
  DATE_FORMAT = DATE_FORMAT;
  
  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder,
    private maService: MarketAppraisalService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.maForm = this.formBuilder.group({
      contactForm: this.formBuilder.group({
        landlordUuid: null,
        heardReason: ['', Validators.required],
        officeCode: ['', Validators.required],
        enquiryNotes: [''],
        landlordStatus: [''],
        mobile: ['', [Validators.required, Validators.maxLength(15), ValidationService.numberValidator]],
        homeTelephone: ['', [Validators.required, Validators.maxLength(15)]],
        businessTelephone: ['', [Validators.required, Validators.maxLength(15)]],
        email: ['', [Validators.required, ValidationService.emailValidator]],
        title: ['', [Validators.required]],
        forename: ['', [Validators.required]],
        middleName: [''],
        surname: ['', [Validators.required]],
        address: this.formBuilder.group({
          postcode: ['', Validators.required],
          addressLine1: [''],
          addressLine2: [''],
          addressLine3: [''],
          buildingName: [''],
          buildingNumber: [''],
          country: [''],
          county: [''],
          locality: [''],
          town: [''],
          pafReference: ['']
        }),
        displayAs: ['', Validators.required],
        owners: [{ value: '', disabled: true }],
        ownership: [''],
        addressee: [''],
        salutation: [''],
        initials: ['']
      }),
      propertyForm: this.formBuilder.group({
        propertyId: null,
        address: this.formBuilder.group({
          postcode: ['', Validators.required],
          addressLine1: [''],
          addressLine2: [''],
          addressLine3: [''],
          buildingName: [''],
          buildingNumber: [''],
          country: [''],
          county: [''],
          locality: [''],
          town: [''],
          pafReference: ['']
        }),
        availableFromDate: ['', Validators.required],
        availableToDate: null,
        direction: '',
        furnishingType: '',
        hasLetBefore: null,
        houseType: '',
        isStudio: null,
        landlordId: null,
        lettingDuration: ['', Validators.required],
        lettingReason: '',
        office: ['', Validators.required],
        onWithOtherAgent: null,
        parking: '',
        propertyAge: '',
        propertyLocations: [[]],
        propertyNotes: '',
        propertyStyle: '',
        rentRange: this.formBuilder.group({
          maximum: ['', [Validators.required, ValidationService.rentRaneToVal]],
          minimum: ['', Validators.required],
        }),
        status: [null, Validators.required],
        agentName: '',
        advertisementRentFrequency: '',
        numberOfBedroom: ''
      })
    });
  }

  cancel() {
    this.commonService.showConfirm('Market Appraisal', 'Are you sure you want to cancel?', '', 'Yes', 'No').then(async res => {
      if (res) {
        this.router.navigate(['agent/dashboard'], { replaceUrl: true });
      }
    });
  }

  changeSegment() {
    if (this.type === MARKET_APPRAISAL.contact_type) {
      this.type = MARKET_APPRAISAL.property_type;
    } else {
      this.type = MARKET_APPRAISAL.contact_type;
    }
  }

  async saveWithoutBooking() {
    if (this.type === MARKET_APPRAISAL.contact_type) {
      if (!this.maForm.get('contactForm').valid) {
        this.maForm.get('contactForm').markAllAsTouched();
        return;
      }
    }
    if (this.type === MARKET_APPRAISAL.property_type) {
      if (!this.maForm.get('propertyForm').valid) {
        this.maForm.get('propertyForm').markAllAsTouched();
        return;
      }
      if (!this.maForm.get('contactForm').valid) {
        this.changeSegment();
        this.maForm.get('contactForm').markAllAsTouched();
        return;
      }
    }

    /**Existing Landloard**/
    if (this.maForm.get('contactForm').value.landlordUuid && !this.maForm.get('propertyForm').value.propertyId) {
      /**Scenario 4 : Existing LL - No Property**/
      if (this.maForm.get('contactForm').valid && !this.maForm.get('propertyForm').valid) {
        const confirm = await this.commonService.showConfirm('Market Appraisal', 'Do you wish to continue without creating a property? If No, please fill all the mandatory fields.', '', 'Yes', 'No');
        if (confirm) {
          const landlordUpdate = await this.updateLandlord();
          if (landlordUpdate) {
            this.commonService.showAlert('Market Appraisal', 'Contact ' + this.maForm.getRawValue().contactForm.displayAs + ' has been updated successfully').then(res => {
              if (res) {
                this.router.navigate(['agent/dashboard'], { replaceUrl: true });
              }
            });

          }
        }
        else {
          this.type = MARKET_APPRAISAL.property_type;
        }
        return;
      }
      /**Scenario 2 : Existing LL - New Property**/
      if (this.maForm.get('contactForm').valid && this.maForm.get('propertyForm').valid) {
        const landlordUpdated = await this.updateLandlord() as any;
        if (landlordUpdated) {
          const payload = this.commonService.removeEmpty(Object.assign({}, this.maForm.get('propertyForm').value));
          payload.landlordId = this.maForm.get('contactForm').value.landlordUuid;
          payload.status = parseInt(payload.status);
          if (payload.availableFromDate) {
            payload.availableFromDate = this.commonService.getFormatedDate(payload.availableFromDate, this.DATE_FORMAT.YEAR_DATE);
          }
          if (payload.availableToDate) {
            payload.availableToDate = this.commonService.getFormatedDate(payload.availableToDate, this.DATE_FORMAT.YEAR_DATE);
          }
          const propertyCreated = await this.createProperty(payload);
          if (propertyCreated) {
            this.commonService.showAlert('Market Appraisal', 'The Contact and/or the Property and their association has been created/modified successfully').then(res => {
              if (res) {
                this.router.navigate(['agent/dashboard'], { replaceUrl: true });
              }
            });

          }
        }
        return;
      }
    }
    /**Existing Landlord & Property*/
    if (this.maForm.get('contactForm').value.landlordUuid && this.maForm.get('propertyForm').value.propertyId) {
      /**Scenario 4 : Existing LL - No Property**/
      if (this.maForm.get('contactForm').valid && !this.maForm.get('propertyForm').valid) {
        const confirm = await this.commonService.showConfirm('Market Appraisal', 'Do you wish to continue without creating a property? If No, please fill all the mandatory fields.', '', 'Yes', 'No');
        if (confirm) {
          const landlordUpdate = await this.updateLandlord();
          if (landlordUpdate) {
            this.commonService.showAlert('Market Appraisal', 'Contact ' + this.maForm.getRawValue().contactForm.displayAs + ' has been updated successfully').then(res => {
              if (res) {
                this.router.navigate(['agent/dashboard'], { replaceUrl: true });
              }
            });

          }
        }
        else {
          this.type = MARKET_APPRAISAL.property_type;
        }
        return;
      }
      /**Scenatio 3: Existing Landlord & Existing Property*/
      if (this.maForm.get('contactForm').valid && this.maForm.get('propertyForm').valid) {
        const landlordUpdated = await this.updateLandlord() as any;
        if (landlordUpdated) {
          const payload = this.commonService.removeEmpty(Object.assign({}, this.maForm.get('propertyForm').value));
          payload.landlordId = this.maForm.get('contactForm').value.landlordUuid;
          payload.status = parseInt(payload.status);
          if (payload.availableFromDate) {
            payload.availableFromDate = this.commonService.getFormatedDate(payload.availableFromDate, this.DATE_FORMAT.YEAR_DATE);
          }
          if (payload.availableToDate) {
            payload.availableToDate = this.commonService.getFormatedDate(payload.availableToDate, this.DATE_FORMAT.YEAR_DATE);
          }
          const propertyUpdated = await this.updateProperty(payload);
          if (propertyUpdated) {
            this.commonService.showAlert('Market Appraisal', 'The Contact and/or the Property and their association has been created/modified successfully').then(res => {
              if (res) {
                this.router.navigate(['agent/dashboard'], { replaceUrl: true });
              }
            });

          }
        }
        return;
      }
      /**Scenario 4 : Existing LL - No Property**/
      if (this.maForm.get('contactForm').valid && this.maForm.get('propertyForm').valid) {
        const confirm = await this.commonService.showConfirm('Market Appraisal', 'Do you wish to continue without creating a property? If No, please fill all the mandatory fields.', '', 'Yes', 'No');
        if (confirm) {
          const landlordUpdate = await this.updateLandlord();
          if (landlordUpdate) {
            this.commonService.showAlert('Market Appraisal', 'Contact ' + this.maForm.getRawValue().contactForm.displayAs + ' has been updated successfully').then(res => {
              if (res) {
                this.router.navigate(['agent/dashboard'], { replaceUrl: true });
              }
            });

          }
        }
        else {
          this.type = MARKET_APPRAISAL.property_type;
        }
        return;
      }
    }
    /**Scenario 1 : New Landlord - New Property**/
    if (this.maForm.get('contactForm').valid && this.maForm.get('propertyForm').valid) {
      const landlordCreated = await this.createLandlord() as any;
      if (landlordCreated) {
        const payload = this.commonService.removeEmpty(Object.assign({}, this.maForm.get('propertyForm').value));
        payload.landlordId = landlordCreated.landlordId;
        payload.status = parseInt(payload.status);
        if (payload.availableFromDate) {
          payload.availableFromDate = this.commonService.getFormatedDate(payload.availableFromDate, this.DATE_FORMAT.YEAR_DATE);
        }
        if (payload.availableToDate) {
          payload.availableToDate = this.commonService.getFormatedDate(payload.availableToDate, this.DATE_FORMAT.YEAR_DATE);
        }
        const propertyCreated = await this.createProperty(payload);
        if (propertyCreated) {
          this.commonService.showAlert('Market Appraisal', 'The Contact and/or the Property and their association has been created/modified successfully').then(res => {
            if (res) {
              this.router.navigate(['agent/dashboard'], { replaceUrl: true });
            }
          });

        }
      }
      return;
    }
    /**Scenario 5 : New Landlord - No Property**/
    if (this.maForm.get('contactForm').valid && !this.maForm.get('propertyForm').valid) {
      const confirm = await this.commonService.showConfirm('Market Appraisal', 'Do you wish to continue without creating a property? If No, please fill all the mandatory fields.', '', 'Yes', 'No');
      if (confirm) {
        const landlordCreated = await this.createLandlord();
        if (landlordCreated) {
          this.commonService.showAlert('Market Appraisal', 'Contact ' + this.maForm.getRawValue().contactForm.displayAs + ' has been created successfully').then(res => {
            if (res) {
              this.router.navigate(['agent/dashboard'], { replaceUrl: true });
            }
          });

        }
      }
      else {
        this.type = MARKET_APPRAISAL.property_type
      }
      return;
    }
  }

  createLandlord() {
    const params = this.maForm.getRawValue().contactForm;
    return new Promise((resolve) => {
      this.maService.createLandlord(params).subscribe(
        (res) => {
          resolve(res);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    
  }

  updateLandlord() {
    const params = this.maForm.getRawValue().contactForm;
    const llId = params.landlordUuid;
    params.status = params.landlordStatus;
    params.foreName = params.forename;
    params.surName = params.surname;
    return new Promise((resolve) => {
      this.maService.updateLandlord(params, llId).subscribe(
        (res) => {
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    
  }

  updateProperty(payload) {
    const params = payload;
    const propertyId = params.propertyId;
    params.maximumRent = params.rentRange.maximum;
    params.minimumRent = params.rentRange.minimum;
    params.propertyDescription = params.propertyNotes;
    return new Promise((resolve) => {
      this.maService.updateProperty(params, propertyId).subscribe(
        (res) => {
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    
  }

  private createProperty(payload) {
    return new Promise((resolve) => {
      this.maService.createNewProperty(payload).subscribe(
        (res) => {
          resolve(res);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    
  }

  async bookMa() {
    const modal = await this.modalController.create({
      component: BookMaModalPage,
      cssClass: 'modal-container ma-modal-container',
      componentProps: {
        title: 'Book MA',
        type: 'book-ma'
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {

    });
    await modal.present();
  }

}
