import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  createHmrc(requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `hmrc`, requestObj);
  }

  getBatchCount(batchId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `hmrc/${batchId}/count`);
  }

  getLastBatchDetails(batchId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `hmrc/${batchId}`);
  }

  getLandlordBatchCount(params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `hmrc/landlords/batch-count`, { params });
  }
}
