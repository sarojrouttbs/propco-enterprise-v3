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
  landlordData;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };

  addressee;
  salutation;
  display;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initLandlordForm();
  }

  initLandlordForm() {
    this.landlordDetailsForm = this.fb.group({
      title: [this.landlordData && this.landlordData.title ? this.landlordData.title : '', [Validators.required]],
      initials: [this.landlordData && this.landlordData.initials ? this.landlordData.initials : ''],
      foreName: [this.landlordData && this.landlordData.foreName ? this.landlordData.foreName : '', [Validators.required]],
      middleName: [this.landlordData && this.landlordData.middleName ? this.landlordData.middleName : ''],
      surName: [this.landlordData && this.landlordData.surName ? this.landlordData.surName : '', [Validators.required]],
      addressee: [this.landlordData && this.landlordData.addressee ? this.landlordData.addressee : ''],
      salutation: [this.landlordData && this.landlordData.salutation ? this.landlordData.salutation : ''],
      displayAs: [this.landlordData && this.landlordData.displayAs ? this.landlordData.displayAs : '', Validators.required]
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

  onValueChange(){    
    this.landlordDetailsForm.get('addressee').patchValue(this.landlordDetailsForm.value.title + ' ' + this.landlordDetailsForm.value.initials + ' ' + this.landlordDetailsForm.value.surName);
    this.landlordDetailsForm.get('salutation').patchValue(this.landlordDetailsForm.value.title + ' ' + this.landlordDetailsForm.value.surName);
    this.landlordDetailsForm.get('displayAs').patchValue(this.landlordDetailsForm.value.title + ' ' + this.landlordDetailsForm.value.foreName + ' ' + this.landlordDetailsForm.value.surName);
  }
}
