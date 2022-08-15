import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BUILD_DETAILS, DATE_FORMAT, ERROR_MESSAGE, LOGIN_PAGE_TEXT_MESSAGES, PROPCO } from '../shared/constants';
import { ForgotPasswordModalPage } from '../shared/modals/forgot-password-modal/forgot-password-modal.page';
import { CommonService } from '../shared/services/common.service';
import { ValidationService } from '../shared/services/validation.service';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showLoader: boolean = false;
  domainList: any[] = [];

  slideOpts: any = {
    initialSlide: 1,
    speed: 600,
    autoplay: {
      delay: 5000
    }
  };

  sliderMsgList = LOGIN_PAGE_TEXT_MESSAGES;
  buildDetails = BUILD_DETAILS;
  currentDate = new Date();
  DATE_FORMAT = DATE_FORMAT;

  constructor(private _formBuilder: FormBuilder,
    private modalController: ModalController,
    private router: Router,
    private loginService: LoginService,
    private commonService: CommonService) { }

  ngOnInit() {
    this.initForm();
    this.initApi();
  }

  initForm() {
    this.loginForm = this._formBuilder.group({
      username: ['', [Validators.required, ValidationService.noWhitespaceValidator]],
      password: ['', [Validators.required, ValidationService.noWhitespaceValidator]],
      domainId: ['', Validators.required],
    });
  }

  private initApi() {
    this.getDomains();
  }

  private getDomains() {
    this.loginService.getDomains().subscribe((res) => {
      this.domainList = res && res.data ? res.data : [];
    }, error => {
      this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'DOMAINS', 'Error');
    });
  }

  onLoginSubmit() {
    this.loginService.authenticateUser(this.loginForm.value).subscribe((res) => {
      this.commonService.setItem(PROPCO.ACCESS_TOKEN, res.loginId);
      this.commonService.setItem(PROPCO.WEB_KEY, res.webKey);
      this.router.navigate(['/agent/dashboard'], { replaceUrl: true });
    }, error => {
      this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Login', 'Error');
    });
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
