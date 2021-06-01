import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';
import { CLOSE_REASON } from './../../../shared/constants';

@Component({
  selector: 'app-close-fault-modal',
  templateUrl: './close-fault-modal.page.html',
  styleUrls: ['./close-fault-modal.page.scss'],
})
export class CloseFaultModalPage implements OnInit {

  closeFaultForm: FormGroup;
  faultId;
  maintenanceId;
  reasons = CLOSE_REASON;
  unSavedData = false;

  constructor(private fb: FormBuilder, private modalController: ModalController, private faultsService: FaultsService, private commonService: CommonService) { }

  ngOnInit() {
    if (!this.maintenanceId) {
      this.reasons = CLOSE_REASON.filter(reason => reason.index !== 'APPOINTMENT_NOT_BOOKED');
    }
    this.initCloseFaultForm()
  }

  initCloseFaultForm() {
    this.closeFaultForm = this.fb.group({
      closedReason: ['', Validators.required],
      otherReason: ['']
    });
  }

  onReasonChange() {
    if (this.closeFaultForm.value.closedReason === 'OTHER') {
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
        closedReason: this.closeFaultForm.value.closedReason,
        otherReason: this.closeFaultForm.value.otherReason,
        submittedById: '',
        submittedByType: 'SECUR_USER'
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

  async onCancel() {
    this.unSavedData = true;
  }

  continue(){
    this.unSavedData = false;
  }
  
  dismiss() {
    this.modalController.dismiss();
  }
}
