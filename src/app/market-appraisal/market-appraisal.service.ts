import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MarketAppraisalService {

  constructor(private httpClient: HttpClient) { }

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

  createNewProperty(payload: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `properties`, payload);
  }
}
