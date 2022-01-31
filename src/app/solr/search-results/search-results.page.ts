import { HttpParams } from "@angular/common/http";
import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatDrawer } from "@angular/material/sidenav";
import { ActivatedRoute } from "@angular/router";
import { PROPCO } from "src/app/shared/constants";
import { CommonService } from "src/app/shared/services/common.service";
import { SolrService } from "../solr.service";
declare function openScreen(key: string, value: any): any;

@Component({
  selector: "app-search-results",
  templateUrl: "./search-results.page.html",
  styleUrls: ["./search-results.page.scss"],
  host: {
    "(document:keypress)": "handleKeyboardEvent($event)",
  },
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
    upper: 2000,
    lower: 200,
  };
  bedKnobValues: Object = {
    upper: 10,
    lower: 1,
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
  entityControl = new FormControl([]);
  propertyCheck = new FormControl();
  landlordCheck = new FormControl();
  tenantCheck = new FormControl();
  applicantCheck = new FormControl();
  agentCheck = new FormControl();
  contractorCheck = new FormControl();

  propertyFilter: FormGroup;
  landlordFilter: FormGroup;
  tenantFilter: FormGroup;
  agentFilter: FormGroup;
  contractorFilter: FormGroup;
  applicantFilter: FormGroup;

  lookupdata: any;
  managementTypes;
  propertyStyles;
  houseTypes;
  propertyStatuses;
  officeCodes;
  landlordStatuses;
  applicantStatuses;
  tenantStatuses;
  contractorStatuses;
  contractorSkills;

  refreshType: string;
  isAllselected: boolean = false;
  entityList: string[] = [
    "Property",
    "Landlord",
    "Tenant",
    "Applicant",
    "Agent",
    "Contractor",
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatDrawer) drawer: MatDrawer;

  constructor(
    private route: ActivatedRoute,
    private solrService: SolrService,
    private fb: FormBuilder,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.initResults();
    this.initFilterForm();
    this.entityControl.valueChanges.subscribe(() => {});
  }

  private async initResults() {
    this.getLookupData();
    await this.getQueryParams();
    this.initFilter();
    this.getSearchResults();
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
    this.managementTypes = data.managementTypes;
    this.propertyStyles = data.propertyStyles;
    this.houseTypes = data.houseTypes;
    this.propertyStatuses = data.propertyStatuses;
    this.officeCodes = data.officeCodes;
    this.landlordStatuses = data.landlordStatuses;
    this.applicantStatuses = data.applicantStatuses;
    this.tenantStatuses = data.tenantStatuses;
    this.contractorSkills = data.contractorSkills;
    this.contractorStatuses = data.contractorStatuses;
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
        resolve(true);
      });
    });
    return promise;
  }

  private initFilter() {
    if (this.solrSearchConfig.types) {
      let types: string[] = Array.isArray(this.solrSearchConfig.types)
        ? this.solrSearchConfig.types
        : [this.solrSearchConfig.types];
      this.entityControl.setValue(types);
      this.emptyEntityChecksCtrl();
      types.map((res) => {
        if (res === "Property") {
          this.propertyCheck.setValue(true);
        } else if (res === "Landlord") {
          this.landlordCheck.setValue(true);
        } else if (res === "Tenant") {
          this.tenantCheck.setValue(true);
        } else if (res === "Applicant") {
          this.applicantCheck.setValue(true);
        } else if (res === "Agent") {
          this.agentCheck.setValue(true);
        } else if (res === "Contractor") {
          this.contractorCheck.setValue(true);
        }
      });
    }
  }

  initFilterForm() {
    this.propertyFilter = this.fb.group({
      rentType: "DEFAULT_RENT",
      propertyRent: this.priceKnobValues,
      numberOfBedroom: this.bedKnobValues,
      managementType: [[]],
      propertyStyle: [[]],
      houseType: [[]],
      status: [[]],
      propertyNegotiator: [[]],
      propertyManager: [[]],
      officeCode: [[]],
    });
    this.landlordFilter = this.fb.group({
      status: [[]],
      officeCode: [[]],
      isOverseas: false,
    });
    this.tenantFilter = this.fb.group({
      status: [[]],
      officeCode: [[]],
      tenantType: [["LEAD_TENANT"]],
    });
    this.agentFilter = this.fb.group({
      status: [[]],
      isJournalExclude: false,
      isVatRegistered: false,
    });
    this.contractorFilter = this.fb.group({
      vatRegistered: false,
      approvedByAgent: false,
      status: [[]],
      skills: [[]],
    });
    this.applicantFilter = this.fb.group({
      officeCode: [[]],
      isHot: false,
      isStudent: false,
    });
  }

  private emptyEntityChecksCtrl() {
    this.propertyCheck.setValue(false);
    this.landlordCheck.setValue(false);
    this.tenantCheck.setValue(false);
    this.applicantCheck.setValue(false);
    this.agentCheck.setValue(false);
    this.contractorCheck.setValue(false);
  }

  getSearchResults() {
    this.solrService
      .entitySearch(this.prepareSearchParams())
      .subscribe((res) => {
        this.results = res && res.data ? res.data : [];
        this.length = res && res.count ? res.count : 0;
        this.opened = true;
        this.loaded = true;
        // this.iterator();
      });
  }

  private prepareSearchParams() {
    let params: any = {};
    params.limit = this.pageSize;
    params.page = this.pageIndex;
    params.searchTerm = this.solrSearchConfig.searchTerm;
    params.searchTypes = this.transformToUpperCase(this.entityControl.value);

    if (this.refreshType === "ALL") {
    }
    if (this.entityControl.value.indexOf("Property") !== -1) {
      params.propertyFilter = Object.assign({}, this.propertyFilter.value);
      params.propertyFilter.propertyRent = {
        max: params.propertyFilter.propertyRent.upper,
        min: params.propertyFilter.propertyRent.lower,
      };
      params.propertyFilter.numberOfBedroom = {
        max: params.propertyFilter.numberOfBedroom.upper,
        min: params.propertyFilter.numberOfBedroom.lower,
      };
    }
    if (this.entityControl.value.indexOf("Landlord") !== -1) {
      params.landlordFilter = this.landlordFilter.value;
    }
    if (this.entityControl.value.indexOf("Tenant") !== -1) {
      params.tenantFilter = this.tenantFilter.value;
    }
    if (this.entityControl.value.indexOf("Agent") !== -1) {
      params.agentFilter = this.agentFilter.value;
    }
    if (this.entityControl.value.indexOf("Contractor") !== -1) {
      params.contractorFilter = this.contractorFilter.value;
    }
    if (this.entityControl.value.indexOf("Applicant") !== -1) {
      params.applicantFilter = this.applicantFilter.value;
    }
    return params;
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
    if (this.key === "[") {
      this.drawer.toggle();
    }
  }

  openDetails(key: string, value = null) {
    openScreen(key, value);
  }

  refreshAll() {
    this.getSearchResults();
  }

  resetAll() {
    this.propertyFilter.reset();
    this.propertyFilter.controls["propertyRent"].setValue(this.priceKnobValues);
    this.propertyFilter.controls["numberOfBedroom"].setValue(
      this.bedKnobValues
    );
    this.propertyFilter.controls["rentType"].setValue("DEFAULT_RENT");
    this.landlordFilter.reset();
    this.tenantFilter.reset();
    this.tenantFilter.controls["tenantType"].setValue(["LEAD_TENANT"]);
    this.applicantFilter.reset();
    this.agentFilter.reset();
    this.contractorFilter.reset();
  }

  selectAll() {
    this.isAllselected = true;
    this.propertyCheck.setValue(true);
    this.landlordCheck.setValue(true);
    this.tenantCheck.setValue(true);
    this.applicantCheck.setValue(true);
    this.contractorCheck.setValue(true);
    this.agentCheck.setValue(true);
    this.entityControl.setValue([]);
    this.entityControl.setValue(this.entityList);
  }

  deselectAll() {
    this.isAllselected = false;
    this.propertyCheck.setValue(false);
    this.landlordCheck.setValue(false);
    this.tenantCheck.setValue(false);
    this.applicantCheck.setValue(false);
    this.contractorCheck.setValue(false);
    this.agentCheck.setValue(false);
    this.entityControl.setValue([]);
  }

  refresh(type: string) {
    this.refreshType = type;
    this.getSearchResults();
  }

  reset(form: FormGroup) {
    if (form) {
      form.reset();
      if (form.value.hasOwnProperty("propertyRent")) {
        form.controls["propertyRent"].setValue(this.priceKnobValues);
        form.controls["numberOfBedroom"].setValue(this.bedKnobValues);
        form.controls["rentType"].setValue("DEFAULT_RENT");
      }
    }
  }

  onChangeEntity(type: string) {
    let tmpArray: string[] = Object.assign(this.entityControl.value, {});
    this.entityControl.setValue([]);
    switch (type) {
      case "property":
        !this.propertyCheck.value
          ? tmpArray.push("Property")
          : tmpArray.splice(tmpArray.indexOf("Property"), 1);
        break;
      case "landlord":
        !this.landlordCheck.value
          ? tmpArray.push("Landlord")
          : tmpArray.splice(tmpArray.indexOf("Landlord"), 1);
        break;
      case "tenant":
        !this.tenantCheck.value
          ? tmpArray.push("Tenant")
          : tmpArray.splice(tmpArray.indexOf("Tenant"), 1);
        break;
      case "applicant":
        !this.applicantCheck.value
          ? tmpArray.push("Applicant")
          : tmpArray.splice(tmpArray.indexOf("Applicant"), 1);
        break;
      case "agent":
        !this.agentCheck.value
          ? tmpArray.push("Agent")
          : tmpArray.splice(tmpArray.indexOf("Agent"), 1);
        break;
      case "contractor":
        !this.contractorCheck.value
          ? tmpArray.push("Contractor")
          : tmpArray.splice(tmpArray.indexOf("Contractor"), 1);
        break;
    }
    this.entityControl.setValue(tmpArray);
  }

  private renderEntity() {}

  private transformToUpperCase(data: any) {
    if (data) {
      data = Array.isArray(data) ? data : [data];
      return data.map((x: string) => {
        return x.toUpperCase();
      });
    }
  }

  searchHandler(term) {
    this.solrSearchConfig.searchTerm = term ? term : "*";
    this.initResults();
  }
}
