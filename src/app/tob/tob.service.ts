import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TobService {

  constructor(private httpClient: HttpClient) { }

  getPropertyDetails(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getNoDepositScheme(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'agents/nodeposit-scheme').pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getPropertyClauses(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/clauses`).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getPropertyRestrictions(propertyId: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/restrictions`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  createOffer(offerDetails: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + 'offers/create-offer', offerDetails).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  updateOffer(offerDetails: any, offerId: string): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `offers/${offerId}`, offerDetails).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  updateOfferStatus(offerId: string, status: number, body: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `offers/${offerId}/status/${status}`, body).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  searchApplicant(text: string): Observable<any> {
    let params = new HttpParams()
      .set('text', text)
      .set('types', 'APPLICANT')
    return this.httpClient.get(environment.API_BASE_URL + `entities/search`, { params });
  }

  getApplicantDetails(applicantId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `applicants/${applicantId}`);
  }

  updateApplicantDetails(applicantId: string, body: OfferModels.IApplicantDetails): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `applicants/${applicantId}`, body);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }

  getOfferList(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/offers`);
  }

  getUserAccessRight(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `offers/access-rights`);
  }

  getNotesList(offerId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `offers/${offerId}/notes`);
  }

  deleteNote(noteId: number): Observable<any> {
    return this.httpClient.delete(environment.API_BASE_URL + `notes/${noteId}`, {});
  }

  getOfferDetails(offerId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `offers/${offerId}`).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }
}
