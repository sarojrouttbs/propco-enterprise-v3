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
  paymentSkippedReason = new FormControl('', [Validators.required]);

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

    if (!this.isWoRaised) {
      await this.raiseWorksOrder();
    } else {
      await this.updateWorksOrder();
    }
    submit = await this.saveFaultDetails(reqObj) as boolean;
    if (!submit) return false;
    if (submit) {
      const success = await this.issueWorksOrderContractor() as boolean;
      if (success) {
        this.modalController.dismiss('skip-payment');
      }
    }
  }

  private raiseWorksOrder() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.createFaultMaintenaceWorksOrder(this.woData, this.faultId).subscribe((res) => {
        resolve(res);
        this.commonService.showMessage('Successfully Raised', 'Works Order', 'success');
      }, error => {
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
          this.commonService.showMessage('Something went wrong', 'Arranging Contractor', 'error');
          resolve(false);
        }
      );
    });
    return promise;
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
