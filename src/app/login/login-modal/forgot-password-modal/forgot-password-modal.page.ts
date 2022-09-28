import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'app-forgot-password-modal',
  templateUrl: './forgot-password-modal.page.html',
  styleUrls: ['./forgot-password-modal.page.scss'],
})
export class ForgotPasswordModalPage {
  heading;
  email = new FormControl('', [Validators.required, ValidationService.emailValidator]);
  constructor(private modalController: ModalController) { }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  submit() {

  }

}
