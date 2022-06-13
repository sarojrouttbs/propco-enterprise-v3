import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DEFAULTS, PROPCO } from 'src/app/shared/constants';
import { CallInfoModalPage } from 'src/app/shared/modals/call-info-modal/call-info-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-property-landlord-tenant',
  templateUrl: './property-landlord-tenant.component.html',
  styleUrls: ['./property-landlord-tenant.component.scss'],
})
export class PropertyLandlordTenantComponent implements OnInit {

  landlordListCtrl = new FormControl('');
  tenantListCtrl = new FormControl('');
  @Input() type;
  @Input() propertyLandlords;
  @Input() propertyTenants;
  landlordList: any = [];
  selectedLandlord: any;
  tenantList: any = [];
  selectedTenant: any;
  notAvailable = DEFAULTS.NOT_AVAILABLE
  lookupdata: any;
  tenantStatuses: any;

  constructor(
    private commonService: CommonService,
    private modalCtrl: ModalController
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
    this.tenantStatuses = data.tenantStatuses;
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyLandlords && !changes.propertyLandlords.firstChange) {
      this.landlordList = this.propertyLandlords;
      if (this.landlordList){
        this.landlordListCtrl.patchValue(this.landlordList[0].landlordId);
        this.onLandlordChange(this.landlordList[0].landlordId);
      }
    }

    if (changes.propertyTenants && !changes.propertyTenants.firstChange) {
      this.tenantList = this.propertyTenants;      
      if (this.tenantList) {
        this.tenantListCtrl.patchValue(this.tenantList[0].tenantId);
        this.onTenantChange(this.tenantList[0].tenantId);
      }
    }
  }

  onLandlordChange(id?) {
    let landlordId = id ? id : this.landlordListCtrl.value;
    let landlord = this.propertyLandlords.filter(x => x.landlordId == landlordId);
    this.selectedLandlord = landlord[0];    
  }

  onTenantChange(id?) {
    let tenantId = id ? id : this.tenantListCtrl.value;
    let tenant = this.propertyTenants.filter(x => x.tenantId == tenantId);
    this.selectedTenant = tenant[0];
  }

  async openCallInfo(info, type){    
    const modal = await this.modalCtrl.create({
      component: CallInfoModalPage,
      cssClass: 'user-info-modal',
      componentProps: {
        userInfo: info,
        type: type
      }
    });
    modal.present();
  }

}
