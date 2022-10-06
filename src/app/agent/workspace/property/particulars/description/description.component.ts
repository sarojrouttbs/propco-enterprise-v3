import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
})
export class DescriptionComponent implements OnInit {

  descriptionForm: FormGroup;
  selectedEntityDetails: any;
  localStorageItems: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private agentService: AgentService
  ) { }

  ngOnInit() {
    this.initForm();
    this.initApi();
  }

  private initForm() {
    this.descriptionForm = this.formBuilder.group({
      stopTapLocation: [''],
      virtualTour: [''],
      publishedAddress: [''],
      epcAssetRating: [''],
      epcRegisterUrl: [''],
      internalNote: [''],
      smallDescription: [''],
      fullPublishedDescription: [''],
      directionToProperty: ['']
    });
  }

  private async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.getPropertyDetails(this.selectedEntityDetails.entityId);
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
    let item = this.localStorageItems.filter((x) => x.isSelected);
    if (Array.isArray(item) && item.length > 0) {
      return item[0];
    }
  }

  private getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getPropertyDetails(propertyId, params).subscribe(
        (res) => {
          this.patchFormValue(res?.data?.propertyDescription);
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  private patchFormValue(data) {
    this.descriptionForm.patchValue({
      stopTapLocation: data?.stopTapLocation,
      virtualTour: data?.virtualTour,
      publishedAddress: data?.publishedAddress,
      epcAssetRating: data?.epcAssetRating,
      epcRegisterUrl: data?.epcRegisterUrl,
      internalNote: data?.internalNote,
      smallDescription: data?.smallDescription,
      fullPublishedDescription: data?.fullPublishedDescription,
      directionToProperty: data?.directionToProperty
    })
  }

}
