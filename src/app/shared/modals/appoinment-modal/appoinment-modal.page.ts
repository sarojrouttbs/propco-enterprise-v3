import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-appoinment-modal',
  templateUrl: './appoinment-modal.page.html',
  styleUrls: ['./appoinment-modal.page.scss'],
})
export class AppoinmentModalPage implements OnInit {
  appoinmentForm: FormGroup;
  faultNotificationId;
  minDate;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService,
    private location: PlatformLocation,
    private router: Router) {

    this.router.events.subscribe((val) => {
      if (val) {
        this.dismiss();
      }
    });
    this.location.onPopState(() => this.dismiss());

  }

  ngOnInit() {
    this.appoinmentForm = this.formBuilder.group({
      dateTime: ['', Validators.required],
    });
    this.minDate = this.commonService.getFormatedDate(new Date(), 'yyyy-MM-dd');

  }

  saveContractorVisit() {
    if (this.appoinmentForm.valid) {
      const requestObj = this.appoinmentForm.value;
      requestObj.contractorPropertyVisitAt = this.commonService.getFormatedDate(requestObj.dateTime, 'yyyy-MM-dd HH:mm:ss');
      requestObj.isAccepted = true;
      requestObj.submittedByType = 'AGENT';
      this.faultsService.saveContractorVisit(this.faultNotificationId, requestObj).subscribe(res => {
        this.modalController.dismiss('success');
      }, error => {
        this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Yes, agreed Date/Time with Tenant', 'error');
      })
    } else {
      this.appoinmentForm.markAllAsTouched();
    }

  }

  dismiss() {
    this.modalController.dismiss();
  }

}
