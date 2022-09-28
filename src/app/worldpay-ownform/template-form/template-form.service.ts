import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TemplateFormService {

  constructor(private httpClient: HttpClient) { }

  getWorldpayClientKey(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'worldpay/clientkey').pipe(
      catchError(this.handleError<any>(''))
    );
  }

  payAndProposeTenancy(propertyId, reqBody): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `properties/${propertyId}/pay-and-propose-tenancy`, reqBody).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  processWorpayPayment(reqBody): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `payments/worldpay/process`, reqBody).pipe(
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
