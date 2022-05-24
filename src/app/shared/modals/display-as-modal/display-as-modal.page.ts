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
    this.patchData();
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
      displayAs: ['', Validators.required]
    });
  }

  patchData(){
    if(this.landlordData){      
      this.landlordDetailsForm.patchValue(this.landlordData);
    }
    
    
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

  onValueChange() {
    this.landlordDetailsForm.get('addressee').patchValue(this.landlordDetailsForm.value.title + ' ' + this.landlordDetailsForm.value.initials + ' ' + this.landlordDetailsForm.value.surname);
    this.landlordDetailsForm.get('salutation').patchValue(this.landlordDetailsForm.value.title + ' ' + this.landlordDetailsForm.value.surname);
    this.landlordDetailsForm.get('displayAs').patchValue(this.landlordDetailsForm.value.title + ' ' + this.landlordDetailsForm.value.forename + ' ' + this.landlordDetailsForm.value.surname);
  }
}
