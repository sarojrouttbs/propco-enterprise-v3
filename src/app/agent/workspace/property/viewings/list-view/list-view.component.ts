import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
})
export class ListViewComponent implements OnInit, OnChanges {

  @Input() viewingForm;
  @Input() viewingsParams;
  viewingList: any;
  DATE_FORMAT = DATE_FORMAT;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  notAvailable = DEFAULTS.NOT_AVAILABLE
  dtOptions: any = {};
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  selectedData: any;
  localStorageItems: any;
  selectedEntityDetails: any;

  constructor(
    private agentService: AgentService,
    private commonService: CommonService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.viewingsParams && changes.viewingsParams.currentValue) {
      if (this.viewingForm.value.fromDate && this.viewingForm.value.toDate) {
        this.rerenderViewingList();
      }
    }
  }

  ngOnInit() {
    this.initApi();
    this.getViewings();
  }

  async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
  }

  private fetchItems() {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }

  private getActiveTabEntityInfo() {
    const item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      return item[0];
    }
  }

  getViewings(): void {
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
        this.viewingsParams = this.viewingsParams
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set('hideLoader', 'true');
        this.agentService.getViewings(this.selectedEntityDetails.entityId, this.viewingsParams).subscribe(res => {
          console.log(res);
          this.viewingList = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        })
        this.hideMenu('', 'viewings-overlay');
      }
    };
  }

  private rerenderViewingList(resetPaging?): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
  }

  showMenu(event: any, id: any, data: any, className: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, className, true);
  }

  hideMenu(event: any, id: any) {
    this.commonService.hideMenu(event, id);
  }
}
