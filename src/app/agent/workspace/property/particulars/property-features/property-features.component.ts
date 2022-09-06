import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IonicSelectableComponent } from 'ionic-selectable';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, PROPERTY_CLAUSE_SCOPE } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-property-features',
  templateUrl: './property-features.component.html',
  styleUrls: ['./property-features.component.scss'],
})
export class PropertyFeaturesComponent implements OnInit {
  propertyFeatures = new FormControl('');
  localStorageItems: any;
  selectedEntityDetails: any;
  propertyFeaturesList: any = [];
  propertyBulletsForm: FormGroup;
  @ViewChild('propertyFeaturesFilter') propertyFeaturesFilter: IonicSelectableComponent;

  constructor(private commonService: CommonService, private agentService: AgentService, private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.initForm();
    this.initApi();
  }

  private initForm() {
    this.initPropertyBulletsForm();
    this.createBulletPoints();
  }

  private createBulletPoints() {
    const bulletsArray = this.propertyBulletsFormArray;
    while(bulletsArray.value.length !== 3) {
      this.createPropertyBulletsForm();
    }
  }

  private async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyFeaturesList = await this.getClauses();
    this.getPropertyClauses(this.selectedEntityDetails.entityId);
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

  private getPropertyClauses(propertyId: string) {
    const params = new HttpParams()
      .set('hideLoader', 'true')
      .set('clauseScope', PROPERTY_CLAUSE_SCOPE.FEATURE);
    return new Promise((resolve) => {
      this.agentService.getPropertyClauses(propertyId, params).subscribe(
        (res: any) => {
          if (res && res.data) {
            this.propertyFeatures.setValue(res?.data);
          }
          resolve(res?.data);
        },
        (_error) => {
          resolve(false);
        }
      );
    });
  }

  private getClauses() {
    const params = new HttpParams()
      .set('hideLoader', 'true')
      .set('clauseScope', PROPERTY_CLAUSE_SCOPE.FEATURE);
    return new Promise((resolve) => {
      this.agentService.getClauses(params).subscribe(
        (res: any) => {
          resolve(res && res.data ? res.data : []);
        },
        (_error) => {
          resolve(false);
        }
      );
    });
  }

  removeFeature(selectedItem: any) {
    const index = this.propertyFeatures.value.indexOf(selectedItem);
    if (index !== -1) {
      this.propertyFeatures.value.splice(index, 1);
    }
    const selectedValue = this.propertyFeatures.value;
    this.propertyFeatures.reset();
    this.propertyFeatures.setValue(selectedValue);
  }

  compareFn(e1: any, e2: any): boolean {
    return e1 && e2 ? e1.clauseId == e2.clauseId : e1 == e2;
  }

  beginLoading() {
    this.commonService.showLoader();
  }

  endLoading() {
    this.commonService.hideLoader();
  }

  toggleItemsFeatures() {
    this.propertyFeaturesFilter.toggleItems(this.propertyFeaturesFilter.itemsToConfirm.length ? false : true);
  }

  private initPropertyBulletsForm(): void {
    this.propertyBulletsForm = this._formBuilder.group({
      propertyBulletPoint: this._formBuilder.array([])
    });
  }

  get propertyBulletsFormArray(): FormArray {
    return this.propertyBulletsForm.get('propertyBulletPoint') as FormArray;
  }

  createPropertyBulletsForm() {
    const bulletsArray = this.propertyBulletsFormArray;
    if(bulletsArray.value.length < 10) {
      bulletsArray.push(this._formBuilder.group({
        bulletPoint: ['']
      }));
    }
  }

  deletePropertyBullet(item : any, index: number) {
    this.propertyBulletsFormArray.removeAt(index);
    if (this.propertyBulletsFormArray.value.length === 0){
      this.createBulletPoints();
    }
  }
}
