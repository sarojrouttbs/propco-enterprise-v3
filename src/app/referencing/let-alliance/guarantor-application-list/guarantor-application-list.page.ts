import { Component, OnInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, PROPCO, REFERENCING } from 'src/app/shared/constants';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ResendLinkModalPage } from 'src/app/shared/modals/resend-link-modal/resend-link-modal.page';
import { ModalController } from '@ionic/angular';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';
import { ReferencingService } from '../../referencing.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'la-guarantor-application-list',
  templateUrl: './guarantor-application-list.page.html',
  styleUrls: ['./guarantor-application-list.page.scss'],
})
export class GuarantorApplicationListPage implements OnInit, OnDestroy {

  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any> = new Subject();
  
  lookupdata: any;
  referencingLookupdata: any;
  userLookupDetails: any[] = [];
  officeCodes: any[] = [];
  applicationList: any[] = [];
  applicationStatus: any= {};
  applicationGrade: any= {};

  propertyId: any;
  applicantId: any;
  applicationId: any;
  referenceNumber: any;
  applicantType: any;

  referencingProductList: any;
  referencingCaseProductList: any[] = [];
  referencingApplicationProductList: any[] = [];

  referencingApplicantStatusTypes: any[] = [];
  referencingApplicantResultTypes: any[] = [];

  selectedData: any;
  applicationFilterForm: FormGroup;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  DEFAULTS = DEFAULTS;
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    public commonService: CommonService,
    private referencingService: ReferencingService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private modalController: ModalController,
    public datepipe: DatePipe
    ) {
    this.getLookupData();
    this.getProductList();
  }

  ngOnInit() {
    this.propertyId = this.route.snapshot.queryParamMap.get('pId');
    this.applicantId = this.route.snapshot.queryParamMap.get('tId');
    this.applicationId = this.route.snapshot.queryParamMap.get('appId');
    this.referenceNumber = this.route.snapshot.queryParamMap.get('appRef');
    this.applicantType = this.route.snapshot.queryParamMap.get('tType');

    const self = this;
    this.dtOptions[0] = {
      paging: false,
      searching: false,
      ordering: false,
      info: false,
      ajax: (tableParams: any, callback) => {
        const params = new HttpParams()
        .set('limit', tableParams.length)
        .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1');
        self.referencingService.getGuarantorApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, this.applicationId).subscribe(res => {
          self.applicationList = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        });
      },
      columns: [null, null, null, null, null, null, null, null, null],
      responsive: true
    };
    this.initiateForm();
  }

  ionViewDidEnter() {
    this.rerenderApplications(true);
    this.commonService.hideMenu('', 'divOverlay');
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  private initiateForm(): void {
    this.applicationFilterForm = this.fb.group({
      officeCode: ['', ],
      searchTerm: ['', ],
      fromDate: ['', ],
      toDate: ['', ]
    });
  }
  
  private getLookupData(): void {
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
    this.officeCodes = data.officeCodes;
  }

  private setReferencingLookupData(data: any): void {
    this.referencingApplicantStatusTypes = data.applicantStatusTypes;
    this.referencingApplicantResultTypes = data.applicantReferencingResultTypes;
  }

  rerenderApplications(resetPaging?: any): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
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

  async resendLink() {
    const modal = await this.modalController.create({
      component: ResendLinkModalPage,
      cssClass: 'modal-container resend-link la-modal-container',
      backdropDismiss: false,
      componentProps: {
        paramApplicantId: this.selectedData.applicantDetail.applicantId,
        paramApplicationId: this.selectedData.applicationId,
        paramPropertyAddress: this.selectedData.propertyDetail.address,
        paramIt: 'G'
      }
    });
    await modal.present();
  }

  async openApplicationStatus() {
    this.applicationStatus = await this.getApplicationStatus();
    const modal = await this.modalController.create({
      component: SimpleModalPage,
      cssClass: 'modal-container alert-prompt la-modal-container',
      backdropDismiss: false,
      componentProps: {
        data: `<div class='status-block'><b>Application Status - </b>${this.getLookupValue(this.applicationStatus.status, this.referencingApplicantStatusTypes)}
        </br></br><b>Application Grade - </b>${this.getLookupValue(this.applicationStatus.referencingResult, this.referencingApplicantResultTypes)? this.getLookupValue(this.applicationStatus.referencingResult, this.referencingApplicantResultTypes) : DEFAULTS.NOT_AVAILABLE}
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
      this.referencingService.getApplicationStatus(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, this.selectedData.applicationId).subscribe(res => {
        resolve(res);
      }, error => {
        resolve(false);
      });
    });

    return promise;
  }

  getProductType(productId: any, name: any): string{
    let productType: any;
    if(name == 'case'){
      this.referencingCaseProductList.find((obj) => {
        if (obj.productId === productId) {
          productType = obj.productName;
        }
      });
    }
    else if(name == 'application'){
      this.referencingApplicationProductList.find((obj) => {
        if (obj.productId === productId) {
          productType = obj.productName;
        }
      });
    }
    return productType;
  }

  goToGuarantorDetails(){
    this.router.navigate(['../add-guarantor'], { relativeTo: this.route,queryParams: { 
      pId: this.propertyId,
      tId: this.applicantId,
      appId: this.applicationId,
      appRef: this.referenceNumber,
      tType: this.applicantType
      }, replaceUrl: true
    }); 
  }

  showMenu(event: any, id: any, data: any, className: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, className, false);
  }

  hideMenu(event: any, id: any) {
    this.commonService.hideMenu(event, id);
  }

  getLookupValue(index: any, lookup: any, type?: any) {
    return this.commonService.getLookupValue(index, lookup);
  }

  refresh(){
    location.reload();
  }

  goBack() {
    history.back();
  }
}
