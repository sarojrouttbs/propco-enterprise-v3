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
        const currentUser = this.commonService.checkAuthToken();
        const userDetails = this.commonService.getItem(PROPCO.LOGIN_DETAILS, true);
        if (currentUser) {
            // check if route is restricted by role
            if (route.data.roles && route.data.roles.indexOf(userDetails.role) === -1) {
                // role not authorised so redirect to home page
                this.router.navigate(['/page-not-found'], { replaceUrl: true });
                return false;
            }
            // authorised so return true
            return true;
        }
        // not logged in so redirect to login page with the return url
        this.commonService.setItem(PROPCO.PREVIOUS_URL, state.url);
        this.router.navigate(['/login'], { replaceUrl: true });
        return false;
    }
}