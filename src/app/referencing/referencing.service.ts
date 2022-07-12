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

  getLookupData(referencingType: number): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/lookupdata`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getApplicationList(referencingType: number, params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/applications`, { params }).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getProductList(referencingType: number): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/products`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  createApplication(referencingType: number, requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `referencing/${referencingType}/application`, requestObj).pipe(tap((res: any) => { }),
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

  getGuarantorApplicationList(referencingType: number, applicationId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `referencing/${referencingType}/applications/${applicationId}/guarantors`).pipe(tap((res: any) => { }),
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

  getPropertyTenantList(propertyId: string, params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenantList`, { params }).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getPropertyTenancyList(propertyId: string, params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenancies`, { params }).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getTenantDetails(tenantId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  updateTenantDetails(tenantId: any, requestObj: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `tenants/${tenantId}`, requestObj).pipe(tap((res: any) => { }),
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
