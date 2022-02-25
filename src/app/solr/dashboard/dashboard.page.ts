import { HttpParams } from "@angular/common/http";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { PROPCO } from "src/app/shared/constants";
import { CommonService } from "src/app/shared/services/common.service";
import { SolrService } from "../solr.service";
import { GuidedTourService } from "ngx-guided-tour";
import { GuidedTour, Orientation } from "../../shared/interface/guided-tour.model";
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
  dashboardTour: GuidedTour = {
    tourId: "solr-tour",
    useOrb: false,
    steps: [
      {
        title: "Welcome to the New Daashbord",
        content:
          "Just getting started? Let's take a look at the new user interface",
      },
      {
        title: "Step 1",
        selector: ".tour-1",
        content: "Select Entities",
        orientation: Orientation.Bottom,
      },
      {
        title: "Step 2",
        selector: ".tour-2",
        content: "Type anything to get suggestions",
        orientation: Orientation.Bottom,
      },
      {
        title: "Step 3",
        selector: ".tour-3",
        content: "Click this button to search result(s)",
        orientation: Orientation.Bottom,
      },
      {
        title: "Step 4",
        selector: ".tour-4",
        content: "Click this card(s) to open the details",
        orientation: Orientation.Right,
      },
    ],
  };

  constructor(
    private solrService: SolrService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private guidedTourService: GuidedTourService
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
      setTimeout(() => {
        this.guidedTourService.startTour(this.dashboardTour);
      }, 300);
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
