import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { SolrService } from 'src/app/solr/solr.service';
import { AgentService } from 'src/app/agent/agent.service';
import { MarketAppraisalService } from 'src/app/market-appraisal/market-appraisal.service';
import { market_appraisal, search_Text } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-landlord-search',
  templateUrl: './landlord-search.component.html',
  styleUrls: ['./landlord-search.component.scss'],
  providers: [AgentService]
})
export class LandlordSearchComponent implements OnInit {

  loggedInUserData;
  isAuthSuccess = false;
  @Input() searchTerm;
  @Input() type;
  suggestions = [];
  isItemAvailable = false;
  searchTermControl = new FormControl();
  showLoader: boolean = false;
  landlordDetails;
  landlordsOfproperty;
  updateLandlordDppDetails;
  propertyLandlords;
  propertyData;
  isPropertyItemAvailable = false;
  entityControl = new FormControl(['Property']);
  propertySuggestion;

  constructor(private marketAppraisalService: MarketAppraisalService,
    private solrService: SolrService,
    private agentService: AgentService,
    private commonService: CommonService) { }

  ngOnInit() {

  }

  selectLandlord(item) {
    this.searchTerm = '';
    this.getLandlordDetails(item.entityId);
    this.getLandlordProperties(item.entityId);
    this.isItemAvailable = false;
    this.initializeItems();

  }

  SelectProperty(item) {
    this.marketAppraisalService.propertyChangeEvent(item);
    this.searchTerm = '';
    this.isPropertyItemAvailable = false;
    this.initializePropertyItems();
  }

  onFocus() {
    if (this.type === market_appraisal.contact_type && this.suggestions.length) {
      this.isItemAvailable = true;
    }
    if (this.type === market_appraisal.property_type && this.propertySuggestion.length) {
      this.isPropertyItemAvailable = true;
    }
  }

  async reset() {
    const confirm = await this.commonService.showConfirm('Market Appraisal', 'Are you sure you want to clear the form?.', '', 'Yes', 'No');
    if (confirm) {
      this.searchTerm = '';
      if (this.type === market_appraisal.contact_type) {
        this.marketAppraisalService.landlordValueChange('reset');
      }
      if (this.type === market_appraisal.property_type) {
        this.marketAppraisalService.propertyChangeEvent('reset');
      }
    }
  }

  getItems(ev: any) {

    if (this.type === market_appraisal.contact_type) {
      this.initializeItems();
      const searchText = ev.target.value;
      if (searchText && searchText.trim() !== '' && searchText.length > 3) {
        this.getSuggestions(this.prepareSearchParams(searchText, search_Text.lanlord));
      } else {
        this.isItemAvailable = false;
      }
    }

    if (this.type === market_appraisal.property_type) {
      this.initializePropertyItems();
      const searchText = ev.target.value;
      if (searchText && searchText.trim() !== '' && searchText.length > 3) {
        this.getSuggestions(this.prepareSearchParams(searchText, search_Text.property));
      } else {
        this.isPropertyItemAvailable = false;
      }
    }
  }


  serchItem() {
    const searchText = this.searchTermControl.value;
    if (this.type === market_appraisal.contact_type && searchText && searchText.trim() !== '' && searchText.length > 3) {
      this.getSuggestions(this.prepareSearchParams(searchText, search_Text.lanlord));
    }

    if (this.type === market_appraisal.property_type && searchText && searchText.trim() !== '' && searchText.length > 3) {
      this.getSuggestions(this.prepareSearchParams(searchText, search_Text.property));
    }

  }

  private getLandlordDetails(landlordId) {
    const promise = new Promise((resolve, reject) => {
      this.marketAppraisalService.getLandlordDetails(landlordId).subscribe(
        res => {
          this.landlordDetails = res ? res : [];
          this.marketAppraisalService.landlordValueChange(this.landlordDetails);
          resolve(this.landlordDetails);
        },
        error => {
          reject(null);
        }
      );
    });
    return promise;
  }

  private getLandlordProperties(landlordId) {
    const promise = new Promise((resolve, reject) => {
      this.marketAppraisalService.getLandlordProperties(landlordId).subscribe(
        res => {
          this.propertySuggestion = res ? res.data : [];
        },
        error => {
          reject(null);
        }
      );
    });
    return promise;
  }

  private getSuggestions(params: HttpParams) {
    this.showLoader = true;
    this.solrService.entityGetSuggestion(params).subscribe((res) => {


      if (this.type === market_appraisal.property_type) {
        this.propertySuggestion = res ? res : [];
        if (this.propertySuggestion.length > 0) {
          this.isPropertyItemAvailable = true;
        }
      } else {
        this.suggestions = res ? res : [];
        if (this.suggestions.length > 0) {
          this.isItemAvailable = true;
        }
      }
      this.showLoader = false;
    });
  }


  private prepareSearchParams(searchText: string, searchTypes) {
    return (
      new HttpParams()
        .set('searchTerm', searchText)
        .set('searchTypes', searchTypes)
        .set('searchSwitch', 'true')
        .set('hideLoader', 'true')
    );
  }

  hideSuggestion() {
    setTimeout(() => {
      this.isItemAvailable = false;
    }, 200);
  }

  initializeItems() {
    this.suggestions = [];
  }
  initializePropertyItems() {
    this.propertySuggestion = [];
  }
}
