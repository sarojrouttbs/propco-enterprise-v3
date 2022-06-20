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

  submitApplication(applicationId: string, data: object): Observable<any> {
    return this.httpClient.put<any>(environment.API_BASE_URL + `applications/${applicationId}/submit`, data).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  updateApplicationDetails(applicationDetails: object, applicationId: string): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `applications/${applicationId}`, applicationDetails).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getApplicantCoApplicants(applicantId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `applicants/${applicantId}/co-applicants`);
  }

  updateLead(data: object, applicationId: string, applicationApplicantId: string): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `applications/${applicationId}/applicants/${applicationApplicantId}`, data).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  createApplication(body: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `applications/create-application`, body).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getApplicationDetails(applicationId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `applications/${applicationId}`);
  }

  addApplicantToApplication(applicationId: string, body: any, isLeadApplicant: any) {
    const params = new HttpParams().set('isLeadApplicant', isLeadApplicant);
    return this.httpClient.post(environment.API_BASE_URL + `applications/${applicationId}/applicants`, body,  {params}).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getApplicationApplicants(applicationId: any) {
    return this.httpClient.get(environment.API_BASE_URL + `applications/${applicationId}/applicants`).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  deleteApplicationApplicant(applicationId: string, applicantId: string, body) {
    return this.httpClient.delete(environment.API_BASE_URL + `applications/${applicationId}/applicants/${applicantId}`, body);
  }

  linkApplicantToApplication(applicationId: string, body: any, applicantId, isLeadApplicant: any) {
    const params = new HttpParams().set('isLeadApplicant', isLeadApplicant);
    return this.httpClient.post(environment.API_BASE_URL + `applications/${applicationId}/applicants/${applicantId}`, body , {params}).pipe(tap((res: any) => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getPropertyDetails(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tob`).pipe(tap((res: any) => { }),
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
    const params = new HttpParams().set('text', text).set('types', 'APPLICANT');
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

  getApplicationList(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/applications`);
  }

  getApplicantQuestions(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'applications/applicant-questions').pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getApplicationQuestionsAnswer(applicationId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `applications/${applicationId}/questions`).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  updateApplicationQuestionAnswer(applicationId, questionId, questionDetails): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `applications/${applicationId}/questions/${questionId}`, questionDetails).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getApplicantBankDetails(applicantId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `applicants/${applicantId}/banking-details`).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  updateBankDetails(applicantId: string, bankDetails: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `applicants/${applicantId}/banking-details`, bankDetails).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getTenantGuarantors(applicantId: string): Observable<any> {
    return this.httpClient.get<any>(environment.API_BASE_URL + `tenants/${applicantId}/guarantors`).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getApplicantGuarantors(applicantId: string): Observable<any> {
    return this.httpClient.get<any>(environment.API_BASE_URL + `applicants/${applicantId}/guarantors`).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getTenantBankDetails(applicantId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${applicantId}/banking-details`).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  updateGuarantorDetails(guarantorDetails: any, guarantorId: string): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `applicants/guarantors/${guarantorId}`, guarantorDetails).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  createGuarantor(guarantorDetails: any, applicantId: string): Observable<any> {
    return this.httpClient.post<any>(environment.API_BASE_URL + `applicants/${applicantId}/guarantors`, guarantorDetails).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  getTermsAndConditions() {
    return this.httpClient.get(environment.API_BASE_URL + 'terms-and-conditions');
  }

  updateApplicationStatus(applicationId: string, status: number, body: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `applications/${applicationId}/status/${status}`, body).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  rejectAllApplication(body: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `applications/reject`, body).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  processPayment(paymentDetails, applicationId): Observable<any> {
    return this.httpClient.post<any>(environment.API_BASE_URL + `applications/${applicationId}/process-payment`, paymentDetails).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }

  proposeTenancy(paymentDetails, propertyId): Observable<any> {
    return this.httpClient.post<any>(environment.API_BASE_URL + `properties/${propertyId}/propose-tenancy`, paymentDetails).pipe(
      tap(() => { }),
      catchError(this.handleError<any>(''))
    );
  }
}
