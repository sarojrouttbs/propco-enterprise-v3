import { Component, OnInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { PROPCO, REFERENCING } from 'src/app/shared/constants';
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
  selector: 'app-guarantor-application-list',
  templateUrl: './guarantor-application-list.page.html',
  styleUrls: ['./guarantor-application-list.page.scss'],
})
export class GuarantorApplicationListPage implements OnInit, OnDestroy {

  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any> = new Subject();
  
  lookupdata: any;
  laLookupdata: any;
  userLookupDetails: any[] = [];
  officeCodes: any[] = [];
  applicationList: any[] = [];
  applicationStatus: any= {};
  applicationGrade: any= {};

  it: any;
  applicationId: any;
  applicantId: any;
  referenceNumber: any;

  laProductList: any[] = [];
  laApplicantStatusTypes: any[] = [];
  laApplicantReferencingResultTypes: any[] = [];

  selectedData: any;
  applicationFilterForm: FormGroup;

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
  }

  ngOnInit() {
    this.it = this.route.snapshot.queryParamMap.get('it');
    this.applicationId = this.route.snapshot.queryParamMap.get('applicationId');
    this.applicantId = this.route.snapshot.queryParamMap.get('applicantId');
    this.referenceNumber = this.route.snapshot.queryParamMap.get('referenceNumber');

    const self = this;
    this.dtOptions[0] = {
      paging: false,
      searching: false,
      ordering: true,
      info: false,
      ajax: (tableParams: any, callback) => {
        const params = new HttpParams()
        .set('limit', tableParams.length)
        .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1');
        self.referencingService.getGuarantorApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, this.applicationId).subscribe(res => {
          self.applicationList = res && res.data ? res.data : [];
          self.getLAProductList();
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        });
      },
      columns: [null, null, null, null, null, null, null, null, null, null, { orderable: false }],
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

  private setLookupData(data: any): void {
    this.officeCodes = data.officeCodes;
  }

  private setLALookupData(data: any): void {
    this.laApplicantStatusTypes = data.applicantStatusTypes;
    this.laApplicantReferencingResultTypes = data.applicantReferencingResultTypes;
  }

  rerenderApplications(resetPaging?: any): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
  }

  private getLAProductList() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getLAProductList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(
        res => {
          this.laProductList = res ? res : [];
          resolve(this.laProductList);
        },
        error => {
          console.log(error);
          resolve(this.laProductList);
      });
    });
    return promise;
  }

  async resendLink() {
    const modal = await this.modalController.create({
      component: ResendLinkModalPage,
      cssClass: 'modal-container resend-link',
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
      cssClass: 'modal-container alert-prompt',
      backdropDismiss: false,
      componentProps: {
        data: `<div class='status-block'><b>Application Status - </b>${this.getLookupValue(this.applicationStatus.status, this.laApplicantStatusTypes)}
        </br></br><b>Application Grade - </b>${this.getLookupValue(this.applicationStatus.referencingResult, this.laApplicantReferencingResultTypes)? this.getLookupValue(this.applicationStatus.referencingResult, this.laApplicantReferencingResultTypes) : 'N/A'}
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

  getProductType(productId: any): string{
    let productType: any;
    this.laProductList = this.laProductList && this.laProductList.length ? this.laProductList : [];
    this.laProductList.find((obj) => {
      if (obj.productId === productId) {
        productType = obj.productName;
      }
    });
    return productType;
  }

  goToGuarantorDetails(){
    this.router.navigate(['/let-alliance/add-guarantor'], { queryParams: { 
      applicantId: this.applicantId,
      applicationId: this.applicationId,
      referenceNumber: this.referenceNumber
     }, replaceUrl: true });
  }

  showMenu(event: any, id: any, data: any, className: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, className, false);
  }

  hideMenu(event: any, id: any) {
    this.selectedData = {};
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