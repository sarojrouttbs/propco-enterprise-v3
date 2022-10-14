import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-change-nett',
  templateUrl: './change-nett.page.html',
  styleUrls: ['./change-nett.page.scss'],
})
export class ChangeNettPage implements OnInit {
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
      nett: ['', Validators.required],
    });
  }

  closeModal() {
    if (this.form.valid)
      this.modalController.dismiss(this.form.value.nett);
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
