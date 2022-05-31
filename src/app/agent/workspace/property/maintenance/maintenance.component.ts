import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss'],
})
export class MaintenanceComponent implements OnInit {
  dtOptions: any = {};
  localStorageItems: any = [];
  selectedEntityDetails: any = null;
  maintenanceList: any;
  
  constructor(private commonService: CommonService, private agentService: AgentService) { }

  ngOnInit() {
    this.initMaintenance();
  }

  private initMaintenance() {
    this.initApi();
    this.initDataTable();
  }
  private async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
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
        let params = new HttpParams()
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set("hideLoader", "true");
        this.agentService.getPropertyMaintenance(this.selectedEntityDetails.entityId, params).subscribe(res => {
          let maintenanceList = res && res.data ? res.data : [];
          this.maintenanceList = maintenanceList;
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        })
      },
      language: {
        processing: 'Loading...'
      }
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
}
