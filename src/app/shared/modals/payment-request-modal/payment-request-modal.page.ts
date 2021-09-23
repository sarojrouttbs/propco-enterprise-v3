import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { WORKSORDER_RAISE_TYPE } from '../../constants';
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
  unSavedData = false;

  constructor(
    private modalController: ModalController,
    private faultsService: FaultsService,
    private commonService: CommonService
  ) { }

  ngOnInit() { }

  save() {
    this.modalController.dismiss('success');
  }

  skipPayment() {
    this.isPaymentSkip = true;
  }

  async saveSkipPayment() {
    this.showLoader = true;
    if (this.paymentSkippedReason.invalid) {
      this.showLoader = false;
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

    if (this.actionType === WORKSORDER_RAISE_TYPE.AUTO) {
      submit = await this.saveFaultDetails(reqObj) as boolean;
      if (submit) {
        await this.saveFaultLLAuth() as boolean;
        this.modalController.dismiss('skip-payment');
      }
    } else if (this.actionType === WORKSORDER_RAISE_TYPE.AUTO_LL_AUTH) {
      submit = await this.saveFaultDetails(reqObj) as boolean;
      if (submit) {
        const isAccepted = true;
        await this.updateFaultNotification(isAccepted, this.faultNotificationId) as boolean;
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

  private async saveFaultLLAuth() {
    const requestObj: any = {};
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

  private async updateFaultNotification(data, faultNotificationId): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      let notificationObj = {} as FaultModels.IUpdateNotification;
      notificationObj.isAccepted = data;
      notificationObj.submittedByType = 'SECUR_USER';
      this.faultsService.updateNotification(faultNotificationId, notificationObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          reject(error)
        }
      );
    });
    return promise;
  }

  async onCancel() {
    if(this.paymentSkippedReason.value){
      this.unSavedData = true;
    }else{
      this.paymentSkippedReason.reset();
      this.isPaymentSkip = false;
    }
  }

  continue(){
    this.unSavedData = false;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
