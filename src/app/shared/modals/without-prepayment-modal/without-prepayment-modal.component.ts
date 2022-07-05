import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonService } from '../../services/common.service';
import { FaultsService } from 'src/app/faults/faults.service';
import { DATE_FORMAT, PAYMENT_WARNINGS, SYSTEM_OPTIONS } from '../../constants';
@Component({
  selector: 'app-without-prepayment-modal',
  templateUrl: './without-prepayment-modal.component.html',
  styleUrls: ['./without-prepayment-modal.component.scss'],
})
export class WithoutPrepaymentModalComponent implements OnInit {

  withoutPrePaymentForm: FormGroup;
  faultNotificationId;
  paymentRules;
  paymentWarnings: any[] = [];
  private REPAIR_ESTIMATE_QUOTE_THRESHOLD = 250;
  showLoader: boolean = false;
  unSavedData = false;
  DATE_FORMAT = DATE_FORMAT;
  
  constructor(private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) { }

  async ngOnInit() {
    this.withoutPrePaymentForm = this.formBuilder.group({
      overrideReason: ['', Validators.required],
      isAccepted: false,
      submittedByType: 'SECUR_USER',
      proceedWithoutPaymentAt: ''
    });
    await this.getSystemOptions();
    this.checkPaymentWarnings(this.paymentRules);
  }

  private checkPaymentWarnings(paymentRules: FaultModels.IFaultWorksorderRules) {
    if (paymentRules && paymentRules.hasOwnProperty('hasOtherInvoicesToBePaid')) {
      if (paymentRules.hasSufficientReserveBalance === false) {
        this.paymentWarnings.push(PAYMENT_WARNINGS.hasSufficientReserveBalance);
      }
      if (paymentRules.hasOtherInvoicesToBePaid === true) {
        this.paymentWarnings.push(PAYMENT_WARNINGS.hasOtherInvoicesToBePaid);
      }
      if (paymentRules.hasRentArrears === true) {
        this.paymentWarnings.push(PAYMENT_WARNINGS.hasRentArrears);
      }
      if (paymentRules.hasRentPaidUpFront === true) {
        this.paymentWarnings.push(PAYMENT_WARNINGS.hasRentPaidUpFront);
      }
      if (paymentRules.hasTenantPaidRentOnTime === false) {
        this.paymentWarnings.push(PAYMENT_WARNINGS.hasTenantPaidRentOnTime);
      }
      if (paymentRules.isFaultEstimateLessThanHalfRentOrThresHoldValue === false) {
        let thresoldText = PAYMENT_WARNINGS.isFaultEstimateLessThanHalfRentOrThresHoldValue.replace('£250', `£${this.REPAIR_ESTIMATE_QUOTE_THRESHOLD}`);
        this.paymentWarnings.push(thresoldText);
      }
      if (paymentRules.isTenancyGivenNoticeOrInLastMonth === true) {
        this.paymentWarnings.push(PAYMENT_WARNINGS.isTenancyGivenNoticeOrInLastMonth);
      }
    }

  }

  private async getSystemOptions(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.commonService.getSystemOptions(SYSTEM_OPTIONS.REPAIR_ESTIMATE_QUOTE_THRESHOLD).subscribe(res => {
        this.REPAIR_ESTIMATE_QUOTE_THRESHOLD = res ? parseInt(res.REPAIR_ESTIMATE_QUOTE_THRESHOLD, 10) : this.REPAIR_ESTIMATE_QUOTE_THRESHOLD;
        resolve(true);
      }, error => {
        resolve(false);
      });
    });
    return promise;
  }

  submit() {
    if (!this.withoutPrePaymentForm.valid) {
      this.withoutPrePaymentForm.markAllAsTouched();
      return;
    }
    this.showLoader = true;
    let reqObj = JSON.parse(JSON.stringify(this.withoutPrePaymentForm.value));
    reqObj.proceedWithoutPaymentAt = this.commonService.getFormatedDate(new Date(), this.DATE_FORMAT.YEAR_DATE_TIME);

    this.faultsService.saveProceedWithoutPrePayment(this.faultNotificationId, reqObj).subscribe(res => {
      this.showLoader = false;
      this.modalController.dismiss('success');
    }, error => {
      this.showLoader = false;
      this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Proceed without pre-payment', 'error');

    })
  }

  async onCancel() {
    if(this.withoutPrePaymentForm.value.overrideReason || this.withoutPrePaymentForm.value.proceedWithoutPaymentAt){
      this.unSavedData = true;
    }else{
      this.dismiss();
    }
  }

  continue(){
    this.unSavedData = false;
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
