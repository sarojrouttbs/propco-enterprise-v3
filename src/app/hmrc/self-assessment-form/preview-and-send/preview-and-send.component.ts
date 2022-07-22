import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, PROPCO } from 'src/app/shared/constants';
import { HmrcService } from '../../hmrc.service';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-preview-and-send',
  templateUrl: './preview-and-send.component.html',
  styleUrls: ['./preview-and-send.component.scss'],
})
export class PreviewAndSendComponent implements OnInit {

  @Input() group: FormGroup;
  dtOption: any = {};
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  dtTrigger: Subject<any> = new Subject();
  params: any = new HttpParams();
  landlordList: any;
  totalPropertyLandlord = 0;
  lookupdata: any;
  statementPreferences: any;
  selectedLandlords: number[] = [];
  unSelectedLandlords: number[] = [];
  selectedHmrcLandlordCount = 0;

  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  DEFAULTS = DEFAULTS;
  DATE_FORMAT = DATE_FORMAT;

  @Output() onHmrcLandlordSelectPreview = new EventEmitter<any>();

  constructor(
    private hmrcService: HmrcService,
    public datepipe: DatePipe,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getLookupData();
    this.initDataTable();
    this.disableButton();
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
    this.statementPreferences = data.statementPreferences;
  }

  private initDataTable(): void {
    this.dtOption = {
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
        this.params = this.params
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set('taxHandler', this.group.value.taxHandler)
          .set('hideLoader', 'true');
        if (this.group.value.managementType)
          this.params = this.params.set('managementType', this.group.value.managementType);
        if (this.group.value.searchText)
          this.params = this.params.set('searchText', this.group.value.searchText);
        if (this.group.value.searchOnColumns)
          this.params = this.params.set('searchOnColumns', this.group.value.searchOnColumns)
        if (this.group.value.selectedPropertyLinkIds)
          this.params = this.params.set('selectedPropertyLinkIds', this.group.value.selectedPropertyLinkIds.toString());
        if (this.group.value.deselectedPropertyLinkIds)
          this.params = this.params.set('deselectedPropertyLinkIds', this.group.value.deselectedPropertyLinkIds.toString());
        this.hmrcService.getLandlords(this.params).subscribe(res => {
          this.landlordList = res && res.data ? res.data : [];
          this.totalPropertyLandlord = res ? res.count : 0;
          this.selectedHmrcLandlordCount = this.totalPropertyLandlord - this.unSelectedLandlords.length;
          this.landlordList.forEach(item => {
            item.checked = this.unSelectedLandlords.indexOf(item.propertyLinkId) >= 0 ? false : true;
          });
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        })
      }
    };

  }

  onCheckboxChange(e: any) {
    if (e.detail.checked) {
      this.selectedLandlords.push(e.detail.value);
      this.unSelectedLandlords.splice(this.unSelectedLandlords.indexOf(e.detail.value), 1);
      this.selectedHmrcLandlordCount += 1;
    } else {
      this.unSelectedLandlords.push(e.detail.value);
      this.selectedLandlords.splice(this.selectedLandlords.indexOf(e.detail.value), 1);
      this.selectedHmrcLandlordCount -= 1;
    }
    this.disableButton();
  }

  disableButton() {
    if (this.unSelectedLandlords.length > 0 && this.unSelectedLandlords.length === this.totalPropertyLandlord)
      this.onHmrcLandlordSelectPreview.emit('false');
    else
      this.onHmrcLandlordSelectPreview.emit('true');
  }
}
