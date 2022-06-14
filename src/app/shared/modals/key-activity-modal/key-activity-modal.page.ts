import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-key-activity-modal',
  templateUrl: './key-activity-modal.page.html',
  styleUrls: ['./key-activity-modal.page.scss'],
})
export class KeyActivityModalPage implements OnInit {
  isAddKeyActivity;
  data;
  keyActivities;
  activityType;
  keyActivityForm: FormGroup;
  userDetailsList;
  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    console.log('data', this.activityType, this.data)
    this.initData();
  }

  private initData() {
    this.initForm();
    if (!this.isAddKeyActivity) {
      this.patchActivityValue();
    } else {
      this.keyActivityForm.get('activityType').setValue(this.activityType);
      this.keyActivityForm.get('postDate').setValue(new Date);
    }
  }

  private initForm() {
    this.keyActivityForm = this.formBuilder.group({
      activityType: [{ value: '', disabled: true }, Validators.required],
      name: [''],
      contact: [''],
      userId: ['', Validators.required],
      postDate: [''],
      note: ['']
    });
  }

  private patchActivityValue() {
    this.keyActivityForm.patchValue(this.data);
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
