import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonService } from '../../services/common.service';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { FaultsService } from 'src/app/faults/faults.service';
import { PAYMENT_WARNINGS } from '../../constants';

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

  constructor(private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private router: Router,
    private location: PlatformLocation,
    private faultsService: FaultsService) {
    this.router.events.subscribe((val) => {
      if (val) {
        this.dismiss();
      }
    });
    this.location.onPopState(() => this.dismiss());
  }

  ngOnInit() {
    this.withoutPrePaymentForm = this.formBuilder.group({
      overrideReason: ['', Validators.required],
      isAccepted: false,
      submittedByType: 'SECUR_USER',
      proceedWithoutPaymentAt: ''
    });
    this.checkPaymentWarnings(this.paymentRules);
  }

  private checkPaymentWarnings(paymentRules: FaultModels.IFaultWorksorderRules) {
    if (paymentRules && paymentRules.hasOwnProperty('hasOtherInvoicesToBePaid')) {
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
        this.paymentWarnings.push(PAYMENT_WARNINGS.hasOtherInvoicesToBePaid);
      }
      if (paymentRules.isTenancyGivenNoticeOrInLastMonth === false) {
        this.paymentWarnings.push(PAYMENT_WARNINGS.isTenancyGivenNoticeOrInLastMonth);
      }
    }

  }

  submit() {
    if (!this.withoutPrePaymentForm.valid) {
      this.withoutPrePaymentForm.markAllAsTouched();
      return;
    }
    let reqObj = JSON.parse(JSON.stringify(this.withoutPrePaymentForm.value));
    reqObj.proceedWithoutPaymentAt = this.commonService.getFormatedDate(new Date(), 'yyyy-MM-dd HH:mm:ss');

    this.faultsService.saveProceedWithoutPrePayment(this.faultNotificationId, reqObj).subscribe(res => {
      this.modalController.dismiss('success');
    }, error => {
      // this.commonService.showMessage('Something went wrong on server, please try again.', 'Proceed without pre-payment', 'error');
      this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Proceed without pre-payment', 'error');
      
    })
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
