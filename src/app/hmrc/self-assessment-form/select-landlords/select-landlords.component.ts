import { HttpParams } from '@angular/common/http';
import { Component, Injector, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { SelectAllPlusSearchComponent } from 'src/app/select-all-plus-search/select-all-plus-search.component';
import { DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { HmrcService } from '../../hmrc.service';
import { createCustomElement } from '@angular/elements';

@Component({
  selector: 'app-select-landlords',
  templateUrl: './select-landlords.component.html',
  styleUrls: ['./select-landlords.component.scss'],
})
export class SelectLandlordsComponent implements OnInit {

  dtOptions: any = {};
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  landlordList: any;
  @Input() group;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  DEFAULTS = DEFAULTS;
  DATE_FORMAT = DATE_FORMAT;
  lookupdata: any;
  officeCodes: any;
  managementTypes: any;
  private filterValue: number;
  landlordParams: any = new HttpParams();

  constructor(
    private hmrcService: HmrcService,
    private commonService: CommonService,
    private injector: Injector
  ) {
    const element = createCustomElement(SelectAllPlusSearchComponent, {
      injector: this.injector
    });
    customElements.define(`c-select-all-plus-search`, element);
  }

  ngOnInit() {
    this.getLookupData();
    this.initDataTable();
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }
  }

  private setLookupData(data: any) {
    this.officeCodes = data.officeCodes;
    this.managementTypes = data.managementTypes;
  }

  private initDataTable(): void {
    this.dtOptions = {
      paging: true,
      pagingType: 'full_numbers',
      serverSide: true,
      processing: true,
      searching: false,
      ordering: false,
      pageLength: 5,
      lengthMenu: [5, 10, 15],
      autoWidth: true,
      responsive: true,
      ajax: (tableParams: any, callback) => {
        this.landlordParams = this.landlordParams
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set('hideLoader', 'true');
        this.hmrcService.getLandlords(this.landlordParams).subscribe(res => {
          this.landlordList = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        })
      },
    };
  }

  onManagementChange() {
    this.landlordParams = this.landlordParams.set('managementType', this.group.value.managementType);
    this.rerenderLandlordList();
  }

  rerenderLandlordList(resetPaging?): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
  }
}
