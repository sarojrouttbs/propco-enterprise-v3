import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class NotesService {

  constructor(private httpClient: HttpClient) { }

  createFaultNotes(faultId: String, requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/notes`, requestObj);
  }

  createOfferNotes(offerId: String, requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `offers/${offerId}/notes`, requestObj);
  }

  updateOfferNotes(noteId: String, requestObj: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `notes/${noteId}`, requestObj);
  }

}
