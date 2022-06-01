import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-rent-sales-figures',
  templateUrl: './rent-sales-figures.component.html',
  styleUrls: ['./rent-sales-figures.component.scss'],
})
export class RentSalesFiguresComponent implements OnInit {
  @Input() group: FormGroup;
  @Input() propertyDetails;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  lookupData: any;
  propertyLookupData: any;
  frequencyTypes: any;
  depositSchemes: any;
  salePrices: any;
  aegisInsurances:any;
  constructor(private commonService: CommonService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyDetails && !changes.propertyDetails.firstChange) {
      this.propertyDetails = this.propertyDetails;
      if (this.propertyDetails) {
        this.patchFormData();
      }
    }
  }

  ngOnInit() {
    this.getLookupData();
    this.getPropertyLookupData();
  }

  private patchFormData(): void {
    console.log(this.propertyDetails);
    this.group.patchValue({
      rentAmount: this.propertyDetails?.propertyRentInfo?.rentAmount,
      rentFrequency: this.propertyDetails?.propertyRentInfo?.rentFrequency,
      frequencyType: this.propertyDetails?.propertyRentInfo?.frequencyType,
      depositAmount: this.propertyDetails?.propertyRentInfo?.depositAmount,
      depositSchemeNo: this.propertyDetails?.propertyRentInfo?.depositSchemeNo,
      depositScheme: this.propertyDetails?.propertyRentInfo?.depositScheme,
      salePriceType: this.propertyDetails?.propertyRentInfo?.salePriceType,
      salePrice: this.propertyDetails?.propertyRentInfo?.salePrice,
    });
  }
  
  private getLookupData() {
    this.lookupData = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupData) {
      this.setLookupData(this.lookupData);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupData = data;
        this.setLookupData(data);
      });
    }
  }

  private getPropertyLookupData() {
    this.propertyLookupData = this.commonService.getItem(PROPCO.PROPERTY_LOOKUP_DATA, true);
    if (this.propertyLookupData) {
      this.setPropertyLookupData(this.propertyLookupData);
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
    this.salePrices = data.salePrices;
    this.aegisInsurances = data.aegisInsurances;
  }

  private setLookupData(data) {
    this.frequencyTypes = data.frequencyTypes;
    this.depositSchemes = data.depositSchemes;
  }

}
