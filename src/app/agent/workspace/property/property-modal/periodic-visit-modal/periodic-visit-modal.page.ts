import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-periodic-visit-modal',
  templateUrl: './periodic-visit-modal.page.html',
  styleUrls: ['./periodic-visit-modal.page.scss'],
})
export class PeriodicVisitModalPage implements OnInit {

  propertyVisitTypes;
  inspectionStatuses;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  visitForm: FormGroup

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.visitForm = this.formBuilder.group({
      visitType: [''],
      details: [''],
      contactName: [''],
      contactNumber: [''],
      status: [''],
      visitNumber: [''],
      dueDate: [''],
      bookedDate: [''],
      comments: [''],
      reportLink: ['']
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
