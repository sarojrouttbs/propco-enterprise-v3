import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-rent',
  templateUrl: './rent.component.html'
})
export class RentComponent implements OnInit {

  rentForm: FormGroup;
  localStorageItems: any;
  selectedEntityDetails: any;
  propertyDetails: any;
  activeLink: any;

  private unsubscribe = new Subject<void>();
  formStatus: FormStatus.Saving | FormStatus.Saved | FormStatus.Idle = FormStatus.Idle;
  formChangedValue = {}

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
    this.updateDetails();
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
        depositSchemeNumber: null,
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
        claimDefaultInDays: [{ value: null, disabled: true }],
        manualClaim: null,
        excessThreshold: [{ value: null, disabled: true }],
        excessMinimum: [{ value: null, disabled: true }],
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
    const params = new HttpParams().set('hideLoader', 'true');
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

  updateDetails() {
    this.rentForm.valueChanges.pipe(
      debounceTime(1000),
      tap(() => {
        this.formStatus = FormStatus.Saving;
        this.commonService.showAutoSaveLoader(this.formStatus);
        const changedData = this.commonService.getDirtyValues(this.rentForm)
        const controlName = Object.keys(changedData);
        const formArray = Object.keys(changedData[controlName[0]]);
        const formArrayValue = changedData[controlName[0]][formArray[0]];

        if (typeof formArrayValue === 'object') {
          /* to get nested controls */
          this.formChangedValue = formArrayValue;
        } else if (changedData[controlName[0]]) {
          this.formChangedValue = changedData[controlName[0]];
        }
        const controlKey = Object.keys(this.formChangedValue);
        const controlValue = this.formChangedValue[controlKey[0]];
        /* to convet date string in UK format */
        if (isNaN(controlValue)) {
          this.formChangedValue[controlKey[0]] = this.commonService.getFormatedDate(controlValue);
        }
      }),
      switchMap((value) => {
        if (Object.keys(this.formChangedValue).length > 0) {
          return this.agentService.updatePropertyDetails(this.selectedEntityDetails.entityId, this.formChangedValue);
        }
      }),
      takeUntil(this.unsubscribe)
    ).subscribe(async (value) => {
      this.rentForm.markAsPristine();
      this.rentForm.markAsUntouched();
      this.formStatus = FormStatus.Saved;
      this.commonService.showAutoSaveLoader(this.formStatus);
      await this.sleep(2000);
      if (this.formStatus === FormStatus.Saved) {
        this.formStatus = FormStatus.Idle;
        this.commonService.showAutoSaveLoader(this.formStatus);
      }
    }, (error) => {
      this.rentForm.markAsPristine();
      this.rentForm.markAsUntouched();
      this.formStatus = FormStatus.Idle;
      this.commonService.showAutoSaveLoader(this.formStatus);
      this.updateDetails();
    }
    );
  }

  sleep(ms: number): Promise<any> {
    return new Promise((res) => setTimeout(res, ms));
  }

}

enum FormStatus {
  Saving = 'Saving...',
  Saved = 'Saved!',
  Idle = '',
}