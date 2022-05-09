import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AgentService {
  constructor(private httpClient: HttpClient) { }

  getPropertyById(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/tob`, { params }
    );
  }

  getPropertyLandlords(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/landlords`, { params }
    );
  }

  getPropertyTenants(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/tenants`, { params }
    );
  }

  getPropertyDetails(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/details`, { params }
    );
  }

  getSyatemOptions(params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `options`, { params }
    );
  }

  getPropertyNotes(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/notes`, { params });
  }
  
  getOfficeLocations(officeCode: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `offices/${officeCode}/locations`);
  }

  getPropertyLocationsByPropertyId(propertyId: string, params): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/locations`, { params });
  }

  getInspection(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/inspections`, { params }
    );
  }

  logout(): Observable<any> {
    return this.httpClient.post(
      environment.API_BASE_URL + `agents/user/logout`, {}
    );
  }
}
