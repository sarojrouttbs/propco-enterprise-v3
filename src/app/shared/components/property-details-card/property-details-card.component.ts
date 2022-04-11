import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PROPCO } from '../../constants';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-property-details-card',
  templateUrl: './property-details-card.component.html',
  styleUrls: ['./property-details-card.component.scss'],
})
export class PropertyDetailsCardComponent implements OnInit, OnChanges {

  @Input() propertyData;
  lookupdata: any;
  furnishingTypes: any;
  officeCodes: any;

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getLookupData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyData && !changes.propertyData.firstChange) {
      this.propertyData = this.propertyData      
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
  }

  getLookupValue(index: string, lookup) {
    if (index)
      return this.commonService.getLookupValue(index.toString(), lookup);
  }

}
