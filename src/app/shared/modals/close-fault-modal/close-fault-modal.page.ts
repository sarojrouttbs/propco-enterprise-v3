import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';
import { CANCEL_REASON } from './../../../shared/constants';

@Component({
  selector: 'app-close-fault-modal',
  templateUrl: './close-fault-modal.page.html',
  styleUrls: ['./close-fault-modal.page.scss'],
})
export class CloseFaultModalPage implements OnInit {

  closeFaultForm: FormGroup;
  faultId;
  reasons = CANCEL_REASON;
  constructor(private fb: FormBuilder, private modalController: ModalController, private faultsService: FaultsService, private commonService: CommonService) { }

  ngOnInit() {
    this.initCloseFaultForm()
  }

  initCloseFaultForm() {
    this.closeFaultForm = this.fb.group({
      cancelReason: ['', Validators.required],
      otherReason: ['']
    });
  }

  onReasonChange() {
    if (this.closeFaultForm.value.cancelReason === 'OTHER') {
      this.closeFaultForm.get('otherReason').setValidators(Validators.required);
      this.closeFaultForm.get('otherReason').updateValueAndValidity();

    } else {
      this.closeFaultForm.get('otherReason').clearValidators();
      this.closeFaultForm.get('otherReason').updateValueAndValidity();
      this.closeFaultForm.get('otherReason').reset();
    }
  }

  save() {
    if (this.closeFaultForm.valid) {
      let requestObj = {
        cancelReason: this.closeFaultForm.value.cancelReason,
        otherReason: this.closeFaultForm.value.otherReason
      };
      const promise = new Promise((resolve, reject) => {
        this.faultsService.closeFault(this.faultId, requestObj).subscribe(
          res => {
            this.modalController.dismiss('success');
            resolve(true);
          },
          error => {
            this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Fault close error', 'error');
            resolve(false)
          }
        );
      });
      return promise;
    } else {
      this.closeFaultForm.markAllAsTouched();
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
