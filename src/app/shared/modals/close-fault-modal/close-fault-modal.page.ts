import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';
import { CLOSE_REASON, CLOSE_REASON_KEYS } from './../../../shared/constants';

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
  reasonKeys = CLOSE_REASON_KEYS;
  unSavedData = false;
  showLoader = false;

  constructor(private fb: FormBuilder, private modalController: ModalController, private faultsService: FaultsService, private commonService: CommonService) { }

  ngOnInit() {
    if (!this.maintenanceId) {
      this.reasons = CLOSE_REASON.filter(reason => reason.index !== CLOSE_REASON_KEYS.APPOINTMENT_NOT_BOOKED);
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
    this.closeFaultForm.get('otherReason').clearValidators();
    this.closeFaultForm.get('otherReason').updateValueAndValidity();
    this.closeFaultForm.get('otherReason').reset();
    if (this.closeFaultForm.get('closedReason').value === CLOSE_REASON_KEYS.OTHER || this.closeFaultForm.get('closedReason').value === CLOSE_REASON_KEYS.CLOSE_INTERNAL_USE_ONLY) {
      this.closeFaultForm.get('otherReason').setValidators(Validators.required);
      this.closeFaultForm.get('otherReason').updateValueAndValidity();
    }
  }

  save() {
    this.showLoader = true;
    if (this.closeFaultForm.valid) {
      let requestObj = {
        closedReason: this.closeFaultForm.value.closedReason,
        reasonText: this.closeFaultForm.value.otherReason,
        submittedById: '',
        submittedByType: 'SECUR_USER'
      };
      const promise = new Promise((resolve, reject) => {
        this.faultsService.closeFault(this.faultId, requestObj).subscribe(
          res => {
            this.showLoader = false;
            this.modalController.dismiss('success');
            resolve(true);
          },
          error => {
            this.showLoader = false;
            this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Fault close error', 'error');
            resolve(false)
          }
        );
      });
      return promise;
    } else {
      this.showLoader = false;
      this.closeFaultForm.markAllAsTouched();
    }
  }

  async onCancel() {
    if(this.closeFaultForm.value.closedReason || this.closeFaultForm.value.otherReason){
      this.unSavedData = true;
    }else{
      this.dismiss();
    }
  }

  continue(){
    this.unSavedData = false;
  }
  
  dismiss() {
    this.modalController.dismiss();
  }
}
