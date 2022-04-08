import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

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
  selectedLandlordId: any;
  selectedLandlord: any;
  tenantList: any;

  constructor() { }

  ngOnInit() {

    console.log("type-==========", this.type);
    

    // this.list.patchValue(this.propertyLandlords[0])
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyLandlords && !changes.propertyLandlords.firstChange) {
      this.landlordList = this.propertyLandlords;
      console.log("this.landlordList[0]", this.landlordList[0]);

      this.landlordListCtrl.patchValue(this.landlordList[0].landlordId)
      this.selectedLandlordId = this.landlordList[0].landlordId;
      console.log(this.landlordListCtrl.value);

      // this.showSkeleton = true;
      // this.initiateJobCompletion();
    }

    if (changes.propertyTenants && !changes.propertyTenants.firstChange) {
      this.tenantList = this.propertyTenants;

      console.log("tenantList", this.tenantList);

      // this.landlordListCtrl.patchValue(this.landlordList[0].landlordId)

      // this.list.patchValue(this.tenantList[0].landlordId)
      // this.selectedLandlordId = this.tenantList[0].landlordId;
      // console.log(this.list.value);

      // this.showSkeleton = true;
      // this.initiateJobCompletion();
    }



  }

  onListChange(id) {
    this.selectedLandlord = this.propertyLandlords.filter(x => x == id);
  }

}
