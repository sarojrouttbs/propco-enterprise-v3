import { environment } from '../../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
@Injectable()
export class QuoteService {

  constructor(private httpClient: HttpClient) { }

  uploadFaultDocument(formData: FormData, faultId, contractorId): Observable<any> {
    let params = new HttpParams()
      .set('submittedByType', 'SECUR_USER')
      .set('contractorId', contractorId)
      .set('isDraft', 'false')
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/documents/upload`, formData, { params });
  }

  uploadMaintDocument(formData: FormData, maintenanceId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `maintenance/${maintenanceId}/documents/upload`, formData);
  }

  saveNotificationQuoteAmount(body: any, faultNotificationId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/notifications/${faultNotificationId}/response/quote-amount`, body);
  }

  deleteDocument(documentId): Observable<any> {
    return this.httpClient.delete(environment.API_BASE_URL + `faults/documents/${documentId}`, {});
  }

  saveQuoteAmount(requestObject: any, faultId: string): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/quote-amount`, requestObject);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }
}
