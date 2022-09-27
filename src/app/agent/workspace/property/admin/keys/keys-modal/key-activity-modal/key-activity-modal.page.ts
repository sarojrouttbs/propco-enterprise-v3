import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { DATE_FORMAT } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'app-key-activity-modal',
  templateUrl: './key-activity-modal.page.html',
  styleUrls: ['./key-activity-modal.page.scss'],
})
export class KeyActivityModalPage implements OnInit {
  isAddKeyActivity;
  data;
  keyActivities;
  keyActivityForm: FormGroup;
  userDetailsList;
  DATE_FORMAT = DATE_FORMAT;
  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private agentService: AgentService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initData();
  }

  private initData() {
    this.initForm();
    if (this.isAddKeyActivity) {
      this.keyActivityForm.get('activityType').setValue(this.data.activityType);
      this.keyActivityForm.get('postDate').setValue(this.commonService.getFormatedDate(new Date()));
      this.keyActivityForm.get('userId').setValue(this.data.userId);
    } else {
      this.patchActivityValue();
    }
  }

  private initForm() {
    this.keyActivityForm = this.formBuilder.group({
      activityType: [{ value: '', disabled: true }, Validators.required],
      name: ['', Validators.maxLength(50)],
      contact: ['', [Validators.maxLength(50), ValidationService.numberValidator]],
      userId: ['', Validators.required],
      postDate: '',
      note: ['', Validators.maxLength(255)],
    });
  }

  private patchActivityValue() {
    this.keyActivityForm.patchValue(this.data);
  }

  submitKeyActivity() {
    if (this.isAddKeyActivity) {
      this.addKeysetActivity();
    } else {
      this.updateKeysetActivity();
    }
  }

  private addKeysetActivity() {
    if (this.data?.keySetId) {
      if (this.keyActivityForm.valid) {
        const requestObj = {
          contact: this.keyActivityForm.controls['contact'].value,
          name: this.keyActivityForm.controls['name'].value,
          note: this.keyActivityForm.controls['note'].value,
          postDate: this.commonService.getFormatedDate(this.keyActivityForm.controls['postDate'].value),
          type: this.keyActivityForm.controls['activityType'].value,
          userId: this.keyActivityForm.controls['userId'].value
        }
        this.agentService.addKeysetActivity(this.data.keySetId, requestObj).subscribe(
          res => {
            this.modalController.dismiss('success');
          },
          error => {
            this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Create Key Set', 'error');
          }
        );
      } else {
        this.keyActivityForm.markAllAsTouched();
      }
    }
  }

  private updateKeysetActivity() {
    if (this.data?.keyLogId) {
      if (this.keyActivityForm.valid) {
        const requestObj = {
          contact: this.keyActivityForm.controls['contact'].value,
          name: this.keyActivityForm.controls['name'].value,
          note: this.keyActivityForm.controls['note'].value,
          postDate: this.commonService.getFormatedDate(this.keyActivityForm.controls['postDate'].value),
          userId: this.keyActivityForm.controls['userId'].value
        }
        this.agentService.updateKeysetActivity(this.data.keyLogId, requestObj).subscribe(
          res => {
            this.modalController.dismiss('success');
          },
          error => {
            this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Create Key Set', 'error');
          }
        );
      } else {
        this.keyActivityForm.markAllAsTouched();
      }
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
