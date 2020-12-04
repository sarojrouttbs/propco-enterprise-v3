import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.page.html',
  styleUrls: ['./address-modal.page.scss'],
})
export class AddressModalPage implements OnInit {
  addressDetails: FormGroup;
  constructor(
    private fb: FormBuilder,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.addressDetails = this.fb.group({
      postCode: ['', Validators.required],
      organisation: ['', Validators.required],
      buildingName: ['', Validators.required],
      buildingNumber: ['', Validators.required],
      street: ['', Validators.required],
      address1: ['', Validators.required],
      address2: ['', Validators.required]
    });
  }

  saveAddress(){}

  lookupAddress(){}

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }
}