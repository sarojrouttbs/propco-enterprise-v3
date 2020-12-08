import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.page.html',
  styleUrls: ['./address-modal.page.scss'],
})
export class AddressModalPage implements OnInit {
  addressDetailsForm: FormGroup;
  propertyDetails: any;
  propertyId: string;
  address: any;
  lookupLoader = false;
  postCodeAddressDetails = false;
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
    this.initiateAddressForm();
    this.address = this.navParams.get('address');
    this.setAddress();

  }

  saveAddress(){
    this.dismiss();
  }

   setAddress(){
     this.addressDetailsForm.patchValue({
      postcode: this.address.postcode,
      organisation: this.address.organisation,
      buildingName: this.address.buildingName,
      buildingNumber: this.address.buildingNumber,
      street: this.address.street,
      addressLine1: this.address.addressLine1,
      addressLine2: this.address.addressLine2,
      addressLine3: this.address.addressLine3,
      locality: this.address.locality,
      town: this.address.town,
      country: this.address.country,
      block: this.address.block,
      pafReference: this.address.pafReference,
      latitude: this.address.latitude,
      longitude: this.address.longitude,
    });
   }

  initiateAddressForm(){
    this.addressDetailsForm = this.fb.group({
      postcode: ['address.postcode', Validators.required],
      organisation: [''],
      buildingName: ['', Validators.required],
      buildingNumber: [''],
      street: [''],
      addressLine1: ['', Validators.required],
      addressLine2: ['', Validators.required],
      addressLine3: ['', Validators.required],
      locality: ['', Validators.required],
      town: ['', Validators.required],
      country: ['', Validators.required],
      block: [''],
      pafReference: [''],
      latitude: [''],
      longitude: [''],
    });
  }

  /* getAddressList() {
    if (this.addressDetailsForm.get('postcode').value == null) {
      return;
    }
    const postcode = this.addressDetailsForm.get('postcode').value;
    if (this.addressDetailsForm.get('postcode').value && postcode) {
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
    if (!addressId || "") {
      return;
    }
    this.postCodeAddressDetails = true;
    this.commonService.getPostcodeAddressDetails(addressId).subscribe(res => {
      if (res && res.line1) {
        this.selectedAddress = res;
        this.addressDetailsForm.controls.address['controls'].addressLine1.setValue(res.line1);
        this.addressDetailsForm.controls.address['controls'].addressLine2.setValue(res.line2);
        this.addressDetailsForm.controls.address['controls'].town.setValue(res.line5);
        this.addressDetailsForm.controls.address['controls'].county.setValue(res.provinceName);
        this.addressDetailsForm.controls.address['controls'].country.setValue(res.countryName);
        this.postCodeAddressDetails = null;
      }
    }, error => {
      this.selectedAddress = {};
      const data: any = {};
      data.title = 'Postcode Address';
      data.message = error.error ? error.error.message : error.message;
      this.commonService.showMessage(data.message, data.title, 'error');
    });
  } */

  lookupAddress() {
    console.log('lookup data');
  }

  dismiss() {
    this.modalController.dismiss({
      address : this.addressDetailsForm.value
    });
  }
}