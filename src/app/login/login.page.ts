import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { LOGIN_PAGE_TEXT_MESSAGES } from '../shared/constants';
import { ForgotPasswordModalPage } from '../shared/modals/forgot-password-modal/forgot-password-modal.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showLoader: boolean = false;
  domainList: any[] = [
    {
      index: 1,
      value: 'Live'
    },
    {
      index: 2,
      value: 'Test'
    }
  ];

  slideOpts: any = {
    initialSlide: 1,
    speed: 600,
    autoplay: true
  };

  sliderMsg = LOGIN_PAGE_TEXT_MESSAGES;

  constructor(private _formBuilder: FormBuilder, private modalController: ModalController, private router: Router) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      domain: ['', Validators.required], 
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
