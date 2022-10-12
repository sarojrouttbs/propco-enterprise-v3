import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.page.html'
})
export class AddressModalPage implements OnInit {
  addressDetailsForm: FormGroup;
  address: any;
  lookupLoader = false;
  addressList: any[];
  selectedAddress: any;
  type: any;
  paramAddress: any;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService
  ) {
  }

  ngOnInit() {
    this.initiateAddressForm();
    this.setAddress();
  }

  initiateAddressForm() {
    this.addressDetailsForm = this.fb.group({
      postcode: ['', [Validators.required]],
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
      pafReference: [''],
      country: ['', Validators.required],
      latitude: [''],
      longitude: [''],
    });
  }

  setAddress() {
    if (this.paramAddress) {
      this.addressDetailsForm.patchValue({
        postcode: this.paramAddress.postcode,
        buildingNumber: this.paramAddress.buildingNumber,
        buildingName: this.paramAddress.buildingName,
        street: this.paramAddress.street,
        addressLine1: this.paramAddress.addressLine1,
        addressLine2: this.paramAddress.addressLine2,
        addressLine3: this.paramAddress.addressLine3,
        locality: this.paramAddress.locality,
        town: this.paramAddress.town,
        county: this.paramAddress.county,
        country: this.paramAddress.country,
        latitude: this.paramAddress.latitude,
        longitude: this.paramAddress.longitude,
        pafReference: this.paramAddress?.pafReference,
      });
    }
  }

  getAddressList() {
    if (this.addressDetailsForm.get('postcode').value == null) {
      return;
    }
    const postcode = this.addressDetailsForm.get('postcode').value;
    this.addressDetailsForm.reset();
    this.addressDetailsForm.get('postcode').setValue(postcode);
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

  getAddressDetails(addressId: string) {
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
        this.addressDetailsForm.get('county').setValue(res.province ? res.province : res.provinceName);
        this.addressDetailsForm.get('country').setValue(res.countryName);
        this.addressDetailsForm.get('latitude').setValue(res.latitude);
        this.addressDetailsForm.get('longitude').setValue(res.longitude);
        this.addressDetailsForm.get('pafReference').setValue(res.domesticId);
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
    if (this.addressDetailsForm.invalid) {
      this.addressDetailsForm.markAllAsTouched();
      return;
    }
    this.modalController.dismiss({
      address: this.addressDetailsForm.value
    });
  }

  toUpperCase(formControlName: string, event: any):void {
    this.addressDetailsForm.get(formControlName).setValue(event.target.value.toUpperCase());
  }
}
