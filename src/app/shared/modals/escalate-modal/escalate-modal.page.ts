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
  unSavedData = false;
  showLoader = false;

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
    this.showLoader = true;
    if (this.escalateForm.valid) {
      const requestObj = this.escalateForm.value;
      this.faultsService.escalateFault(this.faultId, requestObj).subscribe(res => {
        this.showLoader = false;
        this.modalController.dismiss('success');
      }, err => {
        this.showLoader = false;
        this.commonService.showMessage(err.message, 'Add Note', 'error');
      });
    } else {
      this.showLoader = false;
      // this.commonService.showMessage('Please fill all the required fields.', 'Add Note', 'error');
      this.escalateForm.markAllAsTouched();
    }
  }

  async onCancel() {
    if(this.escalateForm.value.escalationReason || this.escalateForm.value.escalationReason){
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
