import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ForgotPasswordModalPage } from '../shared/modals/forgot-password-modal/forgot-password-modal.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showLoader: boolean = false;

  constructor(private _formBuilder: FormBuilder, private modalController: ModalController, private router: Router) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]      
    });
  }

  onLoginSubmit() {
    this.router.navigate(['agent/dashboard'], { replaceUrl: true });
  }

  async forgotPassword() {
    const modal = await this.modalController.create({
      component: ForgotPasswordModalPage,
      cssClass: 'modal-container modal-height',
      componentProps: {
        heading: 'Forgot Password'
      },
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
      
    });
    await modal.present();
  }
}
