import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { CommonService } from '../../services/common.service';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.page.html',
  styleUrls: ['./address-modal.page.scss'],
})
export class AddressModalPage implements OnInit {
  addressDetailsForm: FormGroup;
  address: any;
  lookupLoader = false;
  addressList: any[];
  selectedAddress: any;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private navParams: NavParams,
    private commonService: CommonService
  ) {
   }

  ngOnInit() {
    this.address = this.navParams.get('address');
    this.initiateAddressForm();
    this.setAddress();
  }

  initiateAddressForm(){
    this.addressDetailsForm = this.fb.group({
      postcode: ['', [Validators.required, ValidationService.postcodeValidator]],
      addressdetails: [''],
      buildingNumber: [''],
      buildingName: [''],
      street: [''],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      addressLine3: [''],
      locality: [''],
      town: ['', Validators.required],
      county: [''],
      country: ['', Validators.required],
      pafReference: [''],
      latitude: [''],
      longitude: [''],
    });
  }

  setAddress(){
    this.addressDetailsForm.patchValue({
     postcode: this.address.postcode,
     buildingNumber: this.address.buildingNumber,
     buildingName: this.address.buildingName,
     street: this.address.street,
     addressLine1: this.address.addressLine1,
     addressLine2: this.address.addressLine2,
     addressLine3: this.address.addressLine3,
     locality: this.address.locality,
     town: this.address.town,
     county: this.address.county,
     country: this.address.country,
     pafReference: this.address.pafReference,
     latitude: this.address.latitude,
     longitude: this.address.longitude,
   });
  }

  getAddressList() {
    if (this.addressDetailsForm.get('postcode').value == null) {
      return;
    }
    const postcode = this.addressDetailsForm.get('postcode').value;
    if (postcode) {
      this.lookupLoader = true;
      this.commonService.getPostcodeAddressList(postcode).subscribe(res => {
        if (res && res.data && res.data.length) {
          this.addressList = res.data;
        } else {
          this.addressList = [];
        }
        this.lookupLoader = false;
      }, error => {
        this.addressList = [];
        const data: any = {};
        data.title = 'Postcode Lookup';
        data.message = error.error ? error.error.message : error.message;
        this.commonService.showMessage(data.message, data.title, 'error');
        this.lookupLoader = false;
      });
    }
  }

  getAddressDetails(addressId) {
    if (!addressId || '') {
      return;
    }
    this.commonService.getPostcodeAddressDetails(addressId).subscribe(res => {
      if (res && res.line1) {
        this.selectedAddress = res;
        this.addressDetailsForm.get('buildingNumber').setValue(res.buildingNumber);
        this.addressDetailsForm.get('buildingName').setValue(res.buildingName);
        this.addressDetailsForm.get('street').setValue(res.street);
        this.addressDetailsForm.get('addressLine1').setValue(res.line1);
        this.addressDetailsForm.get('addressLine2').setValue(res.line2);
        this.addressDetailsForm.get('addressLine3').setValue(res.line3);
        this.addressDetailsForm.get('locality').setValue(res.line4);
        this.addressDetailsForm.get('town').setValue(res.line5);
        this.addressDetailsForm.get('county').setValue(res.county);
        this.addressDetailsForm.get('country').setValue(res.countryName);
        this.addressDetailsForm.get('pafReference').setValue(res.pafReference);
        this.addressDetailsForm.get('latitude').setValue(res.latitude);
        this.addressDetailsForm.get('longitude').setValue(res.longitude);
      }
    }, error => {
      this.selectedAddress = {};
      const data: any = {};
      data.title = 'Postcode Address';
      data.message = error.error ? error.error.message : error.message;
      this.commonService.showMessage(data.message, data.title, 'error');
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  saveAddress() {
    this.modalController.dismiss({
      address : this.addressDetailsForm.value
    });
  }
}
