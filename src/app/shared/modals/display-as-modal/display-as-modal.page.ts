import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TITLES } from '../../constants';

@Component({
  selector: 'app-display-as-modal',
  templateUrl: './display-as-modal.page.html',
  styleUrls: ['./display-as-modal.page.scss'],
})
export class DisplayAsModalPage implements OnInit {

  landlordDetailsForm: FormGroup;
  titles = TITLES;
  displayAs;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initLandlordForm();
  }

  initLandlordForm() {
    this.landlordDetailsForm = this.fb.group({
      title: ['', [Validators.required]],
      initials: [''],
      forename: ['', [Validators.required]],
      middleName: [''],
      surname: ['', [Validators.required]],
      addressee: [''],
      salutation: [''],
      displayAs: [this.displayAs ? this.displayAs : '', Validators.required]
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  saveDisplayAs() {
    if (this.landlordDetailsForm.invalid) {
      this.landlordDetailsForm.markAllAsTouched();
      return;
    }
    this.modalController.dismiss({
      llInfo: this.landlordDetailsForm.value
    });
  }
}
