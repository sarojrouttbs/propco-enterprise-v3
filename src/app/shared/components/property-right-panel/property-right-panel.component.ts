import { HttpParams } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AgentService } from 'src/app/agent/agent.service';
import { DEFAULTS, PROPCO } from '../../constants';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-property-right-panel',
  templateUrl: './property-right-panel.component.html',
  styleUrls: ['./property-right-panel.component.scss'],
})
export class PropertyRightPanelComponent implements OnInit, OnChanges {

  @Input() propertyData;
  lookupdata: any;
  propertyStatuses: any;
  officeCodes: any;
  houseTypes: any;
  propertylookupdata: any;
  acqisitionOffices: any;
  propertyCategories: any;
  portfolioSources: any;
  notAvailable = DEFAULTS.NOT_AVAILABLE
  propertyInspection: any;
  currentDate = this.commonService.getFormatedDate(new Date(), 'yyyy-MM-dd');


  constructor(
    private commonService: CommonService,
    private agentService: AgentService
  ) { }

  ngOnInit() {
    this.getLookupData();
    this.getPropertyLookupData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyData && !changes.propertyData.firstChange) {
      this.propertyData = this.propertyData;
      this.getInspection(this.propertyData.propertyId);    
    }
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }

  }

  private setLookupData(data) {
    this.propertyStatuses = data.propertyStatuses;
    this.officeCodes = data.officeCodes;
    this.houseTypes = data.houseTypes;
  }

  getLookupValue(index, lookup) {
    if (index)
      return this.commonService.getLookupValue(index.toString(), lookup);
  }

  getHouseTypeLookupValue(index, lookup) {
    if (index)
      return this.commonService.getLookupValue(index, lookup);
  }

  private getPropertyLookupData() {
    this.propertylookupdata = this.commonService.getItem(PROPCO.PROPERTY_LOOKUP_DATA, true);
    if (this.propertylookupdata) {
      this.setPropertyLookupData();
    }
    else {
      let params = new HttpParams().set("hideLoader", "true");
      this.commonService.getPropertyLookup(params).subscribe(data => {
        this.commonService.setItem(PROPCO.PROPERTY_LOOKUP_DATA, data);
        this.setPropertyLookupData();
      });
    }
  }

  private setPropertyLookupData(): void {
    this.propertylookupdata = this.commonService.getItem(PROPCO.PROPERTY_LOOKUP_DATA, true);
    this.acqisitionOffices = this.propertylookupdata.acqisitionOffices;
    this.propertyCategories = this.propertylookupdata.propertyCategories;
    this.portfolioSources = this.propertylookupdata.portfolioSources;
  }

  getInspection(propertyId){
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getInspection(propertyId, params).subscribe(
        (res) => {
          this.propertyInspection = res && res.data ? res.data[0] : '';
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }
}
