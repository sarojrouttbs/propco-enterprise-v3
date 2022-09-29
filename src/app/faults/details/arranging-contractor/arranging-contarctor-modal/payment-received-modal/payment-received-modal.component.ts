import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from 'src/app/faults/faults.service';
import { PAYMENT_METHOD_TYPES } from 'src/app/shared/constants';

@Component({
  selector: 'app-payment-received-modal',
  templateUrl: './payment-received-modal.component.html',
  styleUrls: ['./payment-received-modal.component.scss'],
})
export class PaymentReceivedModalComponent implements OnInit {
  paymentReceivedForm: FormGroup;
  faultNotificationId;
  paymentMethodTypes = PAYMENT_METHOD_TYPES;
  showLoader: boolean = false;
  unSavedData = false;

  constructor(private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) { }

  ngOnInit() {
    this.paymentReceivedForm = this.formBuilder.group({
      paymentMethod: ['', Validators.required],
      isAccepted: true,
      submittedByType: 'SECUR_USER',
      // other: '',
    });
  }

  submit() {
    this.showLoader = true;
    if (!this.paymentReceivedForm.valid) {
      this.showLoader = false;
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
      this.showLoader = false;
      this.modalController.dismiss('success');
    }, error => {
      this.showLoader = false;
      // this.commonService.showMessage('Something went wrong on server, please try again.', 'Payment Received','error');
      this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Payment Received', 'error');
    })
  }

  async onCancel() {
    if (!this.paymentReceivedForm.value.paymentMethod) {
      this.dismiss();
    }else{
      this.unSavedData = true;
    }
  }

  continue() {
    this.unSavedData = false;
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
