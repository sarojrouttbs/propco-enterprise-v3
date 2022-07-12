import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AgentService } from 'src/app/agent/agent.service';
import { PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-lettings-details',
  templateUrl: './lettings-details.component.html',
  styleUrls: ['./lettings-details.component.scss'],
})
export class LettingsDetailsComponent implements OnInit {
  @Input() group;
  lookupdata: any;
  propertyStatuses: any;
  propertyMarketingStatuses: any;
  officeCodes: any;
  propertylookupdata: any;
  managementTypes: any;
  rentCategories: any;
  acqisitionOffices: any;
  portfolioSources: any;
  propertyLetReasons: any;
  propertyAreas: any;
  propertyLocations: any;
  constructor(private commonService: CommonService, private agentService: AgentService) { }

  ngOnInit() {
    this.initAPIcalls();
  }

  private async initAPIcalls() {
    this.getLookupData();
    this.getPropertyLookupData();
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
    this.propertyStatuses = data.propertyStatuses;
    this.propertyMarketingStatuses = data.propertyMarketingStatuses;
    this.managementTypes = data.managementTypes;
    this.rentCategories = data.rentCategories;
    this.officeCodes = data.officeCodes;
    this.propertyLetReasons = data.propertyLetReasons;
  }

  private getPropertyLookupData() {
    this.propertylookupdata = this.commonService.getItem(PROPCO.PROPERTY_LOOKUP_DATA, true);
    if (this.propertylookupdata) {
      this.setPropertyLookupData(this.propertylookupdata);
    }
    else {
      let params = new HttpParams().set("hideLoader", "true");
      this.commonService.getPropertyLookup(params).subscribe(data => {
        this.commonService.setItem(PROPCO.PROPERTY_LOOKUP_DATA, data);
        this.setPropertyLookupData(data);
      });
    }
  }

  private setPropertyLookupData(data): void {
    this.acqisitionOffices = data.acqisitionOffices;
    this.portfolioSources = data.portfolioSources;
    this.propertyAreas = data.propertyAreas;
  }

  getPropertyLocations(officeCode) {
    this.propertyLocations = [];
    this.agentService.getOfficeLocations(officeCode).subscribe(
      res => {
        if(res && res.data) {
          this.propertyLocations = res.data;
        }
      },
      error => {
        this.propertyLocations = [];
        const data: any = {};
        data.title = 'Property Location Lookup';
        data.message = error.error ? error.error.message : error.message;
        this.commonService.showMessage(data.message, data.title, 'error');
      }
    );
  }
}
