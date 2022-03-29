import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { DEFAULTS, PROPCO, REFERENCING } from 'src/app/shared/constants';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { SearchApplicationPage } from 'src/app/shared/modals/search-application/search-application.page';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';
import { ReferencingService } from 'src/app/referencing/referencing.service';

@Component({
  selector: 'la-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  lookupdata: any;
  referencingLookupdata: any;
  applicationList: any;
  propertyId: any;
  applicationStatus: any= {};
  referencingApplicantStatusTypes: any[] = [];
  referencingApplicantResultTypes: any[] = [];
  applicationId: any;

  referencingProductList: any;
  referencingCaseProductList: any[] = [];
  referencingApplicationProductList: any[] = [];
  DEFAULTS = DEFAULTS;

  constructor(
    private commonService: CommonService,
    private referencingService: ReferencingService,
    private router: Router,
    private modalController: ModalController
  ) {
    this.getLookupData();
    this.getProductList();
  }

  ngOnInit() {
    this.getApplicationList();
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.referencingLookupdata = this.commonService.getItem(PROPCO.REFERENCING_LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }

    if (this.referencingLookupdata) {
      this.setReferencingLookupData(this.referencingLookupdata);
    } else {
      this.referencingService.getLookupData(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(data => {
        this.commonService.setItem(PROPCO.REFERENCING_LOOKUP_DATA, data);
        this.referencingLookupdata = data;
        this.setReferencingLookupData(data);
      });
    }
  }

  private setLookupData(data: any): void {
  }

  private setReferencingLookupData(data: any): void {
    this.referencingApplicantStatusTypes = data.applicantStatusTypes;
    this.referencingApplicantResultTypes = data.applicantReferencingResultTypes;
  }

  private getProductList() {
    this.referencingProductList = this.commonService.getItem(PROPCO.REFERENCING_PRODUCT_LIST, true);
    if (this.referencingProductList) {
      this.referencingCaseProductList = this.referencingProductList?.caseProducts ? this.referencingProductList.caseProducts : [];
      this.referencingApplicationProductList = this.referencingProductList?.applicationProducts ? this.referencingProductList.applicationProducts : [];
    }
    else{
      const promise = new Promise((resolve, reject) => {
        this.referencingService.getProductList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(
          res => {
            this.referencingProductList = res ? res : {};
            
            if (this.referencingProductList) {
              this.commonService.setItem(PROPCO.REFERENCING_PRODUCT_LIST, res);
              this.referencingCaseProductList = this.referencingProductList?.caseProducts ? this.referencingProductList.caseProducts : [];
              this.referencingApplicationProductList = this.referencingProductList?.applicationProducts ? this.referencingProductList.applicationProducts : [];
            }
            resolve(this.referencingProductList);
          },
          error => {
            console.log(error);
            resolve(this.referencingProductList);
        });
      });
      return promise;
    }
  }

  getApplicationList(){
    const params = new HttpParams()
      .set('limit', '5')
      .set('page', '1');
    this.referencingService.getApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, params).subscribe(data => {
      this.applicationList = data;
    });
  }

  refresh(){
    location.reload();
  }

  goToApplicationList() {
    this.router.navigate([`let-alliance/application-list`]);
  }

  startApplication() {
    this.router.navigate([`let-alliance/add-application`]);
  }

  async quickSearch(){
    const modal = await this.modalController.create({
      component: SearchApplicationPage,
      cssClass: 'modal-container la-application-search',
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
        data: `<div class='status-block'><b>Application Status - </b>${this.getLookupValue(this.applicationStatus.status, this.referencingApplicantStatusTypes)}
        </br></br><b>Application Grade - </b>${this.getLookupValue(this.applicationStatus.referencingResult, this.referencingApplicantResultTypes)? this.getLookupValue(this.applicationStatus.referencingResult, this.referencingApplicantResultTypes) : DEFAULTS.NOT_AVAILABLE }
        </div>`,
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
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getApplicationStatus(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, this.applicationId).subscribe(res => {
        resolve(res);
      }, error => {
        resolve(false);
      });
    });

    return promise;
  }

  getLookupValue(index: any, lookup: any, type?: any) {
    //index = (type == 'category' && index) ? Number(index) : index;
    return this.commonService.getLookupValue(index, lookup);
  }


}
