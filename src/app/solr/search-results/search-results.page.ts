import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatDrawer } from "@angular/material/sidenav";
import { ActivatedRoute } from "@angular/router";
import { PROPCO } from "src/app/shared/constants";
import { CommonService } from "src/app/shared/services/common.service";
import { SolrService } from "../solr.service";
declare function openScreen(key: string, value: any): any;
import { Options, LabelType } from "@angular-slider/ngx-slider";

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
  priceKnobValues: number[] = [200, 2000];
  bedKnobValues: number[] = [1, 10];
  toppings = new FormControl();
  solrSearchConfig = {
    types: "",
    searchTerm: "",
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
  managementTypesFiltered;
  propertyStyles;
  propertyStylesFiltered;
  houseTypes;
  houseTypesFiltered;
  propertyStatuses;
  propertyStatusesFiltered;
  officeCodes;
  officeCodesFiltered;
  landlordStatuses;
  landlordStatusesFiltered;
  applicantStatuses;
  applicantStatusesFiltered;
  tenantStatuses;
  tenantStatusesFiltered;
  contractorStatuses;
  contractorStatusesFiltered;
  contractorSkills;
  contractorSkillsFiltered;

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

  showSkeleton: boolean = true;
  managementTypeFilterCtrl: FormControl = new FormControl();
  propertyStyleFilterCtrl: FormControl = new FormControl();
  houseTypeFilterCtrl: FormControl = new FormControl();
  propertyStatusFilterCtrl: FormControl = new FormControl();
  officeCodesFilterCtrl: FormControl = new FormControl();
  landlordStatusFilterCtrl: FormControl = new FormControl();
  tenantStatusFilterCtrl: FormControl = new FormControl();
  applicantStatuFilterCtrl: FormControl = new FormControl();
  contractorStatusFilterCtrl: FormControl = new FormControl();
  contractorSkillFilterCtrl: FormControl = new FormControl();

  propRentOptions: Options = {
    floor: 0,
    ceil: 5000,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return "£" + value;
        case LabelType.High:
          return "£" + value;
        default:
          return "£" + value;
      }
    },
  };

  numberOfBedroomOptions: Options = {
    floor: 0,
    ceil: 20,
  };

  viewType: string = "LIST";

  constructor(
    private route: ActivatedRoute,
    private solrService: SolrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private el: ElementRef<HTMLElement>
  ) {}

  ngOnInit() {
    this.initResults();
    this.initFilterForm();
    this.multiSearchFilterHandler();
  }

  private async initResults() {
    this.getLookupData();
    await this.getQueryParams();
    this.initFilter();
    this.getSearchResults();
  }

  private multiSearchFilterHandler() {
    // listen for multi selct search field value changes
    this.managementTypeFilterCtrl.valueChanges.subscribe((src) => {
      this.filterMultiSearch(src, "mgnType");
    });
    this.propertyStyleFilterCtrl.valueChanges.subscribe((src) => {
      this.filterMultiSearch(src, "propStyle");
    });
    this.houseTypeFilterCtrl.valueChanges.subscribe((src) => {
      this.filterMultiSearch(src, "houseType");
    });
    this.propertyStatusFilterCtrl.valueChanges.subscribe((src) => {
      this.filterMultiSearch(src, "propStatus");
    });
    this.officeCodesFilterCtrl.valueChanges.subscribe((src) => {
      this.filterMultiSearch(src, "officeCode");
    });
    this.landlordStatusFilterCtrl.valueChanges.subscribe((src) => {
      this.filterMultiSearch(src, "lanStatus");
    });
    this.applicantStatuFilterCtrl.valueChanges.subscribe((src) => {
      this.filterMultiSearch(src, "appStatus");
    });
    this.tenantStatusFilterCtrl.valueChanges.subscribe((src) => {
      this.filterMultiSearch(src, "tenantStatus");
    });
    this.contractorSkillFilterCtrl.valueChanges.subscribe((src) => {
      this.filterMultiSearch(src, "conSkill");
    });
    this.contractorStatusFilterCtrl.valueChanges.subscribe((src) => {
      this.filterMultiSearch(src, "conStatus");
    });
  }

  private filterMultiSearch(srchStr: string, type: string) {
    let tmp = [];
    switch (type) {
      case "mgnType": {
        if (!srchStr) {
          this.managementTypesFiltered = this.managementTypes;
          return;
        }
        tmp = this.managementTypes.filter(
          (x) => x.value.toLowerCase().indexOf(srchStr) > -1
        );
        this.managementTypesFiltered = tmp;
        break;
      }
      case "propStyle": {
        if (!srchStr) {
          this.propertyStylesFiltered = this.propertyStyles;
          return;
        }
        tmp = this.propertyStyles.filter(
          (x) => x.value.toLowerCase().indexOf(srchStr) > -1
        );
        this.propertyStylesFiltered = tmp;
        break;
      }
      case "houseType": {
        if (!srchStr) {
          this.houseTypesFiltered = this.houseTypes;
          return;
        }
        tmp = this.houseTypes.filter(
          (x) => x.value.toLowerCase().indexOf(srchStr) > -1
        );
        this.houseTypesFiltered = tmp;
        break;
      }
      case "propStatus": {
        if (!srchStr) {
          this.propertyStatusesFiltered = this.propertyStatuses;
          return;
        }
        tmp = this.propertyStatuses.filter(
          (x) => x.value.toLowerCase().indexOf(srchStr) > -1
        );
        this.propertyStatusesFiltered = tmp;
        break;
      }
      case "officeCode": {
        if (!srchStr) {
          this.officeCodesFiltered = this.officeCodes;
          return;
        }
        tmp = this.officeCodes.filter(
          (x) => x.value.toLowerCase().indexOf(srchStr) > -1
        );
        this.officeCodesFiltered = tmp;
        break;
      }
      case "lanStatus": {
        if (!srchStr) {
          this.landlordStatusesFiltered = this.landlordStatuses;
          return;
        }
        tmp = this.landlordStatuses.filter(
          (x) => x.value.toLowerCase().indexOf(srchStr) > -1
        );
        this.landlordStatusesFiltered = tmp;
        break;
      }
      case "appStatus": {
        if (!srchStr) {
          this.applicantStatusesFiltered = this.applicantStatuses;
          return;
        }
        tmp = this.applicantStatuses.filter(
          (x) => x.value.toLowerCase().indexOf(srchStr) > -1
        );
        this.applicantStatusesFiltered = tmp;
        break;
      }
      case "tenantStatus": {
        if (!srchStr) {
          this.tenantStatusesFiltered = this.tenantStatuses;
          return;
        }
        tmp = this.tenantStatuses.filter(
          (x) => x.value.toLowerCase().indexOf(srchStr) > -1
        );
        this.tenantStatusesFiltered = tmp;
        break;
      }
      case "conSkill": {
        if (!srchStr) {
          this.contractorSkillsFiltered = this.contractorSkills;
          return;
        }
        tmp = this.contractorSkills.filter(
          (x) => x.value.toLowerCase().indexOf(srchStr) > -1
        );
        this.contractorSkillsFiltered = tmp;
        break;
      }
      case "conStatus": {
        if (!srchStr) {
          this.contractorStatusesFiltered = this.contractorStatuses;
          return;
        }
        tmp = this.contractorStatuses.filter(
          (x) => x.value.toLowerCase().indexOf(srchStr) > -1
        );
        this.contractorStatusesFiltered = tmp;
        break;
      }
    }
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
    this.managementTypes = this.managementTypesFiltered = data.managementTypes;
    this.propertyStyles = this.propertyStylesFiltered = data.propertyStyles;
    this.houseTypes = this.houseTypesFiltered = data.houseTypes;
    this.propertyStatuses = this.propertyStatusesFiltered =
      data.propertyStatuses;
    this.officeCodes = this.officeCodesFiltered = data.officeCodes;
    this.landlordStatuses = this.landlordStatusesFiltered =
      data.landlordStatuses;
    this.applicantStatuses = this.applicantStatusesFiltered =
      data.applicantStatuses;
    this.tenantStatuses = this.tenantStatusesFiltered = data.tenantStatuses;
    this.contractorSkills = this.contractorSkillsFiltered =
      data.contractorSkills;
    this.contractorStatuses = this.contractorStatusesFiltered =
      data.contractorStatuses;
  }

  private getQueryParams() {
    const promise = new Promise((resolve, reject) => {
      this.route.queryParams.subscribe((params) => {
        this.solrSearchConfig.types = params["type"]
          ? params["type"]
          : "PROPERTY";
        this.solrSearchConfig.searchTerm = params["searchTerm"]
          ? params["searchTerm"]
          : "";
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
      propertyRent: [this.priceKnobValues],
      numberOfBedroom: [this.bedKnobValues],
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

  private customizePaginator(): void {
    setTimeout(() => {
      const lastBtn = this.el.nativeElement.querySelector(
        ".mat-paginator-navigation-last"
      );
      if (lastBtn) {
        lastBtn.innerHTML = "Last";
      }
      const firstBtn = this.el.nativeElement.querySelector(
        ".mat-paginator-navigation-first"
      );
      if (firstBtn) {
        firstBtn.innerHTML = "First";
      }
    }, 500);
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
    this.showSkeleton = true;
    this.solrService
      .entitySearch(this.prepareSearchParams())
      .subscribe((res) => {
        this.results = res && res.data ? res.data : [];
        this.length = res && res.count ? res.count : 0;
        this.opened = true;
        this.loaded = true;
        this.showSkeleton = false;
        this.customizePaginator();
        // this.iterator();
      });
  }

  private prepareSearchParams() {
    let params: any = {};
    params.limit = this.pageSize;
    params.page = this.pageIndex;
    params.searchTerm = this.solrSearchConfig.searchTerm
      ? this.solrSearchConfig.searchTerm
      : "*";
    params.searchTypes = this.transformToUpperCase(this.entityControl.value);

    if (this.refreshType === "ALL") {
    }
    if (this.entityControl.value.indexOf("Property") !== -1) {
      params.propertyFilter = Object.assign({}, this.propertyFilter.value);
      params.propertyFilter.propertyRent = {
        max: params.propertyFilter.propertyRent[1],
        min: params.propertyFilter.propertyRent[0],
      };
      params.propertyFilter.numberOfBedroom = {
        max: params.propertyFilter.numberOfBedroom[1],
        min: params.propertyFilter.numberOfBedroom[0],
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
    this.solrSearchConfig.searchTerm = term ? term : "";
    this.initResults();
  }
}
