import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-payment-request-modal',
  templateUrl: './payment-request-modal.page.html',
  styleUrls: ['./payment-request-modal.page.scss'],
})
export class PaymentRequestModalPage implements OnInit {
  stageAction;
  paymentWarnings;
  isWoRaised;
  isPaymentSkip = false;
  woData;
  faultId;
  maintenanceId;
  isDraft;
  stage;
  actionType;
  faultNotificationId;
  paymentSkippedReason = new FormControl('', [Validators.required]);
  showLoader: boolean = false;

  constructor(
    private modalController: ModalController,
    private faultsService: FaultsService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
  }

  save() {
    this.modalController.dismiss('success');
  }

  skipPayment() {
    this.isPaymentSkip = true;
  }

  cancelSkipPaymnet() {
    this.paymentSkippedReason.reset();
    this.isPaymentSkip = false;
  }

  async saveSkipPayment() {
    this.showLoader = true;
    if (this.paymentSkippedReason.invalid) {
      this.paymentSkippedReason.markAllAsTouched();
      return;
    }
    let reqObj = {
      stage: this.stage,
      isDraft: this.isDraft,
      submittedByType: 'SECUR_USER',
      submittedById: '',
      paymentSkippedReason: this.paymentSkippedReason.value,
      isPaymentSkipped: true
    };
    let submit: boolean;

    if (this.actionType === 'auto') {
      submit = await this.saveFaultLLAuth() as boolean;
      if (submit) {
        await this.saveFaultDetails(reqObj) as boolean;
        this.modalController.dismiss('skip-payment');
      }
    } else {
      if (!this.isWoRaised) {
        await this.raiseWorksOrder();
      } else {
        await this.updateWorksOrder();
      }

      submit = await this.saveFaultDetails(reqObj) as boolean;
      if (!submit) {
        this.showLoader = false;
        return false;
      }
      if (submit) {
        const success = await this.issueWorksOrderContractor() as boolean;
        if (success) {
          this.showLoader = false;
          this.modalController.dismiss('skip-payment');
        }
      }
    }
  }

  private raiseWorksOrder() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.createFaultMaintenaceWorksOrder(this.woData, this.faultId).subscribe((res) => {
        resolve(res);
        this.commonService.showMessage('Successfully Raised', 'Works Order', 'success');
      }, error => {
        this.showLoader = false;
        resolve(false);
        this.commonService.showMessage('Something went wrong', 'Works Order', 'error');
      });
    });
    return promise;
  }

  private updateWorksOrder() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateQuoteDetails(
        this.woData, this.maintenanceId).subscribe((res) => {
          resolve(true);
          this.commonService.showMessage('Successfully Updated', 'Works Order', 'success');
        }, error => {
          this.showLoader = false;
          resolve(false);
          this.commonService.showMessage('Something went wrong', 'Works Order', 'error');
        });
    });
    return promise;
  }

  private async saveFaultDetails(data): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveFaultDetails(this.faultId, data).subscribe(
        res => {
          resolve(true);
        },
        error => {
          this.showLoader = false;
          reject(false)
        }
      );
    });
    return promise;
  }

  private issueWorksOrderContractor() {
    const promise = new Promise((resolve, reject) => {
      let req: any = {};
      req.submittedById = '';
      req.submittedByType = 'SECUR_USER';
      this.faultsService.issueWorksOrderContractor(this.faultId, req).subscribe(
        res => {
          resolve(true);
        },
        error => {
          this.showLoader = false;
          this.commonService.showMessage('Something went wrong', 'Arranging Contractor', 'error');
          resolve(false);
        }
      );
    });
    return promise;
  }

  saveFaultLLAuth() {
    const requestObj: any = {};
    requestObj.rejectionReason = '';
    requestObj.isAccepted = true;
    requestObj.submittedByType = 'SECUR_USER';
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveFaultLLAuth(requestObj, this.faultNotificationId).subscribe(res => {
        resolve(true);
      }, error => {
        this.commonService.showMessage('No Authorisation', 'Something went wrong', 'error');
        resolve(false);
      })
    });
    return promise;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}