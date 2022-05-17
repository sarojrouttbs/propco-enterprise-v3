import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { OWNERSHIP, PROPCO } from 'src/app/shared/constants';
import { AddressModalPage } from 'src/app/shared/modals/address-modal/address-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { DisplayAsModalPage } from 'src/app/shared/modals/display-as-modal/display-as-modal.page';
@Component({
  selector: 'app-ma-contact',
  templateUrl: './ma-contact.component.html',
  styleUrls: ['./ma-contact.component.scss'],
})
export class MaContactComponent implements OnInit {
  lookupdata: any;
  propertyHeardSources: any;
  officeCodes: any;
  landlordStatuses: any;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  contactForm: FormGroup
  @Input() group;
  address: any;
  @Input('group') set _(value: any) {
    this.contactForm = value as FormGroup;
  }
  ownership = OWNERSHIP;

  constructor(
    private modalController: ModalController,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.getLookupData();
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
    this.propertyHeardSources = data.propertyHeardSources;
    this.officeCodes = data.officeCodes;
    this.landlordStatuses = data.landlordStatuses
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  async opneDisplayAsModal() {
    const modal = await this.modalController.create({
      component: DisplayAsModalPage,
      cssClass: 'modal-container ma-modal-container',
      componentProps: {
        displayAs: this.contactForm.value.displayAs,
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data?.llInfo.displayAs) {
        this.contactForm.get('displayAs').patchValue(res.data?.llInfo.displayAs);
        this.contactForm.patchValue(res.data?.llInfo);
      }

    });
    await modal.present();
  }

  async openAddressModal() {
    const modal = await this.modalController.create({
      component: AddressModalPage,
      cssClass: 'modal-container ma-modal-container',
      componentProps: {
        paramAddress: this.address,
        type: 'market-appraisal'
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data?.address.addressLine1) {
        this.address = res.data.address;
        this.contactForm.get('address').patchValue(res.data.address);
      }
    });
    await modal.present();
  }

  onOwnershipChange(e) {
    this.contactForm.get('owners').disable()
    if (e.detail.value == 'jointly') {
      this.contactForm.get('owners').enable()
    }
  }
}
