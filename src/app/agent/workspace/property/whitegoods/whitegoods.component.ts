import { HttpParams } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-whitegoods',
  templateUrl: './whitegoods.component.html',
  styleUrls: ['./whitegoods.component.scss'],
})
export class WhitegoodsComponent implements OnInit {

  dtOptions: any = {};
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  localStorageItems: any;
  selectedEntityDetails: any;
  propertyDetails: any;
  activeLink: any;
  selectedData: any;
  whitegoodsList: any;
  lookupdata: any;
  certificateTypes: any;
  DATE_FORMAT = DATE_FORMAT;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  isArchived = new FormControl(false);
  whitegoodsParams = new HttpParams();
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  isArchivedChecked: any;

  constructor(
    private agentService: AgentService,
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initApi();
    this.initDataTable();
    this.getLookupData();
  }

  private async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyDetails = await this.getPropertyDetails(this.selectedEntityDetails.entityId);
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
        this.whitegoodsParams = this.whitegoodsParams
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set('hideLoader', 'true');
        if (this.isArchivedChecked) {
          this.whitegoodsParams = this.whitegoodsParams.set('isArchived', '');
        } else {
          this.whitegoodsParams = this.whitegoodsParams.set('isArchived', 'false');
        }
        this.agentService.getWhitegoodsList(this.selectedEntityDetails.entityId, this.whitegoodsParams).subscribe(res => {
          this.whitegoodsList = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        })
        this.hideMenu('', 'whitegoods-overlay');
      },
    };
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
      this.router.navigate([
        `agent/workspace/property/${item[0].entityId}/whitegoods`,
      ]);
      this.activeLink = item[0].entityId;
      return item[0];
    }
  }

  private getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    const promise = new Promise((resolve, reject) => {
      this.agentService.getPropertyDetails(propertyId, params).subscribe(
        (res) => {
          resolve(res?.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  showMenu(event: any, id: any, data: any, className: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, className, true);
  }

  hideMenu(event: any, id: any) {
    this.commonService.hideMenu(event, id);
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
    this.certificateTypes = data.certificateTypes;
  }

  checkboxClick() {
    this.isArchivedChecked = this.isArchived.value;
    this.rerenderWhitegoods();
  }

  private rerenderWhitegoods(resetPaging?: any): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
  }
}
