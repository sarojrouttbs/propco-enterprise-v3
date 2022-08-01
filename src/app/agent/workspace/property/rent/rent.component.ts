import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-rent',
  templateUrl: './rent.component.html',
  styleUrls: ['./rent.component.scss'],
})
export class RentComponent implements OnInit {

  rentForm: FormGroup;
  localStorageItems: any;
  selectedEntityDetails: any;
  propertyDetails: any;
  activeLink: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private agentService: AgentService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initApi()
  }

  async initApi() {
    this.initForm();
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyDetails = await this.getPropertyDetails(this.selectedEntityDetails.entityId);
  }

  initForm() {
    this.rentForm = this.formBuilder.group({
      termOfBusiness: this.formBuilder.group({
        version: [''],
      }),
      propertyRentForm: this.formBuilder.group({
        rentAmount: '',
        rentFrequency: null,
        frequencyType: null,
        depositAmount: '',
        depositSchemeNo: null,
        depositScheme: null,
        salePriceType: null,
        salePrice: '',
        aegisInsurance: null,
        rentIndemnityProductId: null,
        isRentIndeminityRequired: null,
        isRentIndeminityEnabled: null,
        isUseRentPercentage: null,
        premiumPercentage: null,
        premiumAmount: '',
        rentStartDate: null,
        rentStopDate: null,
        claimDefaultInDays: null,
        manualClaim: null,
        excessThreshold: null,
        excessMinimum: '',
        isClaimAuthorised: null,
        emergencyResponseService: this.formBuilder.group(
          {
            isERSEnabled: null,
            eriProduct: null,
            inceptionDate: null,
            renewalDate: null,
            cancelledDate: null
          }
        ),
        managementCommission: null,
        vatInclusive: null,
        secondLevelCommission: null,
        narrativeForFees: null,
        narrativeForFeesVat: null,
        lastRentReview: null,
        nextRentReview: null,
        isLandlordArrearsExcluded: null
      })
    });
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
      this.router.navigate([
        `agent/workspace/property/${item[0].entityId}/rent`,
      ]);
      this.activeLink = item[0].entityId;
      return item[0];
    }
  }

  getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set("hideLoader", "true");
    return new Promise((resolve) => {
      this.agentService.getPropertyDetails(propertyId, params).subscribe(
        (res) => {
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }
}
