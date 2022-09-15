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
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'la-application-list',
  templateUrl: './application-list.page.html',
  styleUrls: ['./application-list.page.scss'],
})
export class ApplicationListPage implements OnInit, OnDestroy {

  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any> = new Subject();
  
  lookupdata: any;
  referencingLookupdata: any;
  officeCodes: any[] = [];
  applicationList: any[] = [];
  applicationStatus: any= {};
  applicationGrade: any= {};
  guarantorApplicationList = [];

  referencingProductList: any;
  referencingCaseProductList: any[] = [];
  referencingApplicationProductList: any[] = [];
  referencingApplicantStatusTypes: any[] = [];
  referencingApplicantResultTypes: any[] = [];
  referencingOffices: any[] = [];

  selectedData: any;
  applicationFilterForm: FormGroup;
  currentDate = this.commonService.getFormatedDate(new Date());

  applicationParams: any = new HttpParams();

  error: any = { isError: false, errorMessage: '' };
  errorTo: any = { isError: false, errorMessage: '' };
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  DEFAULTS = DEFAULTS;
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    public commonService: CommonService,
    private referencingService: ReferencingService,
    private router: Router,
    private fb: FormBuilder,
    private modalController: ModalController,
    public datepipe: DatePipe,
    private route: ActivatedRoute
    ) {
    this.getLookupData();
    this.getProductList();
  }

  ngOnInit() {
    const self = this;
    this.dtOptions[0] = {
      paging: true,
      pagingType: 'full_numbers',
      serverSide: true,
      processing: true,
      searching: false,
      ordering: true,
      pageLength: 5,
      lengthMenu: [5, 10, 15],
      order: [[ 0, 'desc' ]],
      responsive: true,
      /* scrollY: '435px',
      scrollCollapse: false, */
      ajax: (tableParams: any, callback) => {
        this.hideMenu('', 'application-overlay');
        
        this.applicationParams = this.applicationParams
        .set('limit', tableParams.length)
        .set('page', tableParams.start > -1 ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
        .set('orderByColumn', tableParams.order[0].column > -1 ? tableParams.columns.find(obj => obj.data == tableParams.order[0].column).name : 'referenceNumber')
        .set('isDescendingOrder', tableParams.order[0].dir == 'asc' ? false : true);
        
        self.referencingService.getApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, this.applicationParams).subscribe(res => {
          self.applicationList = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        },
        error => {
          console.log(error);
          this.commonService.showMessage(error.error.message, 'Application Filter', 'error');
        });
      },
      columns: [{
        data: 0,
        name: 'referenceNumber',
        searchable: true,
        orderable: true,
      },
      {
        data: 1,
        name: 'propertyDetail.reference',
        searchable: true,
        orderable: true,
      },
      {
        data: 2,
        name: 'applicantDetail.displayAs',
        searchable: true,
        orderable: true,
      },
      {
        data: 3,
        name: 'office',
        searchable: true,
        orderable: true,
      },
      {
        data: 4,
        name: 'tenancyStartDate',
        searchable: true,
        orderable: true,
      },
      {
        data: 5,
        name: 'rentShare',
        searchable: true,
        orderable: true,
      },
      {
        data: 6,
        name: 'dateOfSubmission',
        searchable: true,
        orderable: true,
      },
      {
        data: 7,
        name: 'product',
        searchable: true,
        orderable: true,
      },
      {
        data: 8,
        name: 'applicationStatus',
        searchable: true,
        orderable: true,
      },
      {
        data: 9,
        name: '',
        searchable: true,
        orderable: false,

      }]
    };
    this.initiateForm();
  }

  ionViewDidEnter() {
    this.rerenderApplications(true);
    this.commonService.hideMenu('', 'application-overlay');
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
    },
      {
        validator: ValidationService.dateRangeValidator,
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
    this.referencingOffices = data.referencingOffices;
  }

  private rerenderApplications(resetPaging?: any): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload(resetPaging);
      });
    }
  }

  getApplicationList(): void {

    if(this.applicationFilterForm.get('officeCode').value){
      let tmpArray = [];
      for (let item of this.applicationFilterForm.get('officeCode').value) {
        tmpArray.push(item.index);
      }
      this.applicationParams = this.applicationParams.set('officeCode', tmpArray.toString());
    }

    if(this.applicationFilterForm.get('searchTerm').value){
      this.applicationParams = this.applicationParams.set('searchTerm', this.applicationFilterForm.get('searchTerm').value);
    }

    if(this.applicationFilterForm.get('fromDate').value){
      this.applicationParams = this.applicationParams.set('fromDate', this.datepipe.transform(this.applicationFilterForm.get('fromDate').value, this.DATE_FORMAT.YEAR_DATE));
    }

    if(this.applicationFilterForm.get('toDate').value){
      this.applicationParams = this.applicationParams.set('toDate', this.datepipe.transform(this.applicationFilterForm.get('toDate').value, this.DATE_FORMAT.YEAR_DATE));
    }

    this.rerenderApplications(true);
  }

  private getProductList() {
    this.referencingProductList = this.commonService.getItem(PROPCO.REFERENCING_PRODUCT_LIST, true);
    if (this.referencingProductList) {
      this.referencingCaseProductList = this.referencingProductList?.caseProducts ? this.referencingProductList.caseProducts : [];
      this.referencingApplicationProductList = this.referencingProductList?.applicationProducts ? this.referencingProductList.applicationProducts : [];
    }
    else{
      return new Promise((resolve) => {
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
    }
  }

  async checkApplicationGuarantor() {
    if(this.selectedData.applicantGuarantors != null && this.selectedData.applicantGuarantors.length > 0){
      this.router.navigate(['../guarantor-application-list'], { relativeTo: this.route, queryParams: { 
        pId: this.selectedData.propertyDetail.propertyId,
        tId: this.selectedData.applicantDetail.applicantId,
        appId: this.selectedData.applicationId,
        appRef: this.selectedData.referenceNumber,
        tType: this.selectedData.applicantDetail.itemType
      } })
    }
    else{
      const modal = await this.modalController.create({
        component: SimpleModalPage,
        cssClass: 'modal-container alert-prompt la-modal-container',
        backdropDismiss: false,
        componentProps: {
          data: `<div class="status-block">There are no guarantors with this application. Do you wish to add one now?
          </div>`,
          heading: 'Guarantor',
          buttonList: [
            {
              text: 'No',
              value: false
            },
            {
              text: 'Yes',
              value: true
            }
          ]
        }
      });
  
      modal.onDidDismiss().then(res => {
        if (res.data.userInput) {
          this.router.navigate(['../add-guarantor'], { 
            relativeTo: this.route,
            queryParams: { 
              pId: this.selectedData.propertyDetail.propertyId,
              tId: this.selectedData.applicantDetail.applicantId,
              appId: this.selectedData.applicationId,
              appRef: this.selectedData.referenceNumber,
              tType: this.selectedData.applicantDetail.itemType
            }, 
            replaceUrl: true 
          });
        }
      });
  
      await modal.present();
    }
  }

  async resendLink() {
    if(this.selectedData.applicationStatus == 0){
      const modal = await this.modalController.create({
        component: ResendLinkModalPage,
        cssClass: 'modal-container resend-link la-modal-container',
        backdropDismiss: false,
        componentProps: {
          paramApplicantId: this.selectedData.applicantDetail.applicantId,
          paramApplicationId: this.selectedData.applicationId,
          paramPropertyAddress: this.selectedData.propertyDetail.address,
          paramIt: this.selectedData.applicantDetail.itemType == 'G' ? 'G' : ''
        }
      });
      await modal.present();
    }
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

  private getApplicationStatus() {
    return new Promise((resolve) => {
      this.referencingService.getApplicationStatus(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, this.selectedData.applicationId).subscribe(res => {
        resolve(res);
      }, error => {
        resolve(false);
      });
    });
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

  resetFilter(){
    this.applicationFilterForm.reset(this.initiateForm());
    this.applicationFilterForm.markAsPristine();
    this.applicationFilterForm.markAsUntouched();
    this.applicationParams = new HttpParams().set('limit', '5').set('page', '1');
    this.rerenderApplications(true);
  }

  showMenu(event: any, id: any, data: any, className: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, className, true);
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
