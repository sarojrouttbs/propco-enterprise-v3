import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";


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
}
