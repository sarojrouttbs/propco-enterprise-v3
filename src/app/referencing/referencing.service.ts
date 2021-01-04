import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReferencingService {

  constructor(private httpClient: HttpClient) { }

  getLALookupData(referencingType: number): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/lookupdata`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getLAApplicationList(referencingType: number, params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/applications`, { params }).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  searchApplicationByText(referencingType: number, text: string): Observable<any> {
    let params = new HttpParams()
        .set('limit', '10')
        .set('page', '1')
        .set('text', text)
        .set('types', 'APPLICATION');

    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/applications`, { params });
  }

  getLAProductList(referencingType: number): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/products`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  createGuarantorApplication(referencingType: number, requestObj: any, applicationId: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `referencing/${referencingType}/applications/${applicationId}/guarantor`, requestObj).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getApplicationStatus(referencingType: number, applicationId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/applications/${applicationId}/status`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getGuarantorApplicationList(referencingType: number, applicationId: any, params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/applications/${applicationId}/guarantors`, { params }).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  createApplication(referencingType: number, requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `referencing/${referencingType}/application`, requestObj).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  resendLinkToApplicant(referencingType: number, requestObj: any, applicationId: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `referencing/${referencingType}/applications/${applicationId}/resend-link`, requestObj).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getPropertyById(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getPropertyTenantList(propertyId: string, agreementStatus?: string): Observable<any> {
    const params = new HttpParams()
      .set('agreementStatus', agreementStatus ? agreementStatus : '');
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenants`, { params }).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getPropertyTenancyList(propertyId: string): Observable<any> {
    const params = new HttpParams()
      .append('status', '1')
      .append('status', '2')
      .append('status', '5')
      .append('status', '6');
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenancies`, { params }).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getTenantDetails(tenantId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getTenantGuarantorList(tenantId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}/guarantors`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getGuarantorDetails(guarantorId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `guarantors/${guarantorId}`).pipe(tap((res: any) => { }),
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
