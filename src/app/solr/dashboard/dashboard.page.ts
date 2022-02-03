import { HttpParams } from "@angular/common/http";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { PROPCO } from "src/app/shared/constants";
import { CommonService } from "src/app/shared/services/common.service";
import { SolrService } from "../solr.service";
declare function openScreen(key: string, value: any): any;

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.page.html",
  styleUrls: ["./dashboard.page.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardPage implements OnInit {
  loggedInUserData;
  isAuthSuccess: boolean = false;

  hideSuggestion: boolean = false;
  entityControl = new FormControl(["Property"]);
  loaded: boolean = false;

  constructor(
    private solrService: SolrService,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.initDashboard();
  }

  private initDashboard() {
    this.initApiCalls();
  }

  private async initApiCalls() {
    let isAuthSuccess = await this.authenticateSso();
    if (isAuthSuccess) {
      this.loggedInUserData = await this.getUserDetails();
      this.loaded = true;
    }
  }

  private getUserDetails() {
    let params = new HttpParams().set("hideLoader", "true");
    return new Promise((resolve, reject) => {
      this.solrService.getUserDetails(params).subscribe(
        (res) => {
          resolve(res ? res.data[0] : "");
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  private authenticateSso() {
    var snapshot = this.route.snapshot;
    let ssoKey = encodeURIComponent(snapshot.queryParams.ssoKey);
    return new Promise((resolve, reject) => {
      this.solrService
        .authenticateSsoToken(ssoKey)
        .toPromise()
        .then(
          (response) => {
            this.isAuthSuccess = true;
            this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
            this.commonService.setItem(PROPCO.ACCESS_TOKEN, response.loginId);
            this.commonService.setItem(PROPCO.WEB_KEY, response.webKey);
            resolve(true);
          },
          (err) => {
            // resolve(true);
            reject(false);
          }
        );
    });
  }

  openHomeCategory(key: string, value = null) {
    openScreen(key, value);
  }
}
