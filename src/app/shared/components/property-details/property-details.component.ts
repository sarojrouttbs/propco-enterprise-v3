import { PROPCO } from './../../constants';
import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss'],
})
export class PropertyDetailsComponent implements OnInit {
  @Input() propertyDetails;
  lookupdata: any;
  advertisementRentFrequencies: any;

  constructor(public commonService: CommonService) {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData();
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.setLookupData();
      });
    }

  }

  ngOnInit() { }
  private setLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.advertisementRentFrequencies = this.lookupdata.advertisementRentFrequencies;
  }

}
