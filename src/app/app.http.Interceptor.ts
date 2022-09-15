import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { PROPCO } from './shared/constants';
import { CommonService } from './shared/services/common.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppHttpInterceptor implements HttpInterceptor {
  private totalRequests = 0;

  constructor(private _commonService: CommonService, private _router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // this.totalRequests = 0;
    //if (!req.url.includes('applicant/search')) {
    //this._commonService.showLoader();
    //}

    if (this._commonService.isInternetConnected()) {
      const accessToken = window.localStorage.getItem(PROPCO.ACCESS_TOKEN);
      const webKey = window.localStorage.getItem(PROPCO.WEB_KEY);


      let requestHeader = req.headers;
      requestHeader = requestHeader.set('X-XSRF-TOKEN', this._commonService.getCookie('XSRF-TOKEN'));
      /* add web key */
      if (webKey) {
        requestHeader = req.headers.set('X-WEB-KEY', webKey);
      }
      if (accessToken) {
        requestHeader = requestHeader.set('X-AUTH-KEY', accessToken);
      }

      const authReq = req.clone({ headers: requestHeader });
      this.totalRequests++;
      // if (this.totalRequests === 1) {
      let hideLoader = req.params.get('hideLoader');
      if (!hideLoader) {
        this._commonService.showLoader();
      }

      // }
      return next.handle(authReq).pipe(catchError((error: HttpErrorResponse) => {        
        this._commonService.hideLoader();
        if(error.url.includes('hmrc')) {
          return throwError(error);
        }
        
        if (error.status === 404 || error.status === 502 || error.status === 503 || error.status === 500) {
          this._commonService.showMessage('Something went wrong on server, please try again.', 'Service Unavailable', 'error');
          return throwError(error);
        }
        else if (error.status === 400 || error.status === 412) {
          this._commonService.showMessage(error.error ? error.error.message : 'Something went wrong', error.error.errorCode, 'error');
          return throwError(error);
        } else if (error.status === 401) {
          if (error) {
            let errorMessage = (error.error && error.error.message) ? error.error.message : 'Your session has expired, please login again.';
            this._commonService.showMessage(errorMessage, 'Unauthorized', 'error');
            this._commonService.removeItem(PROPCO.ACCESS_TOKEN);
            this._commonService.removeItem(PROPCO.LOGIN_DETAILS);
            this._commonService.removeItem(PROPCO.USER_DETAILS);
            this._commonService.removeItem(PROPCO.LOOKUP_DATA);
            this._router.navigate(['/login'], { replaceUrl: true });
            return throwError(error);
          }
        } else if (error.status === 422 || error.status === 451) {
          return throwError(error);
        } else {
          if (error.status === 405 || error.status === 403 || error.status === 423) {
            return throwError(error);
          }

          if (!error.error.message) {
            this._commonService.showMessage('Something went wrong on server, please try again.', 'Service Unavailable', 'error');
          }
        }
      }), finalize(() => {
        this.totalRequests--;
        if (this.totalRequests == 0) {
          this._commonService.hideLoader();
        }
      })) as any;

    } else {
      this._commonService.hideLoader();
      this._commonService.showMessage('No internet connection, please change settings or try again.', 'Network Unavailable', 'error');
      return throwError(null);
    }

  }
}
