import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DEFAULTS } from 'src/app/shared/constants';

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

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyLandlords && !changes.propertyLandlords.firstChange) {
      this.landlordList = this.propertyLandlords;
      if (this.landlordList)
        this.landlordListCtrl.patchValue(this.landlordList[0].landlordId);
    }

    if (changes.propertyTenants && !changes.propertyTenants.firstChange) {
      this.tenantList = this.propertyTenants;
      if (this.tenantList)
        this.tenantListCtrl.patchValue(this.tenantList[0].tenantId);
    }
  }

  onLandlordChange() {
    let landlord = this.propertyLandlords.filter(x => x.landlordId == this.landlordListCtrl.value);
    this.selectedLandlord = landlord[0];
  }

  onTenantChange() {
    let tenant = this.propertyTenants.filter(x => x.tenantId == this.tenantListCtrl.value);
    this.selectedTenant = tenant[0];

  }

}
