import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from './../../environments/environment';

@Injectable()
export class FaultsService {

  constructor(private httpClient: HttpClient) { }

  getAllFaults(params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'faults/list', { params });
  }

  getFaultNotes(faultId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/notes`);
  }

  getPropertyById(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}`);
  }

  getPropertyTenancies(propertyId: string): Observable<any> {
    const params = new HttpParams()
      .append('status', '1')
      .append('status', '2')
      .append('status', '5')
      .append('status', '6');
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenancies`, { params });
  }

  getPropertyTenants(propertyId: string, agreementId?: string): Observable<any> {
    const params = new HttpParams()
      .set('agreementId', agreementId ? agreementId : '');
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenants`, { params });
  }

  getHMOLicenceDetailsAgainstProperty(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/hmo`);
  }

  getFaultAdditionalInfo(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/additional-info`);
  }

  uploadDocument(formData: FormData, faultId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/documents/upload`, formData);
  }

  escalateFault(faultId, requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/escalation`, requestObj);
  }

  deEscalateFault(faultId, requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/de-escalation`, requestObj);
  }

  getLandlordsOfProperty(propertyId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/landlords`);
  }

  getTenantGuarantors(tenantId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}/guarantors`);
  }

  createFault(requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/create`, requestObj);
  }

  searchContractor(text: string, skillSet = ''): Observable<any> {
    const params = new HttpParams()
      .set('limit', '10')
      .set('page', '1')
      .set('text', text)
      .set('types', 'CONTRACTOR')
      .set('con.ocp', skillSet)
    return this.httpClient.get(environment.API_BASE_URL + `entities/search`, { params });
  }

  getTenantArrearsDetails(tenantId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}/arrears`);
  }

  getFaultDetails(faultId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}`);
  }

  getFaultHistory(faultId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/history`);
  }

  addAdditionalInfo(faultId, requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/additional-info`, requestObj);
  }

  deleteAdditionalInfo(id): Observable<any> {
    return this.httpClient.delete(environment.API_BASE_URL + `faults/additional-info/${id}`, {});
  }

  updateAdditionalInfo(id, requestObj): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/additional-info/${id}`, requestObj);
  }

  updateFaultStatus(faultId: string, status: number): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/status/${status}`, {});
  }

  startProgress(faultId: string): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/start-progress`, {});
  }

  getFaultDocuments(faultId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/documents`);
  }

  downloadDocument(documentId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `documents/${documentId}/download`,
      { responseType: 'arraybuffer' }).pipe(tap((res: any) => { }),
        catchError(this.handleError<any>(''))
      );
  }

  updateFault(faultId: string, requestObj: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/details`, requestObj);
  }

  getLandlordDetails(landlordId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `landlords/${landlordId}`);
  }

  getPreferredSuppliers(landlordId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `landlords/${landlordId}/preferred-contractors`);
  }

  getFaultNotifications(faultId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/notifications`);
  }

  getContractorDetails(contractorId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `contractors/${contractorId}`);
  }

  updateNotification(faultNotificationId, notificationObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response`, notificationObj);
  }

  saveContractorVisit(faultNotificationId, notificationObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response/contractor-visit`, notificationObj);
  }

  raiseQuote(data, faultId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/maintenance`, data);
  }

  getQuoteDetails(faultId): Observable<any> {
    // const params = new HttpParams().set('type', 'quote');
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/maintenance`);
  }

  updateFaultQuoteContractor(data, faultId, maintenanceId): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/maintenance/${maintenanceId}`, data);
  }

  updateQuoteDetails(data, maintenanceId): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `maintenance/${maintenanceId}`, data);
  }

  addContractors(maintenanceId, requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `maintenance/quote/${maintenanceId}/contractors`, requestObj);
  }

  deleteContractor(maintenanceId, contractorId): Observable<any> {
    return this.httpClient.delete(environment.API_BASE_URL + `maintenance/quote/${maintenanceId}/contractors/${contractorId}`);
  }

  getUserDetails(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `user/logged-in`);
  }

  getTenantDetails(tenantId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getaccessibleOffices(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `accessible-offices`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getMgntServiceType(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `management-types`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getAssignedUsers(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `accessible-users`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  saveNotificationQuoteAmount(body: any, faultNotificationId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response/quote-amount`, body);
  }

  deleteDocument(documentId): Observable<any> {
    return this.httpClient.delete(environment.API_BASE_URL + `faults/documents/${documentId}`, {});
  }

  getNominalCodes(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `nominal-codes`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }
  
  saveFaultLLAuth(body: any, faultNotificationId: string): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response/quote-auth`, body);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }

}
