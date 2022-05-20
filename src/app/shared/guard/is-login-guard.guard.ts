import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PROPCO } from '../constants';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class IsLoginGuardGuard implements CanActivate {

  constructor(
    private router: Router,
    private commonService: CommonService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const accessToken = this.commonService.getItem(PROPCO.ACCESS_TOKEN);
    const webKey = this.commonService.getItem(PROPCO.WEB_KEY);
    if (accessToken && webKey) {
      this.router.navigate(['/agent/dashboard'], { replaceUrl: true });
      return false;
    } else {
      return true;
    }
  }

}
