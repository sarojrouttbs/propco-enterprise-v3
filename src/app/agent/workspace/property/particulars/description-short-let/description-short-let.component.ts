import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-description-short-let',
  templateUrl: './description-short-let.component.html',
  styleUrls: ['./description-short-let.component.scss'],
})
export class DescriptionShortLetComponent implements OnInit {

  descShortLetForm: FormGroup;
  localStorageItems: any;
  selectedEntryDetails: any;
  lookupData: any;
  advertisementRentFrequencies: any;
  descpData:any;

  constructor(
    private formBuilder : FormBuilder,
    private commonService: CommonService,
    private agentService: AgentService
  ) { }

  ngOnInit() {
    this.initForm();
    this.initAPI();
  }
private initForm() {  
    this.descShortLetForm = this.formBuilder.group({
      publishedAddress : [''],
      advertisedRent: [''],
      rentPeriodicity:[0],
      smallDescription:[''],
      fullPublishedDescription:[''],
      advertisedDeposit:['']
    });
  }

  private async initAPI() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntryDetails = await this.getActiveTabEntityInfo();
    this.getLookUpData();  
    this.getCopyPropertyDescription().then((result) => {
      this.descpData = result;
    });
    this.getPropertyDescription();
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
    this.advertisementRentFrequencies = lookupData.advertisementRentFrequencies;   
  }

  private getCopyPropertyDescription(){
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve, reject) => {
      this.agentService.getPropertyDetails(this.selectedEntryDetails.entityId, params).subscribe(result => {       
        resolve(result.data?.propertyDescription);
      }, error => {
        reject(error);
      })
    })
  }

  private getPropertyDescription(){
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve, reject) => {
      this.agentService.getPropertyShortLetDesc(this.selectedEntryDetails.entityId, params).subscribe(result => {     
        this.patchShortLetFormValue(result);
        resolve(result.data?.propertyDescription);
      }, error => {
        reject(error);
      })
    })
  }

   copyDescription(){
    this.descShortLetForm.patchValue({
      smallDescription:this.descpData.smallDescription,
      fullPublishedDescription:this.descpData.fullPublishedDescription,
    })
  }

  patchShortLetFormValue(data){
    this.descShortLetForm.patchValue({
      publishedAddress : data.publishedAddress,
      advertisedRent: data.advertisedRent,
      rentPeriodicity:data.rentPeriodicity,
      smallDescription:data.smallDescription,
      fullPublishedDescription:data.fullPublishedDescription,
      advertisedDeposit:data.advertisedDeposit,
    })
  }
}
