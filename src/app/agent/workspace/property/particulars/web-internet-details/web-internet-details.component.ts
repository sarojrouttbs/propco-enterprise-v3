import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, PROPCO, DATE_FORMAT } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { IPropertyDetails } from '../../../workspace.model';
import { ParticularsService } from '../particulars.service';

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
  propertyDetails : IPropertyDetails[];
  
  constructor(
    private formBuilder : FormBuilder,
    private commonService : CommonService,
    private agentService : AgentService,
    private particularService : ParticularsService
  ) { }

  ngOnInit() {
    this.initForm();
    this.initApi();
  }

  private initForm() {
    this.webInternetDetailForm = this.formBuilder.group({
      numberOfBedroom : null,
      noOfSingleBedrooms:null,
      noOfDoubleBedrooms:null,
      isStudio:[false],
      publishedAddress:[''],
      hasUploadedToWebsite:[false],
      numberOfBathroom:[''],
      ensuite:[''],
      showerRooms:[''],
      advertisementRent:[''],
      advertisementRentFrequency: [''],
      isPropertyOfTheWeek:[false],
      numberOfReceptions:[''],
      numberOfFloors: [''],
      availableFromDate:[''],
      availableToDate:[''],
      hasLiftAccess:[false],
      houseType:[''],
      furnishingType:[''],
      kitchenStyle:[''],
      doesStudentLet:[false],
      propertyStyle:[''],
      propertyAge:[''],
      decorativeCondition: [''],
      overAllCondition:[''],
      doesStudentFriendly:[false],
      parking:[''],
      garage:[''],
      heatingType:[''],
      garden:[''],
      doesExclusiveWaterTax:[false],
      floorArea:[''],
      floorAreaType:[''],
      landArea:[''],
      landAreaTypes:[''],
      doesExclusiveCouncilTax:[false],
      isReferral:[false]
    })
  }

  private async initApi() {
    this.localStorageItems = this.fetchItems();
    this.selectedEntryDetails = await this.getActiveTabEntityInfo();
    this.getLookupData();
    this.getPropertyLookupData();
    this.getPropertyDetails();
    this.particularService.updateDetails(this.webInternetDetailForm, this.selectedEntryDetails.entityId);
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
          this.patchPropertyWebInfo(result.data.propertyWebInfo);
          this.patchPropertyDescription(result.data.propertyDescription);
        }
        resolve(result.data.propertyDetails);
      }, error => {
        reject(error);
      })
    })
  }

  private patchPropertyDetails(propertyDetails: IPropertyDetails) {
    this.webInternetDetailForm.patchValue(propertyDetails);
    this.webInternetDetailForm.patchValue({    
      showerRooms: propertyDetails.showerRooms ? propertyDetails.showerRooms : 0,
      hasLiftAccess: propertyDetails.hasLiftAccess ? true : false,
      parking: Number(propertyDetails.parking)
    })
  }

  private patchPropertyInfo(propertyInfo: IPropertyDetails) {
    this.webInternetDetailForm.patchValue(propertyInfo);
    }

  private patchPropertyDescription(propertyDescription: IPropertyDetails) {
      this.webInternetDetailForm.patchValue(propertyDescription);
  }
  
  private patchPropertyWebInfo(propertyWebInfo: IPropertyDetails) {
      this.webInternetDetailForm.patchValue(propertyWebInfo);
      // this.webInternetDetailForm.patchValue({
      //   hasUploadedToWebsite: propertyWebInfo.hasUploadedToWebsite ? false : true
      // });
  }
  
}
