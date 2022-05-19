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
    this.contactForm.get('displayAs').patchValue(data.displayAs ? data.displayAs :'');
    this.contactForm.get('mobile').patchValue(data.mobile? data.mobile :'');
    this.contactForm.get('landlordStatus').patchValue(data.status? data.status :'');
    this.contactForm.get('email').patchValue(data.email? data.email :'');
    this.contactForm.get('homeTelephone').patchValue(data.homeTelephone? data.homeTelephone :'');
    this.contactForm.get('businessTelephone').patchValue(data.businessTelephone? data.businessTelephone :'');
    this.contactForm.get('enquiryNotes').patchValue(data.enquiryNotes? data.enquiryNotes :'');
    this.contactForm.get('owners').patchValue(data.owners? data.owners :'');
    this.contactForm.get('heardReason').patchValue(data.heardReason? this.getIndex(data.heardReason, this.propertyHeardSources):'');
    this.contactForm.get('officeCode').patchValue(data.officeCode? this.getIndex(data.officeCode, this.officeCodes):'');
    this.contactForm.get('ownership').patchValue(data.ownership? this.getIndex(data.ownership, this.ownership):'');
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
        salutation:this.landlordData.salutation ? this.landlordData.salutation :'',
        addressee:this.landlordData.addressee ? this.landlordData.addressee :'',
        surName:this.landlordData.surName ? this.landlordData.surName : '',
        middleName:this.landlordData.middleName ? this.landlordData.middleName : '',
        foreName:this.landlordData.foreName ? this.landlordData.foreName :'',
        initials:this.landlordData.initials ? this.landlordData.initials :'',
        title:this.landlordData.title ? this.landlordData.title :'',
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
