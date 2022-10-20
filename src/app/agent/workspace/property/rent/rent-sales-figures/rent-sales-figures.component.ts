import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { DATE_FORMAT, PROPCO, SYSTEM_OPTIONS } from 'src/app/shared/constants';
import { ChangeGrossPage } from './rent-sales-figures-modal/change-gross/change-gross.page';
import { ChangeNettPage } from './rent-sales-figures-modal/change-nett/change-nett.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { FeeChargePage } from './rent-sales-figures-modal/fee-charge/fee-charge.page';

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
  aegisInsurances: any;
  rentFrequencyDropdown: number[] = this.getNumbers();
  rentIndemnityProducts: any;
  eriProducts: any;
  property: any;
  isRentForm = false;
  DATE_FORMAT = DATE_FORMAT;
  dateChanged = new FormControl('');
  systemOptions: any;

  constructor(private commonService: CommonService, private agentService: AgentService, private modalController: ModalController) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyDetails && !changes.propertyDetails.firstChange) {
      this.property = this.propertyDetails;
      if (this.propertyDetails) {
        this.patchFormData();
      }
    }
  }

  ngOnInit() {
    this.getLookupData();
    this.getPropertyLookupData();
    this.getRentIndemnityProducts();
    this.getOptions();
  }

  private patchFormData(): void {
    this.group.patchValue({
      rentAmount: this.property?.propertyRentInfo?.rentAmount || 0,
      rentFrequency: this.property?.propertyRentInfo?.rentFrequency,
      frequencyType: this.property?.propertyRentInfo?.frequencyType,
      depositAmount: this.property?.propertyRentInfo?.depositAmount || 0,
      depositSchemeNumber: this.property?.propertyRentInfo?.depositSchemeNumber,
      depositScheme: parseInt(this.property?.propertyRentInfo?.depositScheme),
      salePriceType: this.property?.propertyRentInfo?.salePriceType,
      salePrice: this.property?.propertyRentInfo?.salePrice || 0,
      aegisInsurance: this.property?.propertyRentInfo?.aegisInsurance,
      rentIndemnityProductId: this.property?.propertyRentInfo?.rentIndemnityProductId,
      isRentIndeminityRequired: this.property?.propertyRentInfo?.isRentIndeminityRequired,
      isRentIndeminityEnabled: this.property?.propertyRentInfo?.isRentIndeminityEnabled,
      isUseRentPercentage: this.property?.propertyRentInfo?.isUseRentPercentage,
      premiumPercentage: this.property?.propertyRentInfo?.premiumPercentage,
      premiumAmount: this.property?.propertyRentInfo?.premiumAmount || '',
      rentStartDate: this.property?.propertyRentInfo?.rentStartDate,
      rentStopDate: this.property?.propertyRentInfo?.rentStopDate,
      claimDefaultInDays: this.property?.propertyRentInfo?.claimDefaultInDays,
      manualClaim: this.property?.propertyRentInfo?.manualClaim,
      isClaimAuthorised: this.property?.propertyRentInfo?.isClaimAuthorised,
      emergencyResponseService:
      {
        isERSEnabled: this.property?.propertyRentInfo?.emergencyResponseService?.isERSEnabled,
        eriProduct: this.property?.propertyRentInfo?.emergencyResponseService?.eriProduct ? parseInt(this.property?.propertyRentInfo?.emergencyResponseService?.eriProduct) : null,
        inceptionDate: this.property?.propertyRentInfo?.emergencyResponseService?.inceptionDate,
        renewalDate: this.property?.propertyRentInfo?.emergencyResponseService?.renewalDate,
        cancelledDate: this.property?.propertyRentInfo?.emergencyResponseService?.cancelledDate
      },
      managementCommission: this.property?.propertyRentInfo?.managementCommission,
      vatInclusive: this.property?.propertyRentInfo?.vatInclusive,
      secondLevelCommission: this.property?.propertyRentInfo?.secondLevelCommission,
      narrativeForFees: this.property?.propertyRentInfo?.narrativeForFees,
      narrativeForFeesVat: this.property?.propertyRentInfo?.narrativeForFeesVat,
      lastRentReview: this.property?.propertyRentInfo?.lastRentReview,
      nextRentReview: this.property?.propertyRentInfo?.nextRentReview,
      isLandlordArrearsExcluded: this.property?.propertyRentInfo?.isLandlordArrearsExcluded
    });
    this.isRentForm = true;
    if (this.property?.propertyRentInfo?.isUseRentPercentage)
      this.group.get('premiumPercentage').enable();
    else
      this.group.get('premiumPercentage').disable();
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
      const params = new HttpParams().set('hideLoader', 'true');
      this.commonService.getPropertyLookup(params).subscribe(data => {
        this.commonService.setItem(PROPCO.PROPERTY_LOOKUP_DATA, data);
        this.setPropertyLookupData(data);
      });
    }
  }

  private setPropertyLookupData(data): void {
    this.salePrices = data.salePrices;
    this.aegisInsurances = data.aegisInsurances;
    this.eriProducts = data.eriProducts;
  }

  private setLookupData(data) {
    this.frequencyTypes = data.frequencyTypes;
    this.depositSchemes = data.depositSchemes;
  }

  private getNumbers() {
    let numbers = [];
    for (let index = 1; index < 60; index++) {
      numbers.push(index);
    }
    return numbers;
  }

  private getRentIndemnityProducts() {
    let params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getRentindemnityProducts(params).subscribe((res) => {
        this.rentIndemnityProducts = res && res.data ? res.data : [];
        resolve(true);
      }, error => {
        resolve(false);
      });
    });
  }

  async opneChangeNettModal() {
    const modal = await this.modalController.create({
      component: ChangeNettPage,
      cssClass: 'modal-container nett-modal-container',
      componentProps: {},
      backdropDismiss: false
    });

    modal.onDidDismiss().then(res => {
      if (res && res.data) {
        const commission = parseFloat(res.data);
        const vat = (commission * ((this.systemOptions / 100) + 1)).toFixed(2);
        this.group.get('managementCommission').patchValue(commission);
        this.group.get('vatInclusive').patchValue(vat);
        this.group.get('managementCommission').markAsDirty();
        this.group.get('vatInclusive').markAsDirty();
        this.group.updateValueAndValidity();
      }
    });
    await modal.present();
  }

  async opneChangeGrossModal() {
    const modal = await this.modalController.create({
      component: ChangeGrossPage,
      cssClass: 'modal-container nett-modal-container',
      componentProps: {},
      backdropDismiss: false
    });

    modal.onDidDismiss().then(res => {
      if (res && res.data) {
        const vat = parseFloat(res.data);
        const commission = (vat / ((this.systemOptions / 100) + 1)).toFixed(2);
        this.group.get('vatInclusive').patchValue(vat);
        this.group.get('managementCommission').patchValue(commission);
        this.group.get('managementCommission').markAsDirty();
        this.group.get('vatInclusive').markAsDirty();
        this.group.updateValueAndValidity();
      }
    });
    await modal.present();
  }

  async opneFeeChargeModal() {
    const modal = await this.modalController.create({
      component: FeeChargePage,
      cssClass: 'modal-container fee-charge-modal-container',
      componentProps: {},
      backdropDismiss: false
    });

    modal.onDidDismiss();
    await modal.present();
  }

  removeDate(control: string) {
    if (control) {
      this.group.controls.emergencyResponseService.get(control).setValue(null);
    }
  }

  async onProductChange(value: number) {
    if (!value) {
      return;
    }
    if (this.rentIndemnityProducts) {
      const selectedProduct = this.rentIndemnityProducts.find(x => x.rentIndemnityProductId === value);
      if (selectedProduct) {
        this.group.patchValue({
          excessThreshold: selectedProduct?.excessThreshold * 100,
          excessMinimum: selectedProduct?.excessMinimum ? selectedProduct?.excessMinimum : ''
        });
      }
    }
  }

  onUseRentPercentageChange(e: any) {
    const val = e.detail.checked;
    if (val)
      this.group.get('premiumPercentage').enable();
    else
      this.group.get('premiumPercentage').disable();
  }

  private getOptions() {
    const params = new HttpParams()
      .set('hideLoader', 'true')
      .set('option', SYSTEM_OPTIONS.STDVATRATE);
    return new Promise((resolve) => {
      this.agentService.getSyatemOptions(params).subscribe(
        (res) => {
          this.systemOptions = res ? res.STDVATRATE : '';
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }
}

