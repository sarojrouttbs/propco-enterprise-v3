import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { PROPCO, REFERENCING } from 'src/app/shared/constants';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { SearchPropertyPage } from 'src/app/shared/modals/search-property/search-property.page';
import { ModalController } from '@ionic/angular';
import { async } from 'q';
import { SearchApplicationPage } from 'src/app/shared/modals/search-application/search-application.page';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';
import { ReferencingService } from 'src/app/referencing/referencing.service';

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
  applicationStatus: any= {};
  laApplicantStatusTypes: any[] = [];
  laApplicantReferencingResultTypes: any[] = [];
  applicationId: any;

  constructor(
    private commonService: CommonService,
    private referencingService: ReferencingService,
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
      this.setLALookupData(this.laLookupdata);
    } else {
      this.referencingService.getLALookupData(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(data => {
        this.commonService.setItem(PROPCO.LA_LOOKUP_DATA, data);
        this.laLookupdata = data;
        this.setLALookupData(data);
      });
    }
  }

  private setLookupData(data: any) {
  }

  private setLALookupData(data: any): void {
    this.laApplicantStatusTypes = data.applicantStatusTypes;
    this.laApplicantReferencingResultTypes = data.applicantReferencingResultTypes;
  }

  getLAApplicationList(){
    const params = new HttpParams()
      .set('limit', '5')
      .set('page', '1');
    this.referencingService.getLAApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, params).subscribe(data => {
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

  async goToQuickSearch(){
    
    const modal = await this.modalController.create({
      component: SearchApplicationPage,
      cssClass: 'modal-container entity-search',
      backdropDismiss: false

    });
    const data = modal.onDidDismiss().then(res => {
      if(res.data.applicationId){
        this.applicationId = res.data.applicationId;
        this.openApplicationStatus();
      }
    });
    await modal.present();

  }
 
  async openApplicationStatus() {
    this.applicationStatus = await this.getApplicationStatus();
    const modal = await this.modalController.create({
      component: SimpleModalPage,
      cssClass: 'modal-container alert-prompt',
      backdropDismiss: false,
      componentProps: {
        data: `<b>Application Status - </b>${this.getLookupValue(this.applicationStatus.status, this.laApplicantStatusTypes)}
        </br><b>Application Grade - </b>${this.getLookupValue(this.applicationStatus.referencingResult, this.laApplicantReferencingResultTypes)? this.getLookupValue(this.applicationStatus.referencingResult, this.laApplicantReferencingResultTypes) : 'N/A' }
        `,
        heading: 'Status',
        buttonList: [
          {
            text: 'OK',
            value: false
          }
        ]
      }
    });

    await modal.present();
  }

  getApplicationStatus() {
    //this.showLoader = true;
    return new Promise((resolve, reject) => {
      this.referencingService.getApplicationStatus(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, this.applicationId).subscribe(res => {
        //this.showLoader = false;
        return resolve(res);
        
      }, error => {
        //this.showLoader = false;
        return reject(false);
      });
    });
  }

  getLookupValue(index: any, lookup: any, type?: any) {
    index = (type == 'category' && index) ? Number(index) : index;
    return this.commonService.getLookupValue(index, lookup);
  }


}
