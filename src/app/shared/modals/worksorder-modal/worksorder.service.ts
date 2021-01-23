import { environment } from './../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class WorksorderService {

  constructor(private httpClient: HttpClient) { }

  uploadFaultDocument(formData: FormData, faultId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/documents/upload`, formData);
  }

  uploadMaintDocument(formData: FormData, maintenanceId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `maintenance/${maintenanceId}/documents/upload`, formData);
  }

  saveWorksOrderCompletion(body: any, id, urlType = 'regular'): Observable<any> {
    let url = urlType === 'regular' ? `faults/notifications/${id}/response/wo-completion` : `faults/${id}/mark-job-completed`
    return this.httpClient.post(environment.API_BASE_URL + url, body);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }
}