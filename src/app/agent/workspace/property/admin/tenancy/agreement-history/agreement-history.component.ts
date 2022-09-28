import { Component, Input, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { CHECKED_IN_OUT_STATUS, DATE_FORMAT, DEFAULTS } from 'src/app/shared/constants';

@Component({
  selector: 'app-agreement-history',
  templateUrl: './agreement-history.component.html'
})
export class AgreementHistoryComponent implements OnInit {
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  DATE_FORMAT = DATE_FORMAT;
  CHECKED_IN_OUT_STATUS = CHECKED_IN_OUT_STATUS;
  logHistoryList: any;
  historyDtOption: DataTables.Settings;
  historyDtTrigger: Subject<any> = new Subject();
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  @Input() selectedTenant;
  @Input() agreementStatusesLookup;
  tenant: any;

  constructor(private agentService: AgentService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedTenant && changes.selectedTenant.currentValue) {
      this.tenant = this.selectedTenant;
      this.getAgreementHistory(this.tenant?.agreementId);
    }
  }

  ngOnInit() {
    this.historyDtOption = this.buildDtOptions();
    setTimeout(() => {
      this.historyDtTrigger.next();
    }, 100);
  }

  private buildDtOptions(): DataTables.Settings {
    return {
      paging: true,
      searching: false,
      ordering: false,
      responsive: true,
      lengthMenu: [5, 10, 15],
      pageLength: 5,
    };
  }

  private getAgreementHistory(agreementId: string) {
    this.agentService.getAgreementHistory(agreementId).subscribe(res => {
      this.logHistoryList = res && res.data ? res.data : [];
      this.rerenderHistoryTable();
    });
  }

  private rerenderHistoryTable(): void {
    if (this.dtElements && this.dtElements.last.dtInstance) {
      this.dtElements.last.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.historyDtTrigger.next();
      });
    }
  }

}
