import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenancies`);
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
    let params = new HttpParams().set('submittedByType', 'SECUR_USER');
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/documents/upload`, formData, { params });
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
    let params = new HttpParams()
      .set('limit', '10')
      .set('page', '1')
      .set('text', text)
      .set('types', 'CONTRACTOR')
      .set('con.statusId', '1');

    if(skillSet){
      params.set('con.ocp', skillSet)
    }
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
    let reqBody = {} as any;
    reqBody.submittedByType = 'SECUR_USER';
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/status/${status}`, reqBody);
  }

  startProgress(faultId: string): Observable<any> {
    let reqBody = {} as any;
    reqBody.submittedByType = 'SECUR_USER';
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/start-progress`, reqBody);
  }

  getFaultDocuments(faultId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/documents`);
  }

  downloadDocument(documentId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `documents/${documentId}/download`,
      { responseType: 'arraybuffer' }).pipe(
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
    const params: any = new HttpParams().set('isResponseExpected', 'true');
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/notifications`, { params });
  }

  getContractorDetails(contractorId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `contractors/${contractorId}`);
  }

  updateNotification(faultNotificationId, notificationObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response`, notificationObj);
  }

  saveContractorVisit(faultNotificationId, notificationObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response/quote/contractor-visit`, notificationObj);
  }

  raiseQuote(data, faultId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/maintenance`, data);
  }

  getQuoteDetails(faultId, params): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/maintenance`, { params });
  }

  updateFaultQuoteContractor(data, maintenanceId): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `maintenance/quote/${maintenanceId}/contractors`, data);
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
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}`).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getaccessibleOffices(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `accessible-offices`).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getManagementTypes(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `management-types`).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  getAssignedUsers(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `accessible-users`).pipe(
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
    return this.httpClient.get(environment.API_BASE_URL + `nominal-codes`).pipe(
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
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response/wo/contractor-visit`, notificationObj);
  }

  getWorksOrderPaymentRules(faultId: string, contractorId?: string, repairCost?: any) {
    let params = new HttpParams().set('contractorId', contractorId)
    .set('repairCost', repairCost);
    if (contractorId == null && contractorId == undefined) {
      params = params.delete('contractorId')
    }
    if (repairCost == null && repairCost == undefined) {
      params = params.delete('repairCost')
    }
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/check-payment-rules`, { params });
  }

  issueWorksOrderContractor(faultId: string, requestObj) {
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

  modifyContractorVisit(faultId, notificationObj): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/quote/contractor-visit`, notificationObj);
  }

  modifyWoContractorVisit(faultId, notificationObj): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/wo/contractor-visit`, notificationObj);
  }

  saveFaultDetails(faultId, data): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/save`, data);
  }

  downloadFaultDocument(documentId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/documents/${documentId}/download`, { responseType: 'blob' as 'json' });
  }

  getFaultCounts(params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'faults/count/bucket', { params });
  }

  isWorksOrderPaymentRequired(rules: FaultModels.IFaultWorksorderRules): boolean {
    let paymentNeeded = false;
    if (rules && rules.hasOwnProperty('hasSufficientReserveBalance')) {
      if (rules.hasSufficientReserveBalance === true) {
        paymentNeeded = false;
      } else {
        if (rules.hasOtherInvoicesToBePaid === true) {
          paymentNeeded = true;
        }
        else if (rules.hasRentArrears === true) {
          paymentNeeded = true;
        }
        else if (rules.hasRentPaidUpFront === true) {
          paymentNeeded = true;
        }
        else if (rules.hasTenantPaidRentOnTime === false) {
          paymentNeeded = true;
        }
        else if (rules.isFaultEstimateLessThanHalfRentOrThresHoldValue === false) {
          paymentNeeded = true;
        }
        else if (rules.isTenancyGivenNoticeOrInLastMonth === true) {
          paymentNeeded = true;
        }
      }
    }
    return paymentNeeded;
  }

  getFaultEvents(faultId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/events`);
  }

  saveSnoozeFaultData(body: any, faultId): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `faults/${faultId}/snooze`, body);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }

}
