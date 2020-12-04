import { Component, OnInit, ViewChildren, QueryList, ViewChild, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { LetAllianceService } from '../let-alliance.service';
import { PROPCO } from 'src/app/shared/constants';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'la-application-list',
  templateUrl: './application-list.page.html',
  styleUrls: ['./application-list.page.scss'],
})
export class ApplicationListPage implements OnInit, OnDestroy {
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;

  private lookupdata: any;
  laLookupdata: any;
  userLookupDetails: any[];
  officeCodes: any[];
  applicationList: any[];
  laProductList: any[];

  selectedData: any;
  applicationFilterForm: FormGroup;

  constructor(
    public commonService: CommonService,
    private letAllianceService: LetAllianceService,
    private router: Router,
    private fb: FormBuilder
    ) {
    this.getLookupData();
  }

  ngOnInit() {
    this.dtOptions = {
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
        .set('referencingType', 'LET_ALLIANCE')
        .set('limit', tableParams.length)
        .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1');
        this.letAllianceService.getLAApplicationList(params).subscribe(res => {
          this.applicationList = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
          //this.getLAProducts();
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
        {class: ''},
        { orderable: false }
      ],
      responsive: true
    };
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
    this.rerender(true);
    this.commonService.hideMenu('', 'divOverlay');
  }

  rerender(resetPaging): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload((res) => { }, resetPaging);
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
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
    this.userLookupDetails = data.userLookupDetails;
    this.officeCodes = data.officeCodes;
  }

  private setLALookupData(data: any) {
    this.userLookupDetails = data.userLookupDetails;
  }

  getLAApplicationList(){
    const params = new HttpParams()
      .set('referencingType', 'LET_ALLIANCE')
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

  getLAProducts(){
    this.letAllianceService.getLAProductList().subscribe(data => {
      this.laProductList = data;
    });
  }

  getProductType(productId): string{
    let productType;
    this.laProductList = this.laProductList && this.laProductList.length ? this.laProductList : [];
    this.laProductList.find((obj) => {
      if (obj.productId === productId) {
        productType = obj.productName;
      }
    })
    return productType;
  }

  refresh(){
    location.reload();
  }

  goBack() {
    history.back();
  }
}
