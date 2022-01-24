import { Component, OnInit, ViewEncapsulation } from "@angular/core";
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

  hideSuggestion: boolean = false;

  constructor(private solrService: SolrService) {}

  ngOnInit() {
    this.initDashboard();
  }

  private initDashboard() {
    this.initApiCalls();
  }

  private async initApiCalls() {
    this.loggedInUserData = await this.getUserDetails();
  }

  private getUserDetails() {
    return new Promise((resolve, reject) => {
      this.solrService.getUserDetails().subscribe(
        (res) => {
          resolve(res ? res.data[0] : "");
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  openHomeCategory(key: string, value = null) {
    openScreen(key, value);
  }
}
