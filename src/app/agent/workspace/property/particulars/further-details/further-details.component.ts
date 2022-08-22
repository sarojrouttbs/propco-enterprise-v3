import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-further-details',
  templateUrl: './further-details.component.html',
  styleUrls: ['./further-details.component.scss'],
})
export class FurtherDetailsComponent implements OnInit {
  furtherDetailsForm: FormGroup;
  localStorageItems: any;
  lookupData: any;
  lettingReason: any;
  propertyLookupData: any;
  overallConditions: any;
  decorativeConditions: any;
  selectedEntryDetails: any;
  kitchenStyles: any;
  propertyCategories: any;
  propertyLetReasons: any;
  propertyStyles: any;
  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private agentService: AgentService
  ) { }

  ngOnInit() {
    this.InitForm();
    this.InitAPI();
  }

  private InitForm() {
    this.furtherDetailsForm = this.formBuilder.group({
      legacyReference: [''],
      floor: [''],
      showerRooms: [''],
      memberNo: [''],
      lettingReason: [''],
      propertyStyle: [''],
      kitchenStyle: [''],
      propertyCategory: [''],
      overAllCondition: [''],
      decorativeCondition: [''],
      isLiftAccess: [false]
    })
  }

  private async InitAPI() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntryDetails = await this.getActiveTabEntityInfo();
    this.getLookUpData();
    this.getPropertyLookupData();
    this.getPropertyDetails();
  }

  private fetchItems() {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }

  private getActiveTabEntityInfo() {
    const item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      return item[0];
    }
  }

  private getLookUpData() {
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

  private setUpLookUpData(lookupData: any) {
    this.propertyLetReasons = lookupData.propertyLetReasons;
    this.propertyStyles = lookupData.propertyStyles;
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

  private setPropertyLookupData(propertylookupdata: any) {
    this.kitchenStyles = propertylookupdata.kitchenStyles;
    this.propertyCategories = propertylookupdata.propertyCategories;
    this.overallConditions = propertylookupdata.overallConditions;
    this.decorativeConditions = propertylookupdata.decorativeConditions;
  }

  private getPropertyDetails() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve, reject) => {
      this.agentService.getPropertyDetails(this.selectedEntryDetails.entityId, params).subscribe(result => {
        if (result && result.data && result.data.propertyDetails) {
          this.patchFurtherDetails(result.data.propertyDetails);
        }
        resolve(result.data.propertyDetails);
      }, error => {
        reject(error);
      })
    })
  }

  private patchFurtherDetails(propertyDetails: any) {
    this.furtherDetailsForm.patchValue(propertyDetails);
    this.furtherDetailsForm.patchValue({
      showerRooms: propertyDetails.showerRooms ? propertyDetails.showerRooms : 0,
      memberNo: propertyDetails.memberNo ? propertyDetails.memberNo : 0,
      isLiftAccess: propertyDetails.isLiftAccess ? true : false
    })
  }
}
