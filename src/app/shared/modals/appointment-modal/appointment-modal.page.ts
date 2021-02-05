import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.page.html',
  styleUrls: ['./appointment-modal.page.scss'],
})
export class AppointmentModalPage implements OnInit {
  appointmentForm: FormGroup;
  faultNotificationId;
  title;
  headingOne;
  headingTwo;
  minDate;
  type;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) { }

  ngOnInit() {
    this.appointmentForm = this.formBuilder.group({
      dateTime: ['', Validators.required],
    });
    this.minDate = this.commonService.getFormatedDate(new Date(), 'yyyy-MM-dd');

  }

  async save() {
    if (this.appointmentForm.valid) {
      const requestObj = {
        contractorPropertyVisitAt: this.commonService.getFormatedDate(this.appointmentForm.value.dateTime, 'yyyy-MM-dd HH:mm:ss'),
        isAccepted: true,
        submittedByType: 'SECUR_USER'
      }

      if (this.type === 'quote') {
        const updateCCVisit = await this.saveContractorVisit(this.faultNotificationId, requestObj);
        if (updateCCVisit) {
          this.modalController.dismiss('success');
        }
      } else if (this.type === 'wo') {
        const updateCCVisit = await this.saveWoContractorVisit(this.faultNotificationId, requestObj);
        if (updateCCVisit) {
          this.modalController.dismiss('success');
        }
      }
    } else {
      this.appointmentForm.markAllAsTouched();
    }

  }

  saveContractorVisit(faultNotificationId, requestObj) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveContractorVisit(faultNotificationId, requestObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Yes, agreed Date/Time with Tenant', 'error');
          resolve(false)
        }
      );
    });
    return promise;
  }

  saveWoContractorVisit(faultNotificationId, requestObj) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateWOContractorVisit(faultNotificationId, requestObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          resolve(false)
        }
      );
    });
    return promise;

  }


  dismiss() {
    this.modalController.dismiss();
  }

}
