import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CommonService } from './services/common.service';
import { PROPCO } from './constants';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private commonService: CommonService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const accessToken = this.commonService.getItem(PROPCO.ACCESS_TOKEN);
        const webKey = this.commonService.getItem(PROPCO.WEB_KEY);
        let ssoKey = encodeURIComponent(route.queryParams.ssoKey);
        let oldSsoKey = this.commonService.getItem(PROPCO.SSO_KEY);
        if (accessToken && webKey && ssoKey == 'undefined') {
            ssoKey = oldSsoKey;
        }

        if (accessToken && webKey && (ssoKey && ssoKey !== oldSsoKey)) {
            return true;
        } else {
            if (ssoKey && ssoKey !== 'undefined') {
                this.commonService.setItem(PROPCO.SSO_URL_ROUTE, state.url);
                this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
                return new Promise<boolean>((resolve, reject) => {
                    this.commonService.authenticateSsoToken(ssoKey).toPromise().then(response => {
                        this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
                        this.commonService.setItem(PROPCO.ACCESS_TOKEN, response.loginId);
                        this.commonService.setItem(PROPCO.WEB_KEY, response.webKey);
                        resolve(true);
                    }, err => {
                        this.router.navigate(['/sso-failure-page'], { replaceUrl: true });
                    });
                });
            } else {
                // not logged in so redirect to login page
                this.router.navigate(['/login'], { replaceUrl: true });
            }
        }
    }
}
