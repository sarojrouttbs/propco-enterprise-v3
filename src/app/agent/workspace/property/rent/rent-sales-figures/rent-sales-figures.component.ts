import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { PROPCO } from 'src/app/shared/constants';
import { ChangeGrossPage } from 'src/app/shared/modals/change-gross/change-gross.page';
import { ChangeNettPage } from 'src/app/shared/modals/change-nett/change-nett.page';
import { FeeChargePage } from 'src/app/shared/modals/fee-charge/fee-charge.page';
import { CommonService } from 'src/app/shared/services/common.service';

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
  constructor(private commonService: CommonService, private agentService: AgentService, private modalController: ModalController) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyDetails && !changes.propertyDetails.firstChange) {
      this.propertyDetails = this.propertyDetails;
      if (this.propertyDetails) {
        this.patchFormData();
      }
    }
  }

  ngOnInit() {
    this.getLookupData();
    this.getPropertyLookupData();
    this.getRentIndemnityProducts();
  }

  private patchFormData(): void {
    this.group.patchValue({
      rentAmount: this.propertyDetails?.propertyRentInfo?.rentAmount,
      rentFrequency: this.propertyDetails?.propertyRentInfo?.rentFrequency,
      frequencyType: this.propertyDetails?.propertyRentInfo?.frequencyType,
      depositAmount: this.propertyDetails?.propertyRentInfo?.depositAmount,
      depositSchemeNo: this.propertyDetails?.propertyRentInfo?.depositSchemeNo,
      depositScheme: this.propertyDetails?.propertyRentInfo?.depositScheme,
      salePriceType: this.propertyDetails?.propertyRentInfo?.salePriceType,
      salePrice: this.propertyDetails?.propertyRentInfo?.salePrice,
      aegisInsurance: this.propertyDetails?.propertyRentInfo?.aegisInsurance,
      rentIndemnityProductId: this.propertyDetails?.propertyRentInfo?.rentIndemnityProductId,
      isRentIndeminityRequired: this.propertyDetails?.propertyRentInfo?.isRentIndeminityRequired,
      isRentIndeminityEnabled: this.propertyDetails?.propertyRentInfo?.isRentIndeminityEnabled,
      isUseRentPercentage: this.propertyDetails?.propertyRentInfo?.isUseRentPercentage,
      premiumPercentage: this.propertyDetails?.propertyRentInfo?.premiumPercentage,
      premiumAmount: this.propertyDetails?.propertyRentInfo?.premiumAmount || '',
      rentStartDate: this.propertyDetails?.propertyRentInfo?.rentStartDate,
      rentStopDate: this.propertyDetails?.propertyRentInfo?.rentStopDate,
      claimDefaultInDays: this.propertyDetails?.propertyRentInfo?.claimDefaultInDays,
      manualClaim: this.propertyDetails?.propertyRentInfo?.manualClaim,
      isClaimAuthorised: this.propertyDetails?.propertyRentInfo?.isClaimAuthorised,
      emergencyResponseService:
      {
        isERSEnabled: this.propertyDetails?.propertyRentInfo?.isERSEnabled,
        eriProduct: this.propertyDetails?.propertyRentInfo?.eriProduct,
        inceptionDate: this.propertyDetails?.propertyRentInfo?.inceptionDate,
        renewalDate: this.propertyDetails?.propertyRentInfo?.renewalDate,
        cancelledDate: this.propertyDetails?.propertyRentInfo?.cancelledDate
      },
      managementCommission: this.propertyDetails?.propertyRentInfo?.managementCommission,
      vatInclusive: this.propertyDetails?.propertyRentInfo?.vatInclusive,
      secondLevelCommission: this.propertyDetails?.propertyRentInfo?.secondLevelCommission,
      narrativeForFees: this.propertyDetails?.propertyRentInfo?.narrativeForFees,
      narrativeForFeesVat: this.propertyDetails?.propertyRentInfo?.narrativeForFeesVat,
      lastRentReview: this.propertyDetails?.propertyRentInfo?.lastRentReview,
      nextRentReview: this.propertyDetails?.propertyRentInfo?.nextRentReview,
      isLandlordArrearsExcluded: this.propertyDetails?.propertyRentInfo?.isLandlordArrearsExcluded
    });
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
    const promise = new Promise((resolve, reject) => {
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

    modal.onDidDismiss().then(async res => {
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

    modal.onDidDismiss().then(async res => {
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

    modal.onDidDismiss().then(async res => {
    });
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
          excessThreshold: selectedProduct?.excessThreshold,
          excessMinimum: selectedProduct?.excessMinimum ? selectedProduct?.excessMinimum: ''
        });
      }
    }
  }
}

