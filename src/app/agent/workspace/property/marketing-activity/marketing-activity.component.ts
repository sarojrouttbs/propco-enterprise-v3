import { HttpParams } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DATE_FORMAT, DATE_RANGE_CONFIG, DATE_RANGE_CONFIG_LIST, DEFAULTS, DEFAULT_MESSAGES, MARKETING_ACTIVITY_TYPES } from 'src/app/shared/constants';
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
  DEFAULTS = DEFAULTS;
  quickFilterType = new FormControl();
  fromDate = new FormControl();
  toDate = new FormControl();
  showOnlyCurrentActivity = new FormControl(false);
  DATE_FORMAT = DATE_FORMAT;
  DATE_RANGE_CONFIG_LIST = DATE_RANGE_CONFIG_LIST;
  currentDate = new Date();
  requestParams = new HttpParams();

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
    this.getMarketingActivity();
  }

  private async getMarketingActivity() {
    this.marketingActivityDetails = [];
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
    this.requestParams = this.requestParams.set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getMarketingActivity(propertyId, this.requestParams).subscribe(
        (res) => {
          resolve(res ? res : []);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  private async configureTableData() {
    this.marketActivityListing = [];
    if (this.marketingActivityDetails.length > 0) {
      const groupedApplicantObj = this.groupArrayOfObjects(this.marketingActivityDetails, 'applicantId');
      const groupedApplicantArr = Object.values(groupedApplicantObj);
      this.marketActivityListing = await this.marketActivityListingData(groupedApplicantArr);
    }
    this.reRenderData();
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
  }

  onFilterChange(selectedRange: string) {
    this.toDate.setValue(this.commonService.getFormatedDate(this.currentDate, this.DATE_FORMAT.YEAR_DATE));
    switch (selectedRange) {
      case DATE_RANGE_CONFIG.WEEK_TO_DATE:
        this.getFirstDayOfWeek(new Date())
        const firstDayOfWeek = this.getFirstDayOfWeek(new Date());
        this.fromDate.setValue(this.commonService.getFormatedDate(firstDayOfWeek, this.DATE_FORMAT.YEAR_DATE));
        break;
      case DATE_RANGE_CONFIG.MONTH_TO_DATE:
        const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        this.fromDate.setValue(this.commonService.getFormatedDate(firstDayOfMonth, this.DATE_FORMAT.YEAR_DATE));
        break;
      case DATE_RANGE_CONFIG.YEAR_TO_DATE:
        const firstDayOfYear = new Date(this.currentDate.getFullYear(), 0);
        this.fromDate.setValue(this.commonService.getFormatedDate(firstDayOfYear, this.DATE_FORMAT.YEAR_DATE));
        break;
      case DATE_RANGE_CONFIG.LAST_MONTH:
        const firstDayOfLastMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 0, 0);
        this.fromDate.setValue(this.commonService.getFormatedDate(firstDayOfLastMonth, this.DATE_FORMAT.YEAR_DATE));
        this.toDate.setValue(this.commonService.getFormatedDate(lastDayOfLastMonth, this.DATE_FORMAT.YEAR_DATE));
        break;
    }
    this.requestParams = this.requestParams.set('dateRange.from', this.fromDate.value);
    this.requestParams = this.requestParams.set('dateRange.to', this.toDate.value);
    this.getMarketingActivity();
  }

  private getFirstDayOfWeek(currentDate: Date) {
    const date = new Date(currentDate);
    const day = (date.getDay() + 1);
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  }

  applyFilters() {
    this.requestParams = this.requestParams.set('dateRange.from', this.fromDate.value ? this.commonService.getFormatedDate(this.fromDate.value, this.DATE_FORMAT.YEAR_DATE) : '');
    this.requestParams = this.requestParams.set('dateRange.to', this.toDate.value ? this.commonService.getFormatedDate(this.toDate.value, this.DATE_FORMAT.YEAR_DATE) : '');
    // this.requestParams = this.requestParams.set('showOnlyCurrentActivity', this.showOnlyCurrentActivity.value);
    this.getMarketingActivity();
  }

  resetFilters() {
    this.quickFilterType.reset();
    this.fromDate.reset();
    this.toDate.reset();
    this.showOnlyCurrentActivity.reset();
    this.requestParams = new HttpParams();
    this.getMarketingActivity();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}