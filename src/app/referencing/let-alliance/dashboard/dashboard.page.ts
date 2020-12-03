import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { LetAllianceService } from '../let-alliance.service';
import { PROPCO } from 'src/app/shared/constants';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { SearchPropertyPage } from 'src/app/shared/modals/search-property/search-property.page';
import { ModalController } from '@ionic/angular';
import { async } from 'q';

@Component({
  selector: 'la-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  private lookupdata: any;
  laLookupdata: any;
  applicationList: any;
  propertyId: any;

  constructor(
    private commonService: CommonService,
    private letAllianceService: LetAllianceService,
    private router: Router,
    private modalController: ModalController
  
    ) {
    this.getLookupData();
  }

  ngOnInit() {
    this.getLAApplicationList();
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.laLookupdata = this.commonService.getItem(PROPCO.LA_LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }

    if (this.laLookupdata) {
      this.setLALookupData(this.lookupdata);
    } else {
      this.letAllianceService.getLALookupData().subscribe(data => {
        this.commonService.setItem(PROPCO.LA_LOOKUP_DATA, data);
        this.laLookupdata = data;
        this.setLALookupData(data);
      });
    }
  }

  private setLookupData(data: any) {
  }

  private setLALookupData(data: any) {
  }

  getLAApplicationList(){
    const params = new HttpParams()
      .set('referencingType', 'LET_ALLIANCE')
      .set('limit', '5')
      .set('page', '1');
    this.letAllianceService.getLAApplicationList(params).subscribe(data => {
      this.applicationList = data;
    });
  }

  refresh(){
    location.reload();
  }

  goToApplicationList() {
    this.router.navigate([`let-alliance/application-list`]);
  }

   /* tenantList() {
    this.router.navigate([`let-alliance/tenant-list`]);
  } */

  startApplication() {
    this.router.navigate([`let-alliance/application-details`]);
  }

}
