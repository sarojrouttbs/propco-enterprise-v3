import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.page.html',
  styleUrls: ['./appointment-modal.page.scss'],
})
export class AppointmentModalPage implements OnInit {
  appointmentForm: FormGroup;
  faultNotificationId;
  title;
  heading_one;
  heading_two;
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
    this.appointmentForm = this.formBuilder.group({
      dateTime: ['', Validators.required],
    });
    this.minDate = this.commonService.getFormatedDate(new Date(), 'yyyy-MM-dd');

  }

  saveContractorVisit() {
    if (this.appointmentForm.valid) {
      const requestObj = this.appointmentForm.value;
      requestObj.contractorPropertyVisitAt = this.commonService.getFormatedDate(requestObj.dateTime, 'yyyy-MM-dd HH:mm:ss');
      requestObj.isAccepted = true;
      requestObj.submittedByType = 'SECUR_USER';
      this.faultsService.saveContractorVisit(this.faultNotificationId, requestObj).subscribe(res => {
        this.modalController.dismiss('success');
      }, error => {
        this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Yes, agreed Date/Time with Tenant', 'error');
      })
    } else {
      this.appointmentForm.markAllAsTouched();
    }

  }

  dismiss() {
    this.modalController.dismiss();
  }

}
