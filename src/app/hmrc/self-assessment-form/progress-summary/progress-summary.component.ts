import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval } from 'rxjs';
import { DEFAULTS, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { HmrcService } from '../../hmrc.service';

@Component({
  selector: 'app-progress-summary',
  templateUrl: './progress-summary.component.html',
  styleUrls: ['./progress-summary.component.scss'],
})
export class ProgressSummaryComponent implements OnInit {
  batchCount: any;
  lookupdata: any;
  statementPreferences: any;
  batchList: any;
  NOT_AVAILABLE = DEFAULTS.NOT_AVAILABLE;
  totalSuccess: any;
  totalFinalRecords = 0;
  totalSuccessRecords = 0;
  failureRecords = 0;
  finalCount = 0;
  progressBarColor = 'danger';
  percentage = 0;

  constructor(
    private hmrcService: HmrcService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.getLookupData();
    this.startTimer();
    this.getLandlordBatchCount();
    this.getBatchCount();
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

  getLandlordBatchCount() {
    const filter = this.commonService.getItem('HMRC_FILTER', true);
    const reqObj: any = {
      managementType: filter.managementType ? filter.managementType : [],
      propertyOffice: filter.propertyOffice ? filter.propertyOffice : [],
      selectedPropertyLinkIds: filter.selectedPropertyLinkIds ? filter.selectedPropertyLinkIds : [],
      deselectedPropertyLinkIds: filter.deselectedPropertyLinkIds ? filter.deselectedPropertyLinkIds : [],
      taxHandler: filter.taxHandler
    }
    if (filter.searchText)
      reqObj.searchText = filter.searchText;
    if (filter.searchOnColumns)
      reqObj.searchOnColumns = filter.searchOnColumns;

    return new Promise((resolve) => {
      this.hmrcService.getLandlordBatchCount(reqObj).subscribe((res) => {
        const response = res && res.data ? res.data : '';
        response.forEach(element => {
          if (element.statementPreference !== null) {
            this.batchList = this.statementPreferences.map((x) => {
              if (x.index == element.statementPreference) {
                x.totalRecords = element.statementPreferenceCount;
                this.totalFinalRecords += element.statementPreferenceCount;
              }
              return x;
            });
          }
        });
        resolve(true);
      });
    });
  }

  startTimer() {
    const timer = interval(5000).subscribe((sec) => {
      // this.getBatchCount();

      //unsubscribe if the process is complete
      if (this.finalCount == 1)
        timer.unsubscribe();
    });
  }

  getBatchCount() {
    const params = new HttpParams().set('hideLoader', true);
    return new Promise((resolve) => {
      this.hmrcService.getBatchCount("82a03fab-4b58-46e7-a0e6-ca62e91fab74", params).subscribe((res) => {
        const response = res && res.data ? res.data : '';
        response.forEach(element => {
          if (element.statementPreference !== null) {
            this.batchList = this.statementPreferences.map((x) => {
              if (x.index == element.statementPreference) {
                x.totalSuccess = element.statementPreferenceCount;
                this.totalSuccessRecords += element.statementPreferenceCount;
                // this.totalSuccessRecords += 3;
                // this.failureRecords += 2;
                this.finalCount = (this.totalSuccessRecords + this.failureRecords) / this.totalFinalRecords;
                // this.finalCount = (this.totalSuccessRecords + this.failureRecords) / 1000;
                this.percentage = (this.finalCount * 100);
                if (this.finalCount >= 0.33 && this.finalCount < 0.66)
                  this.progressBarColor = 'warning';
                if (this.finalCount >= 0.66)
                  this.progressBarColor = 'success';
              }
              return x;
            });
          }
        });
        resolve(true);
      });
    });
  }

  redirectToHome() {
    this.router.navigate(['../self-assessment-form'], { replaceUrl: true, relativeTo: this.route });
  }
}
