import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { DATE_FORMAT } from '../../constants';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-job-completion-modal',
  templateUrl: './job-completion-modal.page.html',
  styleUrls: ['./job-completion-modal.page.scss'],
})
export class JobCompletionModalPage implements OnInit {
  DATE_FORMAT = DATE_FORMAT;
  jobCompletionForm: FormGroup;
  minDate = this.commonService.getFormatedDate(new Date(), this.DATE_FORMAT.YEAR_DATE_TIME_1);
  faultNotificationId;
  heading;
  title;
  showLoader: boolean = null;
  unSavedData = false;

  constructor(private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) { }

  ngOnInit() {
    this.jobCompletionForm = this.formBuilder.group({
      dateTime: ['', Validators.required],
    });
  }

  async save() {
    if (this.jobCompletionForm.valid) {
      this.showLoader = true;
      const requestObj = {
        jobCompletionAt: this.commonService.getFormatedDate(this.jobCompletionForm.value.dateTime, this.DATE_FORMAT.YEAR_DATE_TIME),
        isAccepted: true,
        submittedByType: 'SECUR_USER'
      }

      const updateCCVisit = await this.updateNotification(this.faultNotificationId, requestObj);
      if (updateCCVisit) {
        this.modalController.dismiss('success');
      }
    } else {
      this.jobCompletionForm.markAllAsTouched();
    }
  }

  updateNotification(faultNotificationId, requestObj) {
    return new Promise((resolve) => {
      this.faultsService.updateNotification(faultNotificationId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Repair Close', 'error');
          this.showLoader = false;
          resolve(false)
        }
      );
    });
  }

  async onCancel() {
    if(this.jobCompletionForm.value.dateTime){
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
