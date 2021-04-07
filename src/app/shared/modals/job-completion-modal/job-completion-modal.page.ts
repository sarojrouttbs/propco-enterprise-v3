import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-job-completion-modal',
  templateUrl: './job-completion-modal.page.html',
  styleUrls: ['./job-completion-modal.page.scss'],
})
export class JobCompletionModalPage implements OnInit {
  jobCompletionForm: FormGroup;
  minDate = this.commonService.getFormatedDate(new Date(), 'yyyy-MM-ddTHH:mm');
  faultNotificationId;
  heading;
  title;
  showLoader: boolean = null;

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
        jobCompletionAt: this.commonService.getFormatedDate(this.jobCompletionForm.value.dateTime, 'yyyy-MM-dd HH:mm:ss'),
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
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateNotification(faultNotificationId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Fault Close', 'error');
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
