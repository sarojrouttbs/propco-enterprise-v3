import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NegotiateService {

  constructor(private httpClient: HttpClient) { }

  getRestrictionNegotiationComments(offerRestrictionId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'offers/restrictions/' + offerRestrictionId + '/comments').pipe(
      catchError(this.handleError<any>(''))
    );
  }

  saveCommentsAgainstRestriction(offerRestrictionId, restrictionComments: any[]): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + 'offers/restrictions/' + offerRestrictionId + '/comments',
      restrictionComments).pipe(
        catchError(this.handleError<any>(''))
      );
  }

  getClauseNegotiationComments(offerClauseId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'offers/clauses/' + offerClauseId + '/comments').pipe(
      catchError(this.handleError<any>(''))
    );
  }

  saveCommentsAgainstClause(offerClauseId, clauseComments: any[]): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + 'offers/clauses/' + offerClauseId + '/comments', clauseComments).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }
}
