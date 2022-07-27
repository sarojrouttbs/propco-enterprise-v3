import { HttpParams } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DEFAULTS, PROPCO } from '../../constants';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-property-details-card',
  templateUrl: './property-details-card.component.html',
  styleUrls: ['./property-details-card.component.scss'],
})
export class PropertyDetailsCardComponent implements OnInit, OnChanges {

  @Input() propertyData;
  lookupdata: any;
  propertylookupdata: any;
  furnishingTypes: any;
  officeCodes: any;
  managementTypes: any;
  propertyCategories: any;
  houseTypes: any;
  advertisementRentFrequencies: any;
  notAvailable = DEFAULTS.NOT_AVAILABLE
  parkingTypes: any;

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getLookupData();
    this.getPropertyLookupData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyData && !changes.propertyData.firstChange) {
      this.propertyData = this.propertyData;
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
    this.furnishingTypes = data.furnishingTypes;
    this.officeCodes = data.officeCodes;
    this.managementTypes = data.managementTypes;
    this.houseTypes = data.houseTypes;
    this.advertisementRentFrequencies = data.advertisementRentFrequencies
    this.parkingTypes = data.parkingTypes
  }

  private getPropertyLookupData() {
    this.propertylookupdata = this.commonService.getItem(PROPCO.PROPERTY_LOOKUP_DATA, true);
    if (this.propertylookupdata) {
      this.setPropertyLookupData();
    }
    else {
      let params = new HttpParams().set('hideLoader', 'true');
      this.commonService.getPropertyLookup(params).subscribe(data => {
        this.commonService.setItem(PROPCO.PROPERTY_LOOKUP_DATA, data);
        this.setPropertyLookupData();
      });
    }
  }

  private setPropertyLookupData(): void {
    this.propertylookupdata = this.commonService.getItem(PROPCO.PROPERTY_LOOKUP_DATA, true);
    this.propertyCategories = this.propertylookupdata.propertyCategories;
  }

  // getLookupValue(index: string, lookup) {
  //   if (index)
  //     return this.commonService.getLookupValue(index.toString(), lookup);
  // }

  getAdvLookupValue(index: any, lookup: any) {
    return this.commonService.getLookupValue(index, lookup);
  }
  
  getLookupValue(index: any, lookup: any) {
    if (index != null)
      return this.commonService.getLookupValue(+index, lookup);
  }
}
