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
    const activeTenancyStatuses = [2, 5, 6];
    const params = new HttpParams()
      .set('status', activeTenancyStatuses.toString());
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
      .set('con.status', 'Active')
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

  getLandlordDppDetails(landlordId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `landlords/${landlordId}/preference/dpp`);
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

  getManagementTypes(): Observable<any> {
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

  savePaymentReceived(faultNotificationId, body: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response/payment-received`, body);
  }

  saveProceedWithoutPrePayment(faultNotificationId, body: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response/proceed-without-prepayment`, body);
  }

  getOfficeDetails(office): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `offices/${office}`);
  }

  updateWOContractorVisit(faultNotificationId, notificationObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response/wo-contractor-visit`, notificationObj);
  }

  getWorksOrderPaymentRules(faultId: string) {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/check-payment-rules`);
  }

  issueWorksOrderoContractor(faultId: string, requestObj) {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/issue-wo`, requestObj);
  }

  sendLandlordPaymentRequest(faultId: string) {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/ll-payment-request`, {});
  }

  createFaultMaintenaceWorksOrder(data, faultId: string) {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/worksorder`, data);
  }

  saveOwnContractor(faultId, requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/ll-own-contractor`, requestObj);
  }

  markJobComplete(faultId, requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/mark-job-completed`, requestObj);
  }

  fetchPendingNotification(faultId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/pending-notification`);
  }

  forwardNotification(notificationHistoryId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${notificationHistoryId}/forward`, {});
  }

  closeFault(faultId, requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/close`, requestObj);
  }

  fetchAgreementsClauses(agreementId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `agreements/${agreementId}/clauses`);
  }

  saveWorksOrderCompletion(body: any, faultNotificationId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response/wo-completion`, body);
  }

  pmRejectApproveInvoice(body: any, faultId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/pm-approve-reject-invoice`, body);
  }

  getSystemOptions(params: any) {
    return this.httpClient.get(environment.API_BASE_URL + `options`, { params });
  }

  invoiceUploaded(faultId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/invoice-uploaded`, {});
  }

  fetchPropertyCertificates(propertyId, params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/certificates`, { params });
  }

  getPropertyHeadLease(propertyId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/headlease-management`);
  }

  mergeFaults(body: any, faultId): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/merge`, body);
  }

  requestInfo(faultId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/request-info`, {});
  }

  resendFaultNotification(faultNotificationId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/resend`, {});
  }

  modifyContractorVisit(faultNotificationId, notificationObj): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultNotificationId}/quote/contractor-visit`, notificationObj);
  }

  modifyWoContractorVisit(faultNotificationId, notificationObj): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultNotificationId}/wo/contractor-visit`, notificationObj);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }

}
