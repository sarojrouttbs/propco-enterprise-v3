import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PROPCO } from '../shared/constants';
import { CommonService } from '../shared/services/common.service';

@Component({
  selector: 'app-sso-failure-page',
  templateUrl: './sso-failure-page.page.html'
})
export class SsoFailurePagePage implements OnInit {
  ssoKey: any;

  constructor(private router: Router, private commonService: CommonService) { }

  ngOnInit() {
    this.ssoKey = this.commonService.getItem(PROPCO.SSO_KEY);
  }

  async onRetry() {
    await this.authenticateSso();
  }

  private authenticateSso() {
    return new Promise((resolve) => {
      this.commonService.authenticateSsoToken(this.ssoKey).toPromise().then(response => {
        this.commonService.setItem(PROPCO.SSO_KEY, this.ssoKey);
        this.commonService.setItem(PROPCO.ACCESS_TOKEN, response.loginId);
        this.commonService.setItem(PROPCO.WEB_KEY, response.webKey);
        this.getUserDetailsPvt();
        resolve(true);
      }, (error) => {
        resolve(false);
      });
    });
  }

  private getUserDetailsPvt() {
    return new Promise((resolve) => {
      this.commonService.getUserDetailsPvt().toPromise().then(
        (res) => {
          if (res) {
            this.commonService.setItem(PROPCO.USER_DETAILS, res.data[0]);
            this.navigateToPage();
            resolve(true);
          }
        }, (error) => {
          resolve(false);
        }
      );
    });
  }

  private navigateToPage() {
    return new Promise((resolve) => {
      const navigateToRoute = this.commonService.getItem(PROPCO.SSO_URL_ROUTE);
      const navigateToRouteUrl = navigateToRoute.split('?')[0];
      resolve(true);
      this.router.navigate([navigateToRouteUrl], {queryParams: {ssoKey: this.ssoKey}});
    });
  }
}
