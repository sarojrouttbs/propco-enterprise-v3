import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Injector, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { SelectAllPlusSearchComponent } from 'src/app/select-all-plus-search/select-all-plus-search.component';
import { DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, HMRC, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { HmrcService } from '../../hmrc.service';
import { createCustomElement } from '@angular/elements';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-select-landlords',
  templateUrl: './select-landlords.component.html',
  styleUrls: ['./select-landlords.component.scss'],
})
export class SelectLandlordsComponent implements OnInit {

  dtOptions: any = {};
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  dtTrigger: Subject<any> = new Subject();

  landlordList: any;
  @Input() group: FormGroup;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  DEFAULTS = DEFAULTS;
  DATE_FORMAT = DATE_FORMAT;
  lookupdata: any;
  officeCodes: any;
  managementTypes: any;
  landlordParams: any = new HttpParams();
  checkedLandlords: number[] = [];
  uncheckedLandlords: number[] = [];
  gridCheckAll = false;
  hmrcConfigs = HMRC;
  totalPropertyLandlord = 0;
  selectedPropertyLandlordCount = 0;
  popoverOptions: any = {
    cssClass: 'hmrc-ion-select ion-select-auto'
  };

  @Output() onHmrcLandlordSelect = new EventEmitter<any>();


  constructor(
    private hmrcService: HmrcService,
    private commonService: CommonService,
    private injector: Injector
  ) {
    const element = createCustomElement(SelectAllPlusSearchComponent, {
      injector: this.injector
    });
    if (!customElements.get('c-select-all-plus-search')) {
      customElements.define(`c-select-all-plus-search`, element);
    }
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
          this.totalPropertyLandlord = res ? res.count : 0;
          this.landlordList.forEach(item => {
            item.checked = this.isLandlordChecked(item.propertyLinkId);
          });
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        })
      },
    };
  }

  rerenderLandlordList(resetPaging?): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
  }

  onselectAll() {
    this.checkedLandlords.length = 0;
    this.gridCheckAll = true;
    this.getRows(true);
    this.selectedPropertyLandlordCount = this.totalPropertyLandlord;
    this.onHmrcLandlordSelect.emit("true");
  }

  unselectAll() {
    this.uncheckedLandlords.length = 0;
    this.gridCheckAll = false;
    this.getRows(false);
    this.selectedPropertyLandlordCount = 0;
    this.onHmrcLandlordSelect.emit("false");
  }

  private isLandlordChecked(propertyLinkId: number) {
    if (!this.gridCheckAll) {
      return this.checkedLandlords.indexOf(propertyLinkId) >= 0 ? true : false;
    } else {
      return this.uncheckedLandlords.indexOf(propertyLinkId) >= 0 ? false : true;
    }

  }

  getRows(selected: boolean) {
    this.dtTrigger.next();
    this.dtElements.first.dtInstance.then((dtInstance: any) => {
      const elements = [];
      $('td', dtInstance.table(0).node()).find('ion-checkbox');
      const checkboxElement = $('td', dtInstance.table(0).node()).find('ion-checkbox');
      elements.push(checkboxElement)
      const temp = elements[0]
      for (const item of temp) {
        if (!selected) {
          if (item.checked) {
            item.checked = false;
          }
        } else {
          item.checked = true;
        }
      };
    });
  }

  applyFilters() {
    this.unselectAll();
    if (this.group.value.managementType) {
      this.landlordParams = this.landlordParams.set('managementType', this.group.value.managementType);
    }
    if (this.group.value.searchText && this.group.value.searchText.length > 3) {
      this.landlordParams = this.landlordParams.set('searchText', this.group.value.searchText);
      if (this.group.value.searchOnColumns) {
        this.landlordParams = this.landlordParams.set('searchOnColumns', this.group.value.searchOnColumns);
      }
    }
    this.rerenderLandlordList();
  }

  resetFilters() {
    this.unselectAll();
    this.landlordParams = new HttpParams();
    this.group.reset();
    this.group.markAsUntouched();
    this.rerenderLandlordList();
  }

  onCheckboxClick(data) {
    const value: any = document.getElementById('checkbox_' + data).getAttribute('ng-reflect-value');
    const isChecked: any = document.getElementById('checkbox_' + data).getAttribute('aria-checked');
    if (isChecked === "true") {
      this.checkedLandlords.splice(this.checkedLandlords.indexOf(+value), 1);
      this.uncheckedLandlords.push(+value);
      this.selectedPropertyLandlordCount -= 1;
    } else {
      this.uncheckedLandlords.splice(this.uncheckedLandlords.indexOf(+value), 1);
      this.checkedLandlords.push(+value);
      this.selectedPropertyLandlordCount += 1;
    }
    if ((this.gridCheckAll && this.uncheckedLandlords.length > 0)
      || (!this.gridCheckAll && this.checkedLandlords.length > 0))
      this.onHmrcLandlordSelect.emit("true");
    else this.onHmrcLandlordSelect.emit("false");
  }

}
