import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-rejection-modal',
  templateUrl: './rejection-modal.page.html',
  styleUrls: ['./rejection-modal.page.scss'],
})
export class RejectionModalPage implements OnInit {
  rejectionForm: FormGroup;
  faultNotificationId;
  disableAnotherQuote;
  userType;
  faultMaintRejectionReasons;
  title;
  rejectedByType;
  showLoader: boolean = false;
  unSavedData = false;
  contractorId;

  constructor(private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) { }

  ngOnInit() {
    this.rejectionForm = this.formBuilder.group({
      rejectionReason: ['', Validators.required],
      isAccepted: false,
      submittedById: '',
      submittedByType: 'SECUR_USER',
      other: '',
      isLandlordWantAnotherQuote: false,
      rejectedByType: this.rejectedByType,
      contractorId: this.contractorId
    });
    this.commonService.sortBy('index', this.faultMaintRejectionReasons)
  }

  saveFaultLLAuth() {
    this.showLoader = true;
    let reqObj = JSON.parse(JSON.stringify(this.rejectionForm.value));
    if (reqObj.rejectionReason === 'Other') {
      if (reqObj.other) {
        reqObj.rejectionReason = reqObj.other;
      }
    }

    if (!this.rejectionForm.valid) {
      this.showLoader = false;
      this.rejectionForm.markAllAsTouched();
      return;
    }
    this.faultsService.saveFaultLLAuth(reqObj, this.faultNotificationId).subscribe(res => {
      this.showLoader = false;
      this.modalController.dismiss('success');
    }, error => {
      this.showLoader = false;
      this.commonService.showMessage('Something went wrong on server, please try again.', 'No Authorisation', 'error');
    })
  }

  async onCancel() {
    if (this.rejectionForm.value.isLandlordWantAnotherQuote || this.rejectionForm.value.other || this.rejectionForm.value.rejectionReason) {
      this.unSavedData = true;
    } else {
      this.dismiss();
    }
  }

  continue() {
    this.unSavedData = false;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
