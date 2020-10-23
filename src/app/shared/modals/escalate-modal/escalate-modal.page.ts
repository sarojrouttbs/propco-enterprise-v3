import { FaultsService } from './../../../faults/faults.service';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { PROPCO } from '../../constants';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-escalate-modal',
  templateUrl: './escalate-modal.page.html',
  styleUrls: ['./escalate-modal.page.scss'],
})
export class EscalateModalPage implements OnInit {

  heading: string;
  escalateForm: FormGroup;
  userDetails: any;
  faultId:string;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private faultsService: FaultsService
  ) {
  }

  ngOnInit() {
    this.userDetails = this.commonService.getItem(PROPCO.LOGIN_DETAILS, true);
    this.heading = this.navParams.get('heading');
    this.faultId = this.navParams.get('faultId');
    this.escalateForm = this.formBuilder.group({
      escalationReason: ['', Validators.required]
    });

  }

  escalateFault() {
    if (this.escalateForm.valid) {
      const requestObj = this.escalateForm.value;
      this.faultsService.escalateFault(this.faultId, requestObj).subscribe(res => {
        this.modalController.dismiss('success');
      }, err => {
        this.commonService.showMessage(err.message, 'Add Note', 'error');
      });
    } else {
      // this.commonService.showMessage('Please fill all the required fields.', 'Add Note', 'error');
      this.escalateForm.markAllAsTouched();
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
