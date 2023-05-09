import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChangeSharerService {

  constructor(private httpClient: HttpClient) { }

  getPropertyTenancy(propertyId: string, params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenancies`, { params }).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  searchApplicant(text: string): Observable<any> {
    const params = new HttpParams().set('text', text).set('types', 'APPLICANT');
    return this.httpClient.get(environment.API_BASE_URL + `entities/search`, { params });
  }

  getApplicantCoApplicants(applicantId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `applicants/${applicantId}/co-applicants`);
  }

  changeSharer(agreementId: string, req: any): Observable<any> {
    return this.httpClient.post<any>(
      environment.API_BASE_URL + `agreements/${agreementId}/cos`, req
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }
}
