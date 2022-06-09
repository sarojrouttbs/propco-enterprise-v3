import { HttpParams } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DEFAULT_MESSAGES, MARKETING_ACTIVITY_TYPES } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-marketing-activity',
  templateUrl: './marketing-activity.component.html',
  styleUrls: ['./marketing-activity.component.scss'],
})
export class MarketingActivityComponent implements OnInit {
  localStorageItems: any = [];
  selectedEntityDetails: any = null;
  activeLink: any;
  marketingActivityDetails: any;
  marketActivityListing: any[];
  dtOption: DataTables.Settings;
  dtTrigger: Subject<any> = new Subject();
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  emailCountTotal: number = 0;
  smsCountTotal: number = 0;
  mailshotCountTotal: number = 0;
  viewingBookedCountTotal: number = 0;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;

  constructor(private router: Router, private agentService: AgentService, private commonService: CommonService) { }

  ngOnInit() {
    this.initAPICalls();
    this.dtOption = this.buildDtOptions();
    setTimeout(() => {
      this.dtTrigger.next();
    }, 100);
  }

  private buildDtOptions(): DataTables.Settings {
    return {
      paging: true,
      info: true,
      searching: false,
      ordering: false,
      responsive: true,
      lengthMenu: [5, 10, 15],
      pageLength: 5,
      language: {
        processing: '<ion-spinner name="dots"></ion-spinner>'
      }
    };
  }

  private reRenderData(): void {
    if (this.dtElements && this.dtElements.last.dtInstance) {
      this.dtElements.last.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    }
  }

  private async initAPICalls() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.marketingActivityDetails = await this.getMarketingActivityDetails(this.selectedEntityDetails.entityId);
    this.configureTableData();
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
      this.router.navigate([
        `agent/workspace/property/${item[0].entityId}/marketing-activity`,
      ]);
      this.activeLink = item[0].entityId;
      return item[0];
    }
  }

  private getMarketingActivityDetails(propertyId: string) {
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getMarketingActivity(propertyId, params).subscribe(
        (res) => {
          resolve(res ? res : []);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  private async configureTableData() {
    if (this.marketingActivityDetails.length > 0) {
      const groupedApplicantObj = this.groupArrayOfObjects(this.marketingActivityDetails, "applicantId");
      const groupedApplicantArr = Object.values(groupedApplicantObj);
      this.marketActivityListing = await this.marketActivityListingData(groupedApplicantArr);
      this.reRenderData();
    }
  }

  private marketActivityListingData(groupedApplicantArr: Array<any>) {
    const finalGroupedArr = [];
    let emailCount: number = 0;
    let smsCount: number = 0;
    let mailshotCount: number = 0;
    let viewingBookedCount: number = 0;

    this.emailCountTotal = 0;
    this.smsCountTotal = 0;
    this.mailshotCountTotal = 0;
    this.viewingBookedCountTotal = 0;
    groupedApplicantArr.forEach((elementByApplicant: Array<any>) => {
      emailCount = 0;
      smsCount = 0;
      mailshotCount = 0;
      viewingBookedCount = 0;
      elementByApplicant.forEach(element => {
        switch (element.valueType) {
          case MARKETING_ACTIVITY_TYPES.EMAIL:
            emailCount = emailCount + element.valueTypeCount;
            this.emailCountTotal = this.emailCountTotal + element.valueTypeCount;
            break;
          case MARKETING_ACTIVITY_TYPES.SMS:
            smsCount = smsCount + element.valueTypeCount;
            this.smsCountTotal = this.smsCountTotal + element.valueTypeCount;
            break;
          case MARKETING_ACTIVITY_TYPES.MAILSHOT:
            mailshotCount = mailshotCount + element.valueTypeCount;
            this.mailshotCountTotal = this.mailshotCountTotal + element.valueTypeCount;
            break;
          case MARKETING_ACTIVITY_TYPES.VIEWED:
          case MARKETING_ACTIVITY_TYPES.BOOKED:
            viewingBookedCount = viewingBookedCount + element.valueTypeCount;
            this.viewingBookedCountTotal = this.viewingBookedCountTotal + element.valueTypeCount;
            break;
        }
      });
      let applicantObj = {} as any;
      applicantObj.applicantId = elementByApplicant[0].applicantId;
      applicantObj.applicantName = elementByApplicant[0].applicantName;
      applicantObj.email = emailCount;
      applicantObj.sms = smsCount;
      applicantObj.mailshot = mailshotCount;
      applicantObj.viewing_booked = viewingBookedCount;
      applicantObj.reason = elementByApplicant[0].reason;
      finalGroupedArr.push(applicantObj);
    });
    return finalGroupedArr;
  }

  private groupArrayOfObjects(list: Array<any>, key: string) {
    // grouping by applicantId
    return list.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}