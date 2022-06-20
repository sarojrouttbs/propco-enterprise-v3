import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HodlingDepositePaidService {

  constructor(private httpClient: HttpClient) { }

  offlinePaymentService(applicationId: string, body: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `applications/${applicationId}/offline-payment`, body).pipe(
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
