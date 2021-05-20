import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { APPOINTMENT_MODAL_TYPE } from '../../constants';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.page.html',
  styleUrls: ['./appointment-modal.page.scss'],
})
export class AppointmentModalPage implements OnInit {
  appointmentForm: FormGroup;
  faultId;
  faultNotificationId;
  title;
  headingOne;
  headingTwo;
  minDate;
  type;
  futureDate;
  showLoader: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) { }

  ngOnInit() {
    this.appointmentForm = this.formBuilder.group({
      dateTime: ['', Validators.required],
    });
    const currentDate = new Date();
    // this.minDate = this.commonService.getFormatedDate(currentDate, 'yyyy-MM-ddTHH:mm');
  }

  async save() {
    if (this.appointmentForm.valid) {
      const requestObj = {
        contractorPropertyVisitAt: this.commonService.getFormatedDate(this.appointmentForm.value.dateTime, 'yyyy-MM-dd HH:mm:ss'),
        isAccepted: true,
        submittedByType: 'SECUR_USER'
      }

      if (this.type === APPOINTMENT_MODAL_TYPE.QUOTE) {
        const updateCCVisit = await this.saveContractorVisit(this.faultNotificationId, requestObj);
        if (updateCCVisit) {
          this.modalController.dismiss('success');
        }
      } else if (this.type === APPOINTMENT_MODAL_TYPE.WO) {
        const updateCCVisit = await this.saveWoContractorVisit(this.faultNotificationId, requestObj);
        if (updateCCVisit) {
          this.modalController.dismiss('success');
        }
      } else if (this.type === APPOINTMENT_MODAL_TYPE.MODIFY_QUOTE) {
        const quoteRequestObj = {
          contractorQuotePropertyVisitAt: this.commonService.getFormatedDate(this.appointmentForm.value.dateTime, 'yyyy-MM-dd HH:mm:ss')
        };
        const updateCCVisit = await this.modifyContractorVisit(this.faultId, quoteRequestObj);
        if (updateCCVisit) {
          this.modalController.dismiss('success');
        }
      } else if (this.type === APPOINTMENT_MODAL_TYPE.MODIFY_WO) {
        const quoteRequestObj = {
          contractorWoPropertyVisitAt: this.commonService.getFormatedDate(this.appointmentForm.value.dateTime, 'yyyy-MM-dd HH:mm:ss')
        };
        const updateCCVisit = await this.modifyWoContractorVisit(this.faultId, quoteRequestObj);
        if (updateCCVisit) {
          this.modalController.dismiss('success');
        }
      }
    } else {
      this.appointmentForm.markAllAsTouched();
    }

  }

  saveContractorVisit(faultNotificationId, requestObj) {
    this.showLoader = true;
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveContractorVisit(faultNotificationId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Yes, agreed Date/Time with Tenant', 'error');
          resolve(false)
        }
      );
    });
    return promise;
  }

  saveWoContractorVisit(faultNotificationId, requestObj) {
    this.showLoader = true;
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateWOContractorVisit(faultNotificationId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          resolve(false)
        }
      );
    });
    return promise;
  }

  modifyContractorVisit(faultId, requestObj) {
    this.showLoader = true;
    const promise = new Promise((resolve, reject) => {
      this.faultsService.modifyContractorVisit(faultId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          resolve(false)
        }
      );
    });
    return promise;
  }

  modifyWoContractorVisit(faultId, requestObj) {
    this.showLoader = true;
    const promise = new Promise((resolve, reject) => {
      this.faultsService.modifyWoContractorVisit(faultId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
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
