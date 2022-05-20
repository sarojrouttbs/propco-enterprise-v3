import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,Subject } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MarketAppraisalService {

  constructor(private httpClient: HttpClient) { }


  private landlordChange = new Subject<any>();
  landlordChange$ = this.landlordChange.asObservable();

  landlordValueChange(data) {
    this.landlordChange.next(data);
  }


  private propertyChange = new Subject<any>();
  propertyChange$ = this.propertyChange.asObservable();

  propertyChangeEvent(data) {
    this.propertyChange.next(data);
  }

  createLandlord(params): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `landlords`, params);
  }

  getaccessibleOffices(): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `accessible-offices`, {}
    );
  }

  getOfficeLocations(officeCode: string): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `offices/${officeCode}/locations`, {}
    );
  }

  getLandlordDetails(landlordId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `landlords/${landlordId}`);
  }

  getLandlordProperties(landlordId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `landlords/${landlordId}/properties`);
  }

  createNewProperty(payload: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `properties`, payload);
  }

  getPropertyDetails(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/tob`, { params }
    );
  }
}
