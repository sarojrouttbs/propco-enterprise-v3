import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { DATE_FORMAT } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-periodic-visit-modal',
  templateUrl: './periodic-visit-modal.page.html'
})
export class PeriodicVisitModalPage implements OnInit {
  DATE_FORMAT = DATE_FORMAT;
  propertyVisitTypes;
  inspectionStatuses;
  propertyId;
  visitData;
  action;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  visitForm: FormGroup

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private agentService: AgentService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.visitForm = this.formBuilder.group({
      visitType: ['', Validators.required],
      details: [''],
      contactName: [''],
      contactNumber: [''],
      status: ['', Validators.required],
      visitNumber: ['', Validators.required],
      dueDate: ['', Validators.required],
      bookedDate: [''],
      comments: [''],
      reportLink: ['']
    });

    if (this.action === 'edit' && this.visitData) {
      this.visitForm.patchValue(this.visitData);
      this.visitForm.get('dueDate').setValue(this.visitData.visitDate);
    }

  }

  save() {
    if (this.action === 'add')
      this.createPeriodicVisit();
    else
      this.updatePeriodicVisit();
  }

  createPeriodicVisit() {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }
    this.visitForm.value.dueDate = this.commonService.getFormatedDate(this.visitForm.value.dueDate);
    if (this.visitForm.value.bookedDate)
      this.visitForm.value.bookedDate = this.commonService.getFormatedDate(this.visitForm.value.bookedDate);
    this.agentService.createPeriodicVisit(this.propertyId, this.visitForm.value).subscribe((res) => {
      this.modalController.dismiss('success');
    }, (error) => {
      this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Periodic Visit', 'error');
    });
  }

  updatePeriodicVisit() {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }
    this.visitForm.value.dueDate = this.commonService.getFormatedDate(this.visitForm.value.dueDate);
    if (this.visitForm.value.bookedDate)
      this.visitForm.value.bookedDate = this.commonService.getFormatedDate(this.visitForm.value.bookedDate);
    this.agentService.updatePeriodicVisit(this.visitData.visitId, this.visitForm.value).subscribe((res) => {
      this.modalController.dismiss('success');
    }, (error) => {
      this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Periodic Visit', 'error');
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
