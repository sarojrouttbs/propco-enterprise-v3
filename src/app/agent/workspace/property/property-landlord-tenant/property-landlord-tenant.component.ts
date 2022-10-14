import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { DATE_FORMAT, DEFAULTS, PROPCO } from 'src/app/shared/constants';
import { CallInfoModalPage } from './property-landlord-tenant-modal/call-info-modal/call-info-modal.page';
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
  DATE_FORMAT = DATE_FORMAT;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  tenantId = '';
  subscription$: Subscription;
  subscription2$: Subscription;
  selectedTenantGuarantors: any = [];
  selectedGuarantor: any;
  guarantor: FormControl = new FormControl();


  constructor(
    private commonService: CommonService,
    private modalCtrl: ModalController,
    private agentService: AgentService
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
      if (this.landlordList) {
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

  onLandlordChange(id?: string) {
    const landlordId = id ? id : this.landlordListCtrl.value;
    const landlord = this.propertyLandlords.filter(x => x.landlordId == landlordId);
    this.selectedLandlord = landlord[0];
  }

  async onTenantChange(id?: string) {
    const tenantId = id ? id : this.tenantListCtrl.value;
    const tenant = this.propertyTenants.filter(x => x.tenantId == tenantId);
    this.selectedTenant = tenant[0];
    this.selectedTenantGuarantors = await this.getTenantsGuarantors(this.selectedTenant.tenantId);
    if (Array.isArray(this.selectedTenantGuarantors) && this.selectedTenantGuarantors.length > 0) {
      this.guarantor.setValue(this.selectedTenantGuarantors[0].guarantorId);
      this.selectedGuarantor = this.selectedTenantGuarantors[0];
      this.selectedGuarantor.rentGuaranteed = this.selectedGuarantor?.rentGuaranteed !== null ? this.selectedGuarantor?.rentGuaranteed : 0;
    }
  }

  onGuarantorChange(e?: any) {
    const filterGuarantor = this.selectedTenantGuarantors.filter(x => x.guarantorId === e.detail.value);
    if (Array.isArray(filterGuarantor)) {
      this.selectedGuarantor = filterGuarantor[0];
      this.selectedGuarantor.rentGuaranteed = this.selectedGuarantor?.rentGuaranteed !== null ? this.selectedGuarantor?.rentGuaranteed : 0;
    }
  }


  async openCallInfo(info: any, type: any) {
    const modal = await this.modalCtrl.create({
      component: CallInfoModalPage,
      cssClass: 'modal-container user-info-modal',
      componentProps: {
        userInfo: info,
        type: type
      }
    });
    modal.present();
  }

  private getTenantsGuarantors(tenantId: string) {
    return new Promise((resolve, reject) => {
      this.agentService.getTenantGuarantors(tenantId).subscribe(
        res => {
          const guarantorList = res && res.data ? res.data : [];
          resolve(guarantorList);
        },
        error => {
          reject(false);
        }
      );
    });
  }

}
