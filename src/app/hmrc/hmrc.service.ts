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

  getOffices(params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'hmrc/offices', { params });
  }

  getOfficesGroup(params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'hmrc/offices/group', { params });
  }

  getOptions(params): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `agent-options`, { params });
  }
}
