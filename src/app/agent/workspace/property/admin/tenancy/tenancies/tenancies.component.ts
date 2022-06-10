import { HttpParams } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DEFAULTS, DEFAULT_MESSAGES, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-tenancies',
  templateUrl: './tenancies.component.html',
  styleUrls: ['./tenancies.component.scss'],
})
export class TenanciesComponent implements OnInit {
  dtOptions: any = {};
  localStorageItems: any = [];
  selectedEntityDetails: any = null;
  tenancies: any;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  notAvailable = DEFAULTS.NOT_AVAILABLE
  lookupdata: any;
  officeLookup: any;
  contractTypeLookup: any;
  agreementStatusesLookup: any;
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  constructor(private commonService: CommonService, private agentService: AgentService) { }

  ngOnInit() {
    this.initTenancy();
  }

  private initTenancy() {
    this.initApi();
    this.initDt();
  }
  private async initApi() {
    this.getLookupData();
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
  }
  private initDt(): void {
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
        let params = new HttpParams()
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set("hideLoader", "true");
        this.agentService.getPropertyTenancies(this.selectedEntityDetails.entityId, params).subscribe(res => {
          let tenancies = res && res.data ? res.data : [];
          tenancies.map((data) => {
            data.contractType = data.contractType.toString();
            data.lapseToContract = data.lapseToContract.toString();
            const leadTenant = data?.tenants.filter(x => x.isLead);
            if (Array.isArray(leadTenant) && leadTenant.length > 0) {
              data.tenants = leadTenant[0];
            }
          });
          this.tenancies = tenancies;
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        })
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
    let item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      return item[0];
    }
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

  private setLookupData(data) {
    this.officeLookup = data.officeCodes;
    this.contractTypeLookup = data.contractTypes;
    this.agreementStatusesLookup = data.agreementStatuses;
  }
}
