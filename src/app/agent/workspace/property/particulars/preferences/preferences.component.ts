import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
  preferencesForm: FormGroup;
  localStorageItems: any;
  selectedEntityDetails: any;
  propertyDetails: any;

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
    this.preferencesForm = this.formBuilder.group({
      restrictions: [''],
      hasNoSmoker: [false],
      hasNoPets: [false],
      hasNoSharers: [false],
      hasNoChildren: [false],
      hasNoHousingBenefits: [false],
      hasNoStudent: [false],
      hasNoCorporate: [false],
      isSmokerNegotiable: [false],
      isPetsNegotiable: [false],
      isSharersNegotiable: [false],
      isChildrenNegotiable: [false],
      isHousingBenefitNegotiable: [false],
      isStudentNegotiable: [false],
      isCorporateNegotiable: [false],
    });
  }

  private async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyDetails = await this.getPropertyDetails(this.selectedEntityDetails.entityId);
    await this.getPropertyById(this.selectedEntityDetails.entityId);
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
    if (item) {
      return item[0];
    }
  }

  private getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getPropertyDetails(propertyId, params).subscribe(
        (res) => {
          if (res && res.data) {
            this.preferencesForm.patchValue(res.data?.propertyRestrictionInfo);
          }
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }
  private getPropertyById(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getPropertyById(propertyId, params).subscribe(
        (res) => {
          if (res && res.data) {
            this.preferencesForm.get('restrictions').setValue(res.data?.restrictions);
          }
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }
}
