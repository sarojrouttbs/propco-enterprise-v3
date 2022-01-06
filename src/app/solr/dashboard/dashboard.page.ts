import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { SolrService } from "../solr.service";
declare function openJavaLink(key: string): any;

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.page.html",
  styleUrls: ["./dashboard.page.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardPage implements OnInit {
  searchTerm;
  loggedInUserData;
  isItemAvailable = false;
  items = [];
  initializeItems() {
    this.items = ["Ram1", "Ram2", "Ram3"];
  }
  entityControl = new FormControl();

  entityList: string[] = [
    "Property",
    "Landlord",
    "Tenant",
    "Applicant",
    "Agent",
    "Contractor",
  ];
  constructor(private solrService: SolrService) {}

  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() !== "") {
      this.isItemAvailable = true;
      this.items = this.items.filter((item) => {
        return item.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    } else {
      this.isItemAvailable = false;
    }
  }

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

  OpenHomeCategory(key: string, value = null) {
    openJavaLink(key);
  }
}
