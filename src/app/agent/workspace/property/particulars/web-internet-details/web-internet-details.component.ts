import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, PROPCO, DATE_FORMAT } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-web-internet-details',
  templateUrl: './web-internet-details.component.html',
  styleUrls: ['./web-internet-details.component.scss'],
})
export class WebInternetDetailsComponent implements OnInit {
  webInternetDetailForm : FormGroup;
  localStorageItems: any;
  selectedEntryDetails: any;
  lookupData: any;
  advertisementRentFrequencies: any;
  houseTypes: any;
  kitchenStyles: any;
  propertyStyles: any;
  propertyAges: any;
  parkingTypes: any;
  propertyGarages: any;
  decorativeConditions: any;
  overallConditions: any;
  heatingTypes: any;
  propertyGardens: any;
  floorAreas: any;
  furnishingTypes: any;
  propertyLookupData: any;
  DATE_FORMAT = DATE_FORMAT;
  
  constructor(
    private formBuilder : FormBuilder,
    private commonService : CommonService,
    private agentService : AgentService
  ) { }

  ngOnInit() {
    this.initForm();
    this.initApi();
  }

  private initForm() {
    this.webInternetDetailForm = this.formBuilder.group({
      numberOfBedroom : [''],
      noOfSingleBedrooms:[''],
      noOfDoubleBedrooms:[''],
      isStudio:[false],
      publishedAddress:[''],
      hasUploadedToWebsite:[false],
      numberOfBathroom:[''],
      ensuite:[''],
      showerRooms:[''],
      advertisementRent:[''],
      advertisementRentFrequency: [''],
      isPropertyOfWeek:[false],
      numberOfReception:[''],
      numberOfFloors: [''],
      availableFrom:[''],
      availableTo:[''],
      isLiftAccess:[false],
      houseType:[''],
      furnishingType:[''],
      kitchenStyle:[''],
      isStudentLettingEnabled:[false],
      propertyStyle:[''],
      propertyAge:[''],
      decorativeCondition: [''],
      overAllCondition:[''],
      isStudentFriendly:[false],
      parking:[''],
      garage:[''],
      heatingType:[''],
      garden:[''],
      isExclWaterTax:[false],
      floorArea:[''],
      floorAreaType:[''],
      landArea:[''],
      landAreaTypes:[''],
      isExclCouncilTax:[false],
      isReferral:[false]
    })
  }

  private async initApi() {
    this.localStorageItems = this.fetchItems();
    this.selectedEntryDetails = await this.getActiveTabEntityInfo();
    this.getLookupData();
    this.getPropertyLookupData();
    this.getPropertyDetails();
  }

  private getLookupData() {
    this.lookupData = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupData) {
      this.setUpLookUpData(this.lookupData);
    } else {
      this.commonService.getLookup().subscribe((data) => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupData = data;
        this.setUpLookUpData(data);
      });
    }
  }

  private getPropertyLookupData() {
    this.propertyLookupData = this.commonService.getItem(PROPCO.PROPERTY_LOOKUP_DATA, true);
    if (this.propertyLookupData) {
      this.setPropertyLookupData(this.propertyLookupData);
    }
    else {
      const params = new HttpParams().set('hideLoader', 'true');
      this.commonService.getPropertyLookup(params).subscribe(data => {
        this.commonService.setItem(PROPCO.PROPERTY_LOOKUP_DATA, data);
        this.setPropertyLookupData(data);
      });
    }
  }

  private setUpLookUpData(lookupData: any) {
    this.advertisementRentFrequencies = lookupData.advertisementRentFrequencies;
    this.houseTypes = lookupData.houseTypes;
    this.furnishingTypes = lookupData.furnishingTypes;
    this.propertyStyles = lookupData.propertyStyles;
    this.propertyAges = lookupData.propertyAges;
    this.parkingTypes =  lookupData.parkingTypes;
    this.propertyGarages = lookupData.propertyGarages;  
  }

  private setPropertyLookupData(propertyLookupData: any) {
    this.kitchenStyles = propertyLookupData.kitchenStyles;
    this.decorativeConditions = propertyLookupData.decorativeConditions;
    this.overallConditions = propertyLookupData.overallConditions;
    this.heatingTypes = propertyLookupData.heatingTypes;
    this.propertyGardens = propertyLookupData.propertyGardens;
    this.floorAreas = propertyLookupData.floorAreas;
  } 

  private getActiveTabEntityInfo(): any {
    const item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      return item[0];
    }
  }

  private fetchItems(): any {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }

  private getPropertyDetails() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve, reject) => {
      this.agentService.getPropertyDetails(this.selectedEntryDetails.entityId, params).subscribe(result => {
        if (result && result.data && result.data.propertyDetails && result.data.propertyInfo) {
          this.patchPropertyDetails(result.data.propertyDetails);
          this.patchPropertyInfo(result.data.propertyInfo);
        }
        resolve(result.data.propertyDetails);
      }, error => {
        reject(error);
      })
    })
  }


  private patchPropertyDetails(propertyDetails: any) {
    this.webInternetDetailForm.patchValue(propertyDetails);
    this.webInternetDetailForm.patchValue({
      noOfSingleBedrooms: propertyDetails.noOfSingleBedrooms ? propertyDetails.noOfSingleBedrooms : 0,
      noOfDoubleBedrooms: propertyDetails.noOfDoubleBedrooms ? propertyDetails.noOfDoubleBedrooms : 0,
      showerRooms: propertyDetails.showerRooms ? propertyDetails.showerRooms : 0,
      isLiftAccess: propertyDetails.isLiftAccess ? true : false,
      parking: Number(propertyDetails.parking)
    })
  }

  private patchPropertyInfo(propertyInfo: any) {
    this.webInternetDetailForm.patchValue(propertyInfo);
    }
}
