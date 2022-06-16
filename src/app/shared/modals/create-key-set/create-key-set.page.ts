import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-create-key-set',
  templateUrl: './create-key-set.page.html',
  styleUrls: ['./create-key-set.page.scss'],
})
export class CreateKeySetPage implements OnInit {
  createKeysetForm: FormGroup;
  userDetailsList;
  keyStatuses;
  propertyId;
  loggedInUserId;

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
  }

  private initForm() {
    this.createKeysetForm = this.formBuilder.group({
      name: '',
      keyId: '',
      type: '',
      postDate: [ new Date(), Validators.required],
      userId: [this.loggedInUserId, Validators.required],
      status: [0, Validators.required],
      note: ''
    });
  }

  createNewKeyset() {
    if (this.createKeysetForm.valid) {
      const requestObj = this.createKeysetForm.value;
      requestObj.postDate = this.commonService.getFormatedDate(requestObj.postDate);
      this.agentService.createKeyset(this.propertyId, requestObj).subscribe(
        res => {
          this.modalController.dismiss('success');
        },
        error => {
          this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Create Key Set', 'error');
        }
      );
    } else {
      this.createKeysetForm.markAllAsTouched();
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
