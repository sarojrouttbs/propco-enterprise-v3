import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

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

  updateLandlord(params, landloardId: string): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `landlords/${landloardId}/node`, params);
  }

  updateProperty(params, propertyId: string): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `properties/${propertyId}/node`, params);
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
    return this.httpClient.get(environment.API_BASE_URL + `landlords/${landlordId}/node`);
  }

  getLandlordProperties(landlordId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `landlords/${landlordId}/properties`);
  }

  createNewProperty(payload: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `properties`, payload);
  }

  getPropertyDetails(propertyId: string): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/tob`
    );
  }

  getPropertyLocationsByPropertyId(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/locations`);
  }

  getAssignedUsers(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `accessible-users`, {});
  }

  getAvailableSlots(params): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `appointments/available-slots`, { params });
  }

  createMarketAppraisal(params): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `appointments/ma`, params);
  }

}
