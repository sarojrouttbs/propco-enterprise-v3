import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HmrcService {

  constructor(private httpClient: HttpClient) { }

  getLandlords(params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'hmrc/landlords', { params });
  }

  getSysconfig(params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'sysconfig', { params });
  }

  getOffices(params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'offices', { params });
  }

  getOfficesGroup(params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'offices-group', { params });
  }

  getOptions(params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `options`, { params });
  }

  getPdfUrlDetails(requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `hmrc/reports/download`, requestObj, { responseType: 'blob' as 'json' });
  }

  generateHMRC(requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `hmrc`, requestObj);
  }

  getBatchCount(batchId: string, params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `hmrc/${batchId}/count`, { params });
  }

  getHmrcBatchDetails(batchId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `hmrc/${batchId}`);
  }

  getLandlordBatchCount(params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `hmrc/landlords/batch-count`, { params });
  }

  downloadPdf(url: any): Observable<Blob> {
    return this.httpClient.get(url, { responseType: 'blob' });
  }

  getUserBatch(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `hmrc/user/batch`);
  }

  getCsv(batchId: string, params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `hmrc/${batchId}/download`, { responseType: 'blob', params: params }).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }

  getSummaryReportCsv(batchId: string, params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `hmrc/${batchId}/audit/download`, { responseType: 'blob', params: params }).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

}
