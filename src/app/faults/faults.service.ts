import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';

@Injectable()
export class FaultsService {

  constructor(private httpClient: HttpClient) { }

  getAllFaults(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'faults/list');
  }

  getFaultNotes(faultId: String): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/notes`);
  }

}
