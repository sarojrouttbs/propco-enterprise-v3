import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-property-address',
  templateUrl: './property-address.component.html',
  styleUrls: ['./property-address.component.scss'],
})
export class PropertyAddressComponent implements OnInit {
  @Input() group;
  address: any;
  lookupLoader = false;
  addressList: any[];
  selectedAddress: any;
  addressPopoverOptions: any = {
    cssClass: 'address-selection'
  };
  constructor(private commonService: CommonService) { }

  ngOnInit() {}

  getAddressList() {
    if (this.group.get('postcode').value == null) {
      return;
    }
    this.group.get('addressdetails').setValue('');
    const postcode = this.group.get('postcode').value;
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
        this.group.get('buildingNumber').setValue(res.buildingNumber);
        this.group.get('buildingName').setValue(res.buildingName);
        this.group.get('street').setValue(res.street);
        this.group.get('addressLine1').setValue(res.line1);
        this.group.get('addressLine2').setValue(res.line2);
        this.group.get('addressLine3').setValue(res.line3);
        this.group.get('locality').setValue(res.line4);
        this.group.get('town').setValue(res.line5);
        this.group.get('county').setValue(res.county);
        this.group.get('country').setValue(res.countryName);
        this.group.get('latitude').setValue(res.latitude);
        this.group.get('longitude').setValue(res.longitude);
        this.group.get('organisationName').setValue(res.company);
        this.group.get('pafref').setValue(res.domesticId);
      }
    }, error => {
      this.selectedAddress = {};
      const data: any = {};
      data.title = 'Postcode Address';
      data.message = error.error ? error.error.message : error.message;
      this.commonService.showMessage(data.message, data.title, 'error');
    });
  }

  forceUppercaseConditionally(formControlName: string, event: any):void {
    this.group.get(formControlName).setValue(event.target.value.toUpperCase());
  }

}
