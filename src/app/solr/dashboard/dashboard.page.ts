import { HttpParams } from "@angular/common/http";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { PROPCO } from "src/app/shared/constants";
import { CommonService } from "src/app/shared/services/common.service";
import { SolrService } from "../solr.service";
declare function openJavaLink(key: string, value: any): any;

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
  suggestions = [];
  initializeItems() {
    this.suggestions = [];
  }
  hideSuggestion: boolean = false;
  entityControl = new FormControl(["PROPERTY"]);
  private solrSuggestionConfig = {
    limit: "30",
    searchTerm: "",
    searchTypes: "",
    searchSwitch: "true",
  };

  entityList: string[] = [
    "PROPERTY",
    "LANDLORD",
    "TENANT",
    "APPLICANT",
    "AGENT",
    "CONTRACTOR",
  ];
  lookupdata: any;
  officeLookupDetails: any;
  officeLookupMap = new Map();
  showLoader: boolean = false;
  constructor(
    private solrService: SolrService,
    private commonService: CommonService
  ) {}

  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    const searchText = ev.target.value;

    // if the value is an empty string don't filter the items
    if (searchText && searchText.trim() !== "" && searchText.length > 3) {
      this.showLoader = true;
      this.getSuggestions(this.prepareSearchParams(searchText));
    } else {
      this.isItemAvailable = false;
    }
  }

  private prepareSearchParams(searchText: string) {
    return (
      new HttpParams()
        // .set("limit", this.solrSuggestionConfig.limit)
        .set("searchTerm", searchText)
        .set("searchTypes", this.entityControl.value)
        .set("searchSwitch", this.solrSuggestionConfig.searchSwitch)
        .set("hideLoader", "true")
    );
  }

  ngOnInit() {
    this.initDashboard();
  }

  private initDashboard() {
    this.getLookupData();
    this.initApiCalls();
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe((data) => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }
  }

  private setLookupData(data) {
    this.setOfficeLookupMap(data.officeCodes);
  }

  private setOfficeLookupMap(data) {
    if (data) {
      this.officeLookupDetails = data;
      data.map((occ, index) => {
        this.officeLookupMap.set(occ.index, occ.value);
      });
    }
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

  private getSuggestions(params: HttpParams) {
    this.solrService.entityGetSuggestion(params).subscribe((res) => {
      this.suggestions = res ? res : [];
      if (this.suggestions.length > 0) {
        this.isItemAvailable = true;
      }
      this.showLoader = false;
    });
  }

  openHomeCategory(key: string, value = null) {
    openJavaLink(key, value);
  }
}
