import { Component, Input } from '@angular/core';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-property-address',
  templateUrl: './property-address.component.html'
})
export class PropertyAddressComponent {
  @Input() group;
  address: any;
  lookupLoader = false;
  localStorageItems: any = [];
  selectedEntityDetails: any = null;
  addressList: any[];
  selectedAddress: any;
  addressPopoverOptions: any = {
    cssClass: 'address-selection'
  };
  @Input() isPropertyAddressAvailable = false;

  constructor(
    private commonService: CommonService,
    private agentService: AgentService
  ) {
    this.initApiCalls();

  }

  private async initApiCalls() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();

  }

  private fetchItems() {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }

  private getActiveTabEntityInfo() {
    const item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      return item[0];
    }
  }

  getAddressList() {
    if (this.group.get('postcode').value == null) {
      return;
    }
    const postcode = this.group.get('postcode').value;
    this.group.reset();
    this.group.get('postcode').setValue(postcode);
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
        this.group.get('pafReference').setValue(res.domesticId);
        this.group.get('postcode').setValue(res.postalCode);

        const addressObj = {
          buildingNumber: res.buildingNumber,
          buildingName: res.buildingName,
          street: res.street,
          addressLine1: res.line1,
          addressLine2: res.line2,
          addressLine3: res.line3,
          locality: res.line4,
          town: res.line5,
          county: res.county,
          country: res.countryName,
          latitude: res.latitude.toString(),
          longitude: res.longitude.toString(),
          organisationName: res.company,
          pafReference: res.domesticId,
          postcode: res.postalCode
        }

        this.agentService.updatePropertyDetails(this.selectedEntityDetails.entityId, addressObj).subscribe(
          res => {
          },
          error => {
            this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Update Property Address', 'error');
          }
        );
      }
    }, error => {
      this.selectedAddress = {};
      const data: any = {};
      data.title = 'Postcode Address';
      data.message = error.error ? error.error.message : error.message;
      this.commonService.showMessage(data.message, data.title, 'error');
    });
  }

  toUpperCase(formControlName: string, event: any): void {
    this.group.get(formControlName).setValue(event.target.value.toUpperCase());
  }

}
