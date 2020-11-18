import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LetAllianceService {

  constructor(private httpClient: HttpClient) { }

  getLALookupData(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'referencing/3/lookupdata');
  }

  getLAApplicationList(params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'referencing/applications', { params });
  }

  getLAProducts(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'referencing/3/products');
  }
}
