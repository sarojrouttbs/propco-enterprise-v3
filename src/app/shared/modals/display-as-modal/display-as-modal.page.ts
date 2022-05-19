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
  salutation;
  addressee;
  surName;
  middleName;
  foreName;
  initials;
  title;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  
  constructor(
    private modalController: ModalController,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initLandlordForm();
  }

  initLandlordForm() {
    this.landlordDetailsForm = this.fb.group({
      title: [this.title ? this.getIndex(this.title) : '', [Validators.required]],
      initials: [this.initials ? this.initials : ''],
      forename: [this.foreName ? this.foreName : '', [Validators.required]],
      middleName: [this.middleName ? this.middleName : ''],
      surname: [this.surName ? this.surName : '', [Validators.required]],
      addressee: [this.addressee ? this.addressee : ''],
      salutation: [this.salutation ? this.salutation : ''],
      displayAs: [this.displayAs ? this.displayAs : '', Validators.required]
    });
  }

  getIndex(value){
        let index ;
       this.titles.forEach((item:any) => {
        if(item.value === value) {
          index= item.index
        }

       })
       return index;
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
