import { FaultsService } from 'src/app/faults/faults.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-rejection-modal',
  templateUrl: './rejection-modal.page.html',
  styleUrls: ['./rejection-modal.page.scss'],
})
export class RejectionModalPage implements OnInit {
  rejectionForm: FormGroup;
  faultNotificationId;
  rejectionReason;
  faultMaintRejectionReasons
  constructor(private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private router: Router,
    private location: PlatformLocation,
    private faultsService: FaultsService) {
    this.router.events.subscribe((val) => {
      if (val) {
        this.dismiss();
      }
    });
    this.location.onPopState(() => this.dismiss());
  }

  ngOnInit() {
    this.rejectionForm = this.formBuilder.group({
      rejectionReason: ['', Validators.required],
      isAccepted: false,
      submittedById: '',
      submittedByType: 'SECUR_USER',
      other: '',
      landlordWantAnotherQuote: this.rejectionReason ? false : true
    });
    this.commonService.sortBy('index', this.faultMaintRejectionReasons)
  }

  saveFaultLLAuth() {
    let reqObj = JSON.parse(JSON.stringify(this.rejectionForm.value));
    if (reqObj.rejectionReason === 'Other') {
      if (reqObj.other) {
        reqObj.rejectionReason = reqObj.other;
      }
    }

    if (!this.rejectionForm.valid) { this.rejectionForm.markAllAsTouched(); return; }
    this.faultsService.saveFaultLLAuth(reqObj, this.faultNotificationId).subscribe(res => {
      this.modalController.dismiss('success');
    }, error => {
      this.commonService.showMessage('No Authorisation', 'Something went wrong', 'error');
    })
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
