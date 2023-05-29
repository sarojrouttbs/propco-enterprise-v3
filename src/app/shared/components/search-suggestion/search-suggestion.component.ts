import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PROPCO } from 'src/app/shared/constants';
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
    'Contractor',
    'Vendor'
  ];
  lookupdata: any;
  officeLookupDetails: any;
  officeLookupMap = new Map();
  showLoader: boolean = false;
  @Input() pageType: string;
  @Input() loaded: string;
  @ViewChild('solrSearchBar') solrSearchBar: any;

  constructor(
    private solrService: SolrService,
    private commonService: CommonService,
    private router: Router,
    private solrSearchService: SolrSearchHandlerService,
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
  ) {
  }

  getItems(ev: any) {
    this.solrSearchBar.setFocus();
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    const searchText = ev.target.value;
    this.updateQueryParams();

    // if the value is an empty string don't filter the items
    if (searchText && searchText.trim() !== '' && searchText.length > 3) {
      this.showLoader = true;
      this.getSuggestions(this.prepareSearchParams(searchText));
    } else {
      this.isItemAvailable = false;
    }
  }

  private prepareSearchParams(searchText: string) {
    let searchTypes = this.transformToUpperCase(this.entityControl.value);
    if (searchTypes.indexOf('TENANT') !== -1) {
      searchTypes.push('COTENANT');
    }
    return (
      new HttpParams()
        // .set('limit', this.solrSuggestionConfig.limit)
        .set('searchTerm', searchText)
        .set('searchTypes', searchTypes)
        .set('searchSwitch', this.solrSuggestionConfig.searchSwitch)
        .set('hideLoader', 'true')
    );
  }

  private transformToUpperCase(data: any) {
    return data.map((x: string) => {
      return x.toUpperCase();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getQueryParams();
  }

  ngOnInit() {
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
    if (!this.router.url.includes('/solr/search-result') && (this.router.url.includes('/solr/dashboard') || this.router.url.includes('/solr/search'))) {
      this.openV2Search();
      return;
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
    }, 200);
  }

  private getQueryParams() {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => {
        const entityParams = params['type'] ? params['type'] : 'Property';
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
}
