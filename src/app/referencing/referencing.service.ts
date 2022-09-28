import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReferencingService {

  constructor(private httpClient: HttpClient) { }

  getLookupData(referencingType: number): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/lookupdata`).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getApplicationList(referencingType: number, params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/applications`, { params }).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getProductList(referencingType: number): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/products`).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  createApplication(referencingType: number, requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `referencing/${referencingType}/application`, requestObj).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  createGuarantorApplication(referencingType: number, requestObj: any, applicationId: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `referencing/${referencingType}/applications/${applicationId}/guarantor`, requestObj).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getApplicationStatus(referencingType: number, applicationId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/applications/${applicationId}/status`).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getGuarantorApplicationList(referencingType: number, applicationId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/applications/${applicationId}/guarantors`).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  resendLinkToApplicant(referencingType: number, requestObj: any, applicationId: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `referencing/${referencingType}/applications/${applicationId}/resend-link`, requestObj).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getPropertyById(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}`).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getPropertyTenantList(propertyId: string, params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenantList`, { params }).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getPropertyTenancyList(propertyId: string, params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenancies`, { params }).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getTenantDetails(tenantId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}`).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  updateTenantDetails(tenantId: any, requestObj: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `tenants/${tenantId}`, requestObj).pipe(
    catchError(this.handleError<any>(''))
    );
  }

  getTenantGuarantorList(tenantId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}/guarantors`).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getGuarantorDetails(guarantorId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `guarantors/${guarantorId}`).pipe(
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
