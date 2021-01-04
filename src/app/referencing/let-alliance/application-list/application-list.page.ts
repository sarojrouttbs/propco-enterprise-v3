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
  laLookupdata: any;
  officeCodes: any[] = [];
  applicationList: any[] = [];
  applicationStatus: any= {};
  applicationGrade: any= {};
  guarantorApplicationList = [];

  laProductList: any[] = [];
  laApplicantStatusTypes: any[] = [];
  laApplicantReferencingResultTypes: any[] = [];

  selectedData: any;
  applicationFilterForm: FormGroup;
  currentDate: string;

  error: any = { isError: false, errorMessage: "" };
  errorTo: any = { isError: false, errorMessage: "" };

  constructor(
    public commonService: CommonService,
    private referencingService: ReferencingService,
    private router: Router,
    private fb: FormBuilder,
    private modalController: ModalController,
    public datepipe: DatePipe
    ) {
    this.getLookupData();
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
      /* scrollY: '435px',
      scrollCollapse: false, */
      ajax: (tableParams: any, callback) => {
        const params = new HttpParams()
        .set('limit', tableParams.length)
        .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1');
        self.referencingService.getLAApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, params).subscribe(res => {
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
    },
      {
        validator: ValidationService.dateRangeValidator,
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

  private rerenderApplications(resetPaging?: any): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
  }

  getLAApplicationList(): void {
    const params = new HttpParams()
      .set('limit', '5')
      .set('page', '1')
      .set('officeCode', this.applicationFilterForm.get('officeCode').value)
      .set('searchTerm', this.applicationFilterForm.get('searchTerm').value)
      .set('fromDate', this.datepipe.transform(this.applicationFilterForm.get('fromDate').value, 'yyyy-MM-dd'))
      .set('toDate', this.datepipe.transform(this.applicationFilterForm.get('toDate').value, 'yyyy-MM-dd'));
    this.referencingService.getLAApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, params).subscribe(res => {
      this.applicationList = res && res.data ? res.data : [];
    });
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

  async checkApplicationGuarantor() {
    await this.getGuarantorApplicationList();
    if(this.guarantorApplicationList.length > 0){
      this.router.navigate([`let-alliance/guarantor-application-list`], { queryParams: { 
        it: 'G',
        applicantId: this.selectedData.applicantDetail.applicantId,
        applicationId: this.selectedData.applicationId,
        referenceNumber: this.selectedData.referenceNumber
      }})
      .then(() => {
        location.reload();
      });
    }
    else{
      const modal = await this.modalController.create({
        component: SimpleModalPage,
        cssClass: 'modal-container alert-prompt',
        backdropDismiss: false,
        componentProps: {
          data: 'There are no guarantors with this application, Do you wish to add one now?',
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
  
      const data = modal.onDidDismiss().then(res => {
        if (res.data.userInput) {
          this.router.navigate(['/let-alliance/guarantor-details'], { queryParams: { 
            applicantId: this.selectedData.applicantDetail.applicantId,
            applicationId: this.selectedData.applicationId,
            referenceNumber: this.selectedData.referenceNumber
           }, replaceUrl: true });
        } else {
        }
      });
  
      await modal.present();
    }
  }

  async resendLink() {
    const modal = await this.modalController.create({
      component: ResendLinkModalPage,
      cssClass: 'modal-container resend-link',
      backdropDismiss: false,
      componentProps: {
        paramApplicantId: this.selectedData.applicantDetail.applicantId,
        paramApplicationId: this.selectedData.applicationId,
        paramAropertyAddress: this.selectedData.propertyDetail.address
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

  private getGuarantorApplicationList() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getGuarantorApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, this.selectedData.applicationId).subscribe(
        res => {
          this.guarantorApplicationList = res && res.data ? res.data : [];
          resolve(this.guarantorApplicationList);
        },
        error => {
          console.log(error);
          resolve(this.guarantorApplicationList);
        }
      );
    });
    return promise;
  }

  private getApplicationStatus() {
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

  compareTwoDates() {
    if (this.applicationFilterForm.controls["toDate"].value) {
      if (!this.applicationFilterForm.controls["fromDate"].value) {
        this.errorTo = { isError: true, errorMessage: "From Date is required" };
      } else {
        this.errorTo = { isError: false, errorMessage: "" };

        if (
          new Date(this.applicationFilterForm.controls["toDate"].value) <
          new Date(this.applicationFilterForm.controls["fromDate"].value)
        ) {
          this.error = {
            isError: true,
            errorMessage: "End Date cannot before start date",
          };
        } else {
          this.error = { isError: false, errorMessage: "" };
        }
      }
    }
  }

  resetFilter(){
    this.applicationFilterForm.reset(this.initiateForm());
    this.applicationFilterForm.markAsPristine();
    this.applicationFilterForm.markAsUntouched();
  }

  showMenu(event: any, id: any, data: any, className: any, isCard?: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, data, className, isCard);
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
