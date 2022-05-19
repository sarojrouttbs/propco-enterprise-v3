import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { SolrService } from 'src/app/solr/solr.service';
import { FaultsService } from 'src/app/faults/faults.service';
import { AgentService } from 'src/app/agent/agent.service';
import { CommonService } from 'src/app/shared/services/common.service';
@Component({
  selector: 'app-landlord-search',
  templateUrl: './landlord-search.component.html',
  styleUrls: ['./landlord-search.component.scss'],
  providers:[AgentService]
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
  isPropertyItemAvailable=false;
  entityControl = new FormControl(['Property']);
  constructor(private commonService:CommonService,private solrService:SolrService, private faultsService:FaultsService, private agentService:AgentService) { }

  ngOnInit() {

  }

   SelectLandlord(item){
     this.searchTerm = '';
    this.getLandlordDetails(item.entityId);
    this.getLandlordProperties(item.entityId);
    this.isItemAvailable = false;
    this.initializeItems();

  }

  SelectProperty(item){
    this.searchTerm = '';
    this.isPropertyItemAvailable = false;
    this.initializePropertyItems();
  }

  onFocus(){
    if(this.type === 'contact' && this.suggestions.length ){
        this.isItemAvailable = true;
    }
    if(this.type === 'property' && this.propertySuggestion.length ){
      this.isPropertyItemAvailable = true;
     }
  }

  reset(){
    this.searchTerm = '';
    this.commonService.lanlordValueChange('reset');
  }

 getItems(ev: any) {
  this.initializeItems();
  const searchText = ev.target.value;
  if (searchText && searchText.trim() !== '' && searchText.length > 3) {
    this.getSuggestions(this.prepareSearchParams(searchText));
  } else {
    this.isItemAvailable = false;
  }
}


serchItem(){
  const searchText = this.searchTermControl.value;
  if (searchText && searchText.trim() !== '' && searchText.length > 3) {
    this.getSuggestions(this.prepareSearchParams(searchText));
  } else {
    this.isItemAvailable = false;
  }
}



private getLandlordDetails(landlordId) {
  const promise = new Promise((resolve, reject) => {
    this.faultsService.getLandlordDetails(landlordId).subscribe(
      res => {
        this.landlordDetails = res ? res : [];
        this.commonService.lanlordValueChange(this.landlordDetails);
        resolve(this.landlordDetails);
      },
      error => {
        reject(null);
      }
    );
  });
  return promise;
}

propertySuggestion ;
private getLandlordProperties(landlordId) {
  const promise = new Promise((resolve, reject) => {
    this.faultsService.getLandlordProperties(landlordId).subscribe(
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
    this.suggestions = res ? res : [];
    if (this.suggestions.length > 0) {
      this.isItemAvailable = true;
    }
    this.showLoader = false;
  });
}



private prepareSearchParams(searchText: string) {
  return (
    new HttpParams()
      .set('searchTerm', searchText)
      .set('searchTypes', 'LANDLORD')
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
