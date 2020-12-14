import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LetAllianceService {

  constructor(private httpClient: HttpClient) { }

  getLALookupData(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'referencing/3/lookupdata');
  }

  getLAApplicationList(params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'referencing/3/applications', { params });
  }

  /* getApplicationNotes(applicationId: any): Observable<any> {

    return {};
    //return this.httpClient.get(environment.API_BASE_URL + 'referencing/3/applications', { params });
  } */

  getLAProductList(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'referencing/3/products');
  }

  getPropertyById(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}`);
  }

  getPropertyTenantList(propertyId: string, agreementStatus?: string): Observable<any> {
    const params = new HttpParams()
      .set('agreementStatus', agreementStatus ? agreementStatus : '');
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenants`, { params });
  }

  getPropertyTenancyList(propertyId: string): Observable<any> {
    const params = new HttpParams()
      .append('status', '1')
      .append('status', '2')
      .append('status', '5')
      .append('status', '6');
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenancies`, { params });
  }

  getTenantDetails(tenantId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  createApplication(requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `referencing/3/application`, requestObj);
  }

  resendLinkToApplicant(requestObj: any, applicationId: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `referencing/3/applications/${applicationId}/resend-link`, requestObj);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }
}
