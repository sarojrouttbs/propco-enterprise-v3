import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-change-gross',
  templateUrl: './change-gross.page.html',
  styleUrls: ['./change-gross.page.scss'],
})
export class ChangeGrossPage implements OnInit {

  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  form: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      gross: ['', Validators.required],
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
