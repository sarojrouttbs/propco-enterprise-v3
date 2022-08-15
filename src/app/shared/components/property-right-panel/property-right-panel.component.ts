import { HttpParams } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AgentService } from 'src/app/agent/agent.service';
import { DATE_FORMAT, DEFAULTS, PROPCO } from '../../constants';
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
  propertylookupdata: any;
  acqisitionOffices: any;
  portfolioSources: any;
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  DATE_FORMAT = DATE_FORMAT;
  property: any;

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getLookupData();
    this.getPropertyLookupData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyData && !changes.propertyData.firstChange) {
      this.property = this.propertyData;
      this.property.propertyInfo.status = this.property?.propertyInfo?.status.toString();
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
  }

  private getPropertyLookupData() {
    this.propertylookupdata = this.commonService.getItem(PROPCO.PROPERTY_LOOKUP_DATA, true);
    if (this.propertylookupdata) {
      this.setPropertyLookupData();
    }
    else {
      const params = new HttpParams().set('hideLoader', 'true');
      this.commonService.getPropertyLookup(params).subscribe(data => {
        this.commonService.setItem(PROPCO.PROPERTY_LOOKUP_DATA, data);
        this.setPropertyLookupData();
      });
    }
  }

  private setPropertyLookupData(): void {
    this.propertylookupdata = this.commonService.getItem(PROPCO.PROPERTY_LOOKUP_DATA, true);
    this.acqisitionOffices = this.propertylookupdata.acqisitionOffices;
    this.portfolioSources = this.propertylookupdata.portfolioSources;
  }
}
