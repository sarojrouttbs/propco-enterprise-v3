import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AgentService } from 'src/app/agent/agent.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-tearms-of-business',
  templateUrl: './tearms-of-business.component.html',
  styleUrls: ['./tearms-of-business.component.scss'],
})
export class TearmsOfBusinessComponent implements OnInit {

  @Input() group;
  @Input() propertyDetails;
  versionList: any;
  currentDate = this.commonService.getFormatedDate(new Date());
  versionHistoryList: any;

  constructor(
    private agentService: AgentService,
    private commonService: CommonService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyDetails && !changes.propertyDetails.firstChange) {
      this.propertyDetails = this.propertyDetails;
      this.getVersionHistory(this.propertyDetails.propertyId);
    }
  }

  ngOnInit() {
    this.initApi();
  }

  initApi() {
    this.getTobVersionList();
  }

  getTobVersionList() {
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getTobVersionList(params).subscribe(
        (res) => {
          this.versionList = res && res.data ? res.data.filter((x) => !(x.withdrawnDate != null && x.withdrawnDate < this.currentDate)) : '';
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  getVersionHistory(propertyId) {
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getVersionHistory(propertyId, params).subscribe(
        (res) => {
          this.versionHistoryList = res && res.data ? res.data : '';
          if (this.propertyDetails.propertyInfo?.currentTOB) {
            this.group.get('version').patchValue(this.propertyDetails.propertyInfo?.currentTOB)
          }
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }
}
