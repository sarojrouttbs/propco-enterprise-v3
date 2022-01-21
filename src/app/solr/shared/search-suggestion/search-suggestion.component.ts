import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { PROPCO } from "src/app/shared/constants";
import { CommonService } from "src/app/shared/services/common.service";
import { SolrService } from "../../solr.service";
declare function openScreen(key: string, value: any): any;

@Component({
  selector: "app-search-suggestion",
  templateUrl: "./search-suggestion.component.html",
  styleUrls: ["./search-suggestion.component.scss"],
})
export class SearchSuggestionComponent implements OnInit {
  searchTerm;
  initializeItems() {
    this.suggestions = [];
  }
  isItemAvailable = false;
  suggestions = [];
  entityControl = new FormControl(["Property"]);
  searchTermControl = new FormControl();
  private solrSuggestionConfig = {
    limit: "30",
    searchTerm: "",
    searchTypes: "",
    searchSwitch: "true",
  };

  entityList: string[] = [
    "Property",
    "Landlord",
    "Tenant",
    "Applicant",
    "Agent",
    "Contractor",
  ];
  lookupdata: any;
  officeLookupDetails: any;
  officeLookupMap = new Map();
  showLoader: boolean = false;
  constructor(
    private solrService: SolrService,
    private commonService: CommonService,
    private router: Router
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
        .set("searchTypes", this.transformToUpperCase(this.entityControl.value))
        .set("searchSwitch", this.solrSuggestionConfig.searchSwitch)
        .set("hideLoader", "true")
    );
  }

  private transformToUpperCase(data: any) {
    return data.map((x: string) => {
      return x.toUpperCase();
    });
  }

  ngOnInit() {
    this.initDashboard();
  }

  private initDashboard() {
    this.getLookupData();
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
    openScreen(key, value);
  }

  goToPage() {
    this.router.navigate(["/solr/search-results"], {
      queryParams: {
        searchTerm: this.searchTermControl.value,
        type: this.transformToUpperCase(this.entityControl.value),
      },
    });
  }
}
