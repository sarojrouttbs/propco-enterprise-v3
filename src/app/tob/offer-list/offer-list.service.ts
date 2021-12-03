import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

interface Lookupdata {
  obj: Object;
}
@Injectable()
export class OfferListService {

  constructor(private httpClient: HttpClient) { }

  getPropertyById(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}`);
  }

  getOfferList(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/offers`);
  }

  getUserAccessRight(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `offers/access-rights`);
  }

  getTOBLookup(): Observable<Lookupdata> {
    return this.httpClient.get<Lookupdata>(environment.API_BASE_URL + 'lookup/tob', { responseType: 'json' });
  }

  deleteNote(noteId: number): Observable<any> {
    return this.httpClient.delete(environment.API_BASE_URL + `notes/${noteId}`, {});
  }
}
