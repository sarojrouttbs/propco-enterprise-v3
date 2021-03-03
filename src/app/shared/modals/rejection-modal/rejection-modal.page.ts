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
  faultMaintRejectionReasons;

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
      doesWantAnotherQuote: false
    });
    this.commonService.sortBy('index', this.faultMaintRejectionReasons)
  }

  saveFaultLLAuth() {
    let reqObj = JSON.parse(JSON.stringify(this.rejectionForm.value));
    if (reqObj.rejectionReason === 'Other') {
      if (reqObj.other) {
        reqObj.rejectionReason = reqObj.other;
      }
    }

    if (!this.rejectionForm.valid) { this.rejectionForm.markAllAsTouched(); return; }
    this.faultsService.saveFaultLLAuth(reqObj, this.faultNotificationId).subscribe(res => {
      this.modalController.dismiss('success');
    }, error => {
      this.commonService.showMessage('Something went wrong on server, please try again.', 'No Authorisation', 'error');
    })
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
