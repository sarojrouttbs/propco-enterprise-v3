import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { PROPCO } from 'src/app/shared/constants';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-property-checks',
  templateUrl: './property-checks.component.html',
  styleUrls: ['./property-checks.component.scss'],
})
export class PropertyChecksComponent implements OnInit {
  propertylookupdata: any;
  carbonMonoxideDetectors: any;
  smokeDetectors: any;
  @Input() group;

  constructor(private commonService: CommonService) { }

  ngOnInit() {
    this.initApiCalls();
  }
  private async initApiCalls() {
    this.getPropertyLookupData();
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
    this.smokeDetectors = data.smokeDetectors;
    this.carbonMonoxideDetectors = data.carbonMonoxideDetectors;    
  }
}
