import { HttpParams } from "@angular/common/http";
import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatDrawer } from "@angular/material/sidenav";
import { ActivatedRoute } from "@angular/router";
import { SolrService } from "../solr.service";

@Component({
  selector: "app-search-results",
  templateUrl: "./search-results.page.html",
  styleUrls: ["./search-results.page.scss"],
  host: {
    '(document:keypress)': 'handleKeyboardEvent($event)'
  }
})
export class SearchResultsPage implements OnInit {
  showFiller = true;
  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
  priceKnobValues: Object = {
    upper: 200,
    lower: 2000,
  };
  bedKnobValues: Object = {
    upper: 1,
    lower: 10,
  };
  toppings = new FormControl();
  private solrSearchConfig = {
    types: "",
    searchTerm: "*",
    page: "1",
    limit: "5",
  };

  toppingList: string[] = [
    "Extra cheese",
    "Mushroom",
    "Onion",
    "Pepperoni",
    "Sausage",
    "Tomato",
  ];

  public pageSize = 5;
  results: any[] = [];
  pageEvent: PageEvent;
  length: number;
  pageIndex: number = 1;
  opened: boolean;
  loaded: boolean = false;
  key;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatDrawer) drawer: MatDrawer;

  constructor(
    private route: ActivatedRoute,
    private solrService: SolrService
  ) {}

  ngOnInit() {
    this.initResults();
    this.getSearchResults();
  }

  private async initResults() {
    await this.getQueryParams();
  }

  private getQueryParams() {
    const promise = new Promise((resolve, reject) => {
      this.route.queryParams.subscribe((params) => {
        this.solrSearchConfig.types = params["type"]
          ? params["type"]
          : "PROPERTY";
        this.solrSearchConfig.searchTerm = params["searchTerm"]
          ? params["searchTerm"]
          : "*";
      });
    });
    return promise;
  }

  getSearchResults() {
    this.solrService
      .entitySearch(this.prepareSearchParams())
      .subscribe((res) => {
        this.results = res ? res.data : [];
        console.log(this.results);
        this.length = res.count;
        this.opened = true;
        this.loaded = true;
        // this.iterator();
      });
  }

  private prepareSearchParams() {
    return new HttpParams()
      .set("limit", this.pageSize.toString())
      .set("page", this.pageIndex.toString())
      .set("searchTerm", this.solrSearchConfig.searchTerm)
      .set("types", this.solrSearchConfig.types);
  }

  public customFormatter(value: number) {
    return `£${value}`;
  }

  public handlePage(e: any) {
    this.pageIndex = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getSearchResults();
    return e;
  }

  public isAgentApproved(agentApproved) {
    let value = "";
    if (agentApproved === true) {
      value = "Agency Approved";
    }
    return value;
  }

  handleKeyboardEvent(event: KeyboardEvent) { 
    this.key = event.key;
    if(this.key === '['){
      this.drawer.toggle();
    }
  }
}
