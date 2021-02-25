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
        if(accessToken && webKey && ssoKey == 'undefined'){
            ssoKey = oldSsoKey;
        }

        if(accessToken && webKey && (oldSsoKey && ssoKey && oldSsoKey === ssoKey)){
            return true;
        }
        return new Promise<boolean>((resolve, reject) => {
            this.commonService.authenticateSsoToken(ssoKey).toPromise().then(response => {
                this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
                this.commonService.setItem(PROPCO.ACCESS_TOKEN, response.loginId);
                this.commonService.setItem(PROPCO.WEB_KEY, response.webKey);
                resolve(true);
            }, err => {
                // resolve(true);
                reject(false);
            });

        });
    }
}