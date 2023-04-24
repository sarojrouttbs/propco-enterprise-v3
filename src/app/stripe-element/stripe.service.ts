import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaymentIntent } from '@stripe/stripe-js';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeElementService {

  constructor(private httpClient: HttpClient) { }


  createPaymentIntent(params: any): Observable<PaymentIntent> {
    return this.httpClient.post<PaymentIntent>(
      environment.API_BASE_URL + `payments/stripe/create-payment-intent`, params
    );
  }

  getPaymentConfig(reqbody): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `payment-config`, reqbody, { observe: 'response' }).pipe
      (tap((res: any) => { }),
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
