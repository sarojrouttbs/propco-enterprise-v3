import { Component, OnInit, ViewChildren, QueryList, ViewChild, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { LetAllianceService } from '../let-alliance.service';
import { PROPCO } from 'src/app/shared/constants';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResendLinkModalPage } from 'src/app/shared/modals/resend-link-modal/resend-link-modal.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'la-application-list',
  templateUrl: './application-list.page.html',
  styleUrls: ['./application-list.page.scss'],
})
export class ApplicationListPage implements OnInit, OnDestroy {

  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any> = new Subject();
  notesDtTrigger: Subject<any> = new Subject();
  
  lookupdata: any;
  laLookupdata: any;
  userLookupDetails: any[] = [];
  officeCodes: any[] = [];
  applicationList: any[] = [];
  applicationNotes: any[] = [];

  laProductList: any[] = [];
  laCaseProductList: any[] = [];
  laApplicationProductList: any[] = [];

  notesCategories: any[] = [];
  notesComplaints: any[] = [];
  notesTypes: any[] = [];

  selectedData: any;
  applicationFilterForm: FormGroup;
  propertyId: any;

  constructor(
    public commonService: CommonService,
    private letAllianceService: LetAllianceService,
    private router: Router,
    private fb: FormBuilder,
    private modalController: ModalController,
    ) {
    this.getLookupData();
  }

  ngOnInit() {
    this.dtOptions[1] = this.buildDtOptions();
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
        self.letAllianceService.getLAApplicationList(params).subscribe(res => {
          self.applicationList = res && res.data ? res.data : [];
          self.getLAProductList();
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
          this.applicationNotes = [];
          this.rerenderNotes();
        });
      },
      columns: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        { orderable: false }
      ],
      responsive: true
    };
    setTimeout(() => {
      this.notesDtTrigger.next();
    }, 1000);

    this.initiateForm();
  }

  private initiateForm(): void {
    this.applicationFilterForm = this.fb.group({
      officeCodes: ['', ],
      searchKey: ['', ],
      fromDate: ['', ],
      toDate: ['', ]
    });
  }

  ionViewDidEnter() {
    this.rerenderApplications(true);
    this.commonService.hideMenu('', 'divOverlay');
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
    this.notesDtTrigger.unsubscribe();
  }
  
  async resendLinkToTenant() {
    const modal = await this.modalController.create({
      component: ResendLinkModalPage,
      cssClass: 'modal-container resend-link',
      backdropDismiss: false,
      componentProps: {
        applicantId: this.selectedData.applicantDetail.applicantId,
        applicationId: this.selectedData.applicationId,
        propertyAddress: this.selectedData.propertyDetail.address
      }
    });
    await modal.present();
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
      this.setLALookupData(this.lookupdata);
    } else {
      this.letAllianceService.getLALookupData().subscribe(data => {
        this.commonService.setItem(PROPCO.LA_LOOKUP_DATA, data);
        this.laLookupdata = data;
        this.setLALookupData(data);
      });
    }
  }

  private setLookupData(data: any): void {
    this.userLookupDetails = data.userLookupDetails;
    this.officeCodes = data.officeCodes;
    this.notesCategories = data.notesCategories;
    this.notesComplaints = data.notesComplaint;
    this.notesTypes = data.notesType;
  }

  private setLALookupData(data: any): void {
    this.userLookupDetails = data.userLookupDetails;
  }

  getLAApplicationList(): void {
    const params = new HttpParams()
      .set('limit', '5')
      .set('page', '1')
      .set('officeCodes', this.applicationFilterForm.controls['officeCodes'].value)
      .set('searchKey', this.applicationFilterForm.controls['searchKey'].value)
      .set('fromDate', this.applicationFilterForm.controls['fromDate'].value)
      .set('toDate', this.applicationFilterForm.controls['toDate'].value);
    this.letAllianceService.getLAApplicationList(params).subscribe(data => {
      this.applicationList = data;
    });
  }

  resendLink() {
      this.router.navigate([`let-alliance/tenant-list`]);
    }

  getLAProductList(): void {
    this.letAllianceService.getLAProductList().subscribe(
      res => {
        this.laProductList = res ? res : [];
      },
      error => {
        console.log(error);
    });
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

  showMenu(event: any, id: any, data: any, className: any, isCard?: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, data, className, isCard);
  }

  onClickRow(data: any, index?: number): void {
    this.selectedData = data;
    this.getApplicationNotes(this.selectedData.applicationId);
  }

  private buildDtOptions(): DataTables.Settings {
    return {
      paging: true,
      searching: false,
      ordering: false,
      responsive: true,
      lengthMenu:[5, 10, 15],
      pageLength: 5,
    };
  }

  private getApplicationNotes(applicationId: any) {
    /* this.letAllianceService.getApplicationNotes(applicationId).subscribe(res => {
      this.applicationNotes = res && res.data ? res.data : [];
      this.rerenderNotes();
    }); */
  }

  rerenderNotes(): void {
    if (this.dtElements && this.dtElements.last.dtInstance) {
      this.dtElements.last.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.notesDtTrigger.next();
      });
    }
  }

  rerenderApplications(resetPaging?): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
  }

  removeDuplicateObjects(array: any[]) {
    return [...new Set(array.map(res => JSON.stringify(res)))]
      .map(res1 => JSON.parse(res1));
  }

  getLookupValue(index: any, lookup: any, type?: any) {
    index = (type == 'category' && index) ? Number(index) : index;
    return this.commonService.getLookupValue(index, lookup);
  }

  showNoteDescription(noteText: any): void{
    if (noteText) {
      this.commonService.showAlert('Notes', noteText);
    }
  }

  refresh(){
    location.reload();
  }

  goBack() {
    history.back();
  }
}
