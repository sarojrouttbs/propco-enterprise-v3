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
   landlordData;
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
    this.commonService.lanlordChange$.subscribe(data =>{
      this.landlordData = data;
      if(this.landlordData)     this.getLandlordData();
    })

  }

  getLandlordData(){
    if(this.landlordData==='reset'){
      this.contactForm.reset();
      this.landlordData =  '';
      this.address = '';
    }else{
      this.setData(this.landlordData);
    }
  }

  setData(data){
     this.address = data.address;
     this.contactForm.patchValue({
      displayAs: data.displayAs ? data.displayAs :'',
      mobile: data.mobile? data.mobile :'',
      landlordStatus : data.status? data.status :'',
      email:data.email? data.email :'',
      homeTelephone:data.homeTelephone? data.homeTelephone :'',
      businessTelephone : data.businessTelephone? data.businessTelephone :'',
      enquiryNotes : data.enquiryNotes? data.enquiryNotes :'',
      owners : data.owners? data.owners :'',
      heardReason : data.heardReason? this.getIndex(data.heardReason, this.propertyHeardSources):'',
      officeCode : data.associatedOfficeCode? data.associatedOfficeCode : '',
      ownership : data.ownership? this.getIndex(data.ownership, this.ownership):''
    });
  }

  getIndex(value,lookUp){
   let index ;
   lookUp.forEach((item:any) => {
    if(item.value === value) {
      index= item.index
    }
   })
   return index;
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
        landlordData:this.landlordData
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
    if(this.contactForm){
      this.contactForm.get('owners').disable()
      if (e.detail.value == 'jointly') {
        this.contactForm.get('owners').enable()
      }
    }
  }
}
