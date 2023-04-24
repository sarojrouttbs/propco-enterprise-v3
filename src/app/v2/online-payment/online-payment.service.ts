import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OnlinePaymentService {

  constructor(private httpClient: HttpClient) {
  }
  getServiceProviderPaymentConf(paymentServiceProvider: string, params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `payments/${paymentServiceProvider}/config`, { params }).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }
}
