import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonService } from '../../services/common.service';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { FaultsService } from 'src/app/faults/faults.service';
import { PAYMENT_METHOD_TYPES } from '../../constants';

@Component({
  selector: 'app-payment-received-modal',
  templateUrl: './payment-received-modal.component.html',
  styleUrls: ['./payment-received-modal.component.scss'],
})
export class PaymentReceivedModalComponent implements OnInit {
  paymentReceivedForm: FormGroup;
  faultNotificationId;
  paymentMethodTypes = PAYMENT_METHOD_TYPES;

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
    this.paymentReceivedForm = this.formBuilder.group({
      paymentMethod: ['', Validators.required],
      isAccepted: true,
      submittedByType: 'SECUR_USER',
      // other: '',
    });
  }

  submit() {
    if (!this.paymentReceivedForm.valid) {
      this.paymentReceivedForm.markAllAsTouched();
      return;
    }
    let reqObj = JSON.parse(JSON.stringify(this.paymentReceivedForm.value));
    // if (reqObj.rejectionReason === 'Other') {
    //   if (reqObj.other) {
    //     reqObj.rejectionReason = reqObj.other;
    //   }
    // }
    this.faultsService.savePaymentReceived(this.faultNotificationId, reqObj).subscribe(res => {
      this.modalController.dismiss('success');
    }, error => {
      // this.commonService.showMessage('Something went wrong on server, please try again.', 'Payment Received','error');
      this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Payment Received','error');
    })
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
