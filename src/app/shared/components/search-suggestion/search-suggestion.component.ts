import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PROPCO, SOLR_CONFIG, SYSTEM_CONFIG } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { SolrService } from '../../../solr/solr.service';
import { SolrSearchHandlerService } from '../../services/solr-search-handler.service';
import { WorkspaceService } from 'src/app/agent/workspace/workspace.service';
declare function openScreen(key: string, value: any): any;
declare function openScreenAdvance(data: any): any;

@Component({
  selector: 'app-search-suggestion',
  templateUrl: './search-suggestion.component.html',
  styleUrls: ['./search-suggestion.component.scss'],
})
export class SearchSuggestionComponent implements OnInit {
  @Input() searchTerm;
  initializeItems() {
    this.suggestions = [];
  }
  isItemAvailable = false;
  suggestions = [];
  historySuggestions = [];
  @Input() entityControl: FormControl;
  @Input() isAuthSuccess: boolean;
  @Output() searchClickEvent = new EventEmitter();
  searchTermControl = new FormControl();
  private solrSuggestionConfig = {
    limit: '30',
    searchTerm: '',
    searchTypes: '',
    searchSwitch: 'true',
  };
  entityList: string[] = [
    'Property',
    'Landlord',
    'Tenant',
    'Applicant',
    'Agent',
    'Contractor'
  ];
  lookupdata: any;
  officeLookupDetails: any;
  officeLookupMap = new Map();
  showLoader: boolean = false;
  isPropcoSalesEnable = false;
  serachWidth = 68;
  @Input() pageType: string;
  @Input() loaded: any;
  @ViewChild('solrSearchBar') solrSearchBar: any;
  isProcpcoSearchEnabled = false;
  solrConfig = SOLR_CONFIG;
  historyItemAvailable = false;
  constructor(
    private solrService: SolrService,
    private commonService: CommonService,
    private router: Router,
    private solrSearchService: SolrSearchHandlerService,
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
  ) {
  }
  serachResultPage = "";
  getItems(ev: any, searchFromHistory = false) {
    if (!searchFromHistory) {
      this.solrSearchBar.setFocus();
    }
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    const searchText = !searchFromHistory ? ev.target.value : ev;
    this.updateQueryParams();
    // if the value is an empty string don't filter the items
    if (searchText && searchText.trim() !== '' && searchText.length > 3) {
      this.showLoader = true;
      this.historyItemAvailable = false;
      if (!searchFromHistory) {
        this.addItemsToHistorySg(searchText);
      }
      this.getSuggestions(this.prepareSearchParams(searchText));
    } else {
      this.isItemAvailable = false;
    }
  }

  private prepareSearchParams(searchText: string) {
    let searchTypes = this.transformToUpperCase(this.entityControl.value);
    if (searchTypes.indexOf('TENANT') !== -1 && !(this.router.url.includes('/solr/entity-finder') || this.router.url.includes('solr/finder-results'))) {
      searchTypes.push('COTENANT');
    }
    if (searchTypes.indexOf('PROPERTY') !== -1 && this.isPropcoSalesEnable) {
      searchTypes.push('SALES_PROPERTY');
    }

    const params = new HttpParams()
      // .set('limit', this.solrSuggestionConfig.limit)
      .set('searchTerm', searchText)
      .set('searchTypes', searchTypes)
      .set('searchSwitch', this.solrSuggestionConfig.searchSwitch)
      .set('hideLoader', 'true');

    if (this.router.url.includes('/solr/entity-finder/Associate') || this.router.url.includes('solr/finder-results/Associate')) {
      params.set('subType', "Associate");
    }
    return params;
  }

  private transformToUpperCase(data: any) {
    return data.map((x: string) => {
      return x.toUpperCase();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getQueryParams();
    if (changes.loaded.currentValue) {
      this.focus();
    }
  }

  async ngOnInit() {
    if (this.commonService.getItem('PROPCO_SEARCH_ENABLED', true) != null) {
      this.isProcpcoSearchEnabled = this.commonService.getItem('PROPCO_SEARCH_ENABLED', true);
    } else {
      this.isProcpcoSearchEnabled = await this.getSystemConfigs(SYSTEM_CONFIG.PROPCO_SEARCH_URL);
      this.commonService.setItem('PROPCO_SEARCH_ENABLED', this.isProcpcoSearchEnabled);
    }
    this.setSolrSalesEntity();
    this.setFinderIcon();
    this.initDashboard();
    this.commonService.dataChanged$.subscribe((data) => {
      this.entityControl.setValue(data.entity);
      this.searchTermControl.setValue(data.term);
    });
  }

  private initDashboard() {
    this.getLookupData();
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      const params = new HttpParams().set('hideLoader', 'true');
      this.commonService.getLookup(params).subscribe((data) => {
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
      data.map((occ) => {
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
    if (this.router.url.includes('/solr/entity-finder') || this.router.url.includes('solr/finder-results')) {
      let entityDetail: any = {};
      entityDetail.entityId = value.propcoId;
      entityDetail.type = value.entityType;
      openScreenAdvance({ requestType: 'EntityFinderResponse', requestValue: entityDetail });
      return;
    }
    if (this.router.url.includes('/agent/')) {
      this.workspaceService.addItemToWorkSpace(value);
      return;
    }
    /*Navigate to java fx page (If solr loads inside v2)*/
    openScreen(key, value.propcoId);
  }

  openV2Search() {
    /*Navigate to java fx page (If solr loads inside v2)*/
    let searchDetail: any = {};
    searchDetail.searchTerm = this.searchTermControl.value;
    searchDetail.searchEntity = this.entityControl.value;
    openScreenAdvance({ requestType: 'OpenSearchResult', requestValue: searchDetail });
  }

  goToPage() {
    if (this.router.url.includes('/solr/entity-finder') || this.router.url.includes('solr/finder-results')) {
      let type = this.entityControl.value;
      if (this.router.url.includes('/solr/entity-finder/Associate') || this.router.url.includes('solr/finder-results/Associate')) {
        type = "Associate";
      }
      this.router.navigate(['/solr/finder-results/' + type], {
        queryParams: {
          searchTerm: this.searchTermControl.value,
          type: this.entityControl.value,
        }, replaceUrl: true
      });
      this.solrSearchService.search({ entity: this.entityControl.value, term: this.searchTermControl.value, isSearchResult: true });
      return;
    }

    if (this.isProcpcoSearchEnabled) {
      if (!this.router.url.includes('/solr/search-results') && (this.router.url.includes('/solr/dashboard') || this.router.url.includes('/solr/search'))) {
        this.openV2Search();
        return;
      }
    }
    if (!this.isProcpcoSearchEnabled) {
      if (this.router.url.includes('/solr/dashboard') || this.router.url.includes('/solr/search')) {
        this.router.navigate(['/solr/search-results'], {
          queryParams: {
            searchTerm: this.searchTermControl.value,
            type: this.entityControl.value,
          }, replaceUrl: true
        });
      }
    }

    if (this.router.url.includes('/agent/')) {
      this.router.navigate(['/agent/solr/search-results'], {
        queryParams: {
          searchTerm: this.searchTermControl.value,
          type: this.entityControl.value,
        },
        replaceUrl: true
      });
    }
    if ((this.pageType === 'solr-resultpage') && this.router.url.includes('/solr/search-result') || this.router.url.includes('/agent/solr/search-result')) {
      if (this.pageType === 'solr-resultpage' && this.router.url.includes('/solr/search-result')) {
        this.router.navigate(['/solr/search-results'], {
          queryParams: {
            searchTerm: this.searchTermControl.value,
            type: this.entityControl.value,
          },
        });
      }
      if (this.router.url.includes('/agent/solr/search-result')) {
        this.router.navigate(['/agent/solr/search-results'], {
          queryParams: {
            searchTerm: this.searchTermControl.value,
            type: this.entityControl.value,
          },
        });
      }
      this.solrSearchService.search({ entity: this.entityControl.value, term: this.searchTermControl.value, isSearchResult: true });
    }
  }

  hideSuggestion() {
    setTimeout(() => {
      this.isItemAvailable = false;
      this.historyItemAvailable = false;
    }, 200);
  }

  private getQueryParams() {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => {
        let entityType = 'Property';
        if (this.router.url.includes('/solr/entity-finder') || this.router.url.includes('/solr/finder-results')) {
          entityType = this.route.snapshot.params['entityType'];
          if (entityType == 'Associate') {
            entityType = 'Landlord';
          }
        }
        const entityParams = params['type'] ? params['type'] : entityType;
        const types: string[] = Array.isArray(entityParams) ? entityParams : [entityParams];
        this.entityControl.setValue(types);
        this.searchTerm = params['searchTerm'];
        resolve(true);
      });
    });
  }

  onChangeEntity() {
    this.updateQueryParams();
  }

  private updateQueryParams() {
    this.solrSearchService.search({ entity: this.entityControl.value, term: this.searchTermControl.value, isSearchResult: false });
  }
  setSolrSalesEntity() {
    if (this.commonService.getItem(PROPCO.SALES_MODULE, true) && !this.router.url.includes('/agent/')) {
      this.entityList.push('Vendor');
      this.entityList.push('Purchaser');
      this.entityList.push('Sales_Applicant');
      this.isPropcoSalesEnable = true;
    }
  }
  setFinderIcon() {
    if (this.router.url.includes('/solr/search')) {
      this.serachWidth = 80;
    }
    if (this.router.url.includes('/solr/entity-finder') || this.router.url.includes('/solr/finder-results')) {
      this.serachWidth = 80;
      if (this.router.url.includes('/solr/finder-results')) {
        this.serachResultPage = "main-row";
      }
      if (this.router.url.includes('/Property') || this.router.url.includes('/Sales-Property')) {
        this.entityList = new Array();
        this.entityList.push('Property');
      } else if (this.router.url.includes('/Tenant')) {
        this.entityList = new Array();
        this.entityList.push('Tenant');
      } else if (this.router.url.includes('/CoTenant')) {
        this.entityList = new Array();
        this.entityList.push('CoTenant');
      } else if (this.router.url.includes('/Landlord') || this.router.url.includes('/Associate')) {
        this.entityList = new Array();
        this.entityList.push('Landlord');
      } else if (this.router.url.includes('/Applicant')) {
        this.entityList = new Array();
        this.entityList.push('Applicant');
      } else if (this.router.url.includes('/Contractor')) {
        this.entityList = new Array();
        this.entityList.push('Contractor');
      } else if (this.router.url.includes('/Agent')) {
        this.entityList = new Array();
        this.entityList.push('Agent');
      } else if (this.router.url.includes('/Vendor')) {
        this.entityList = new Array();
        this.entityList.push('Vendor');
      } else if (this.router.url.includes('/Purchaser')) {
        this.entityList = new Array();
        this.entityList.push('Purchaser');
      } else if (this.router.url.includes('/Sales_Applicant')) {
        this.entityList = new Array();
        this.entityList.push('Sales_Applicant');
      } else if (this.router.url.includes('/Sales_Applicant')) {
        this.entityList = new Array();
        this.entityList.push('Sales_Applicant');
      } else if (this.router.url.includes('/Multiple')) {
        this.setEntity();
      } else {
        this.entityControl.setValue(this.entityList);
      }

    } else {
      this.serachResultPage = "";
    }
  }

  private async getSystemConfigs(key: string): Promise<any> {
    return new Promise((resolve) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        resolve(res != null && res[key] != null && res[key] != '' ? true : false);
      }, error => {
        resolve(false);
      });
    });
  }

  private setEntity() {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => {
        const entityParams = params['type'] ? params['type'] : 'Property';
        if (Array.isArray(entityParams)) {
          this.entityList = entityParams;
        } else {
          this.entityList = [entityParams];
        }
        resolve(true);
      });
    });
  }

  focus() {
    setTimeout(() => {
      if (this.solrSearchBar) {
        this.solrSearchBar.setFocus();
      }
    }, 1000)
  }

  showHistoryItem(ev: any) {
    const searchText = ev.target.value;
    const history = this.commonService.getItem('history', true);
    if (history && history.length) {
      if (searchText == '' && searchText.length < 3) {
        this.isItemAvailable = false;
        this.historyItemAvailable = true;
        this.historySuggestions = history;
      }
    }
  }

  private addItemsToHistorySg(item: string) {
    let history = this.fetchHistorySuggestion() || [];
    if (history && item && item != '') {
      history.unshift(item);
      this.commonService.setItem('history', history);
      this.historySuggestions = this.fetchHistorySuggestion();
    } else {
      if (item && item != '') {
        history.unshift(item);
        this.commonService.setItem('history', history);
        this.historySuggestions = this.fetchHistorySuggestion();
      }
    }
  }

  private fetchHistorySuggestion() {
    return (this.commonService.getItem('history', true) || []);
  }

  onFocus() {
    if (this.suggestions.length) {
      this.isItemAvailable = true;
      this.historyItemAvailable = false;
    } else {
      this.isItemAvailable = false;
    }
  }

  searchFromHistory(item: any) {
    this.historyItemAvailable = false;
    if (item) {
      this.searchTerm = item;
      this.searchTermControl.setValue(item);
    }
  }
}
