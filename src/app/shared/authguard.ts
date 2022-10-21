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
    private authenticateSSO(url: string, ssoKey: string) {
        this.commonService.setItem(PROPCO.SSO_URL_ROUTE, url);
        this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
        return new Promise<boolean>((resolve) => {
            this.commonService.authenticateSsoToken(ssoKey).toPromise().then(response => {
                this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
                this.commonService.setItem(PROPCO.ACCESS_TOKEN, response.loginId);
                this.commonService.setItem(PROPCO.WEB_KEY, response.webKey);
                resolve(true);
            }, () => {
                /** Redirect to SSO auth fail page Eg:?ssoKey= {InvalidSSO or Server Error}*/
                this.router.navigate(['/sso-failure-page'], { replaceUrl: true });
            });
        });
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const accessToken = this.commonService.getItem(PROPCO.ACCESS_TOKEN);
        const webKey = this.commonService.getItem(PROPCO.WEB_KEY);
<<<<<<< Updated upstream
        const ssoRaw = encodeURIComponent(route.queryParams.ssoKey);
        const ssoKey = (ssoRaw && ssoRaw !== 'undefined') ? ssoRaw : null;
        const existingSso = this.commonService.getItem(PROPCO.SSO_KEY);
        if ((accessToken && webKey) && !ssoKey) {
=======
        let ssoKey = encodeURIComponent(route.queryParams.ssoKey);
        let oldSsoKey = this.commonService.getItem(PROPCO.SSO_KEY);
        if (accessToken && webKey && ssoKey == 'undefined') {
            ssoKey = oldSsoKey;
        }

        if (accessToken && webKey) {
>>>>>>> Stashed changes
            return true;
        }
        else if (this.commonService.getItem(PROPCO.PORTAL) && !ssoKey) {
            /** Portal */
            if (accessToken && webKey) {
                /** Auth check */
                return true;
            } else {
                /** Not logged in so redirect to login page */
                this.router.navigate(['/login'], { replaceUrl: true });
            }
        }
        else if (!this.commonService.getItem(PROPCO.PORTAL) && ssoKey) {
            /** Embeded */
            if (accessToken && webKey) {
                if (ssoKey === existingSso)
                    return true;
                else if (ssoKey !== existingSso) {
                    await this.authenticateSSO(state.url, ssoKey);
                    return true;
                }
            } else if (ssoKey) {
                /** SSO verification for First time */
                await this.authenticateSSO(state.url, ssoKey);
                return true;
            } else {
                this.router.navigate(['/sso-failure-page'], { replaceUrl: true });
            }
        } else {
            if (ssoRaw !== 'undefined') {
                /** Redirect to sso fail page if eg: ?ssoKey= */
                this.router.navigate(['/sso-failure-page'], { replaceUrl: true });
            } else {
                this.router.navigate(['/login'], { replaceUrl: true });
            }
        }
    }
}
