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
      environment.API_BASE_URL + `properties/${propertyId}/landlords/node`, { params }
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

  getNotes(params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `notes`, { params });
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

  getPropertyTenancies(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/tenancies`, { params }
    );
  }

  getTobVersionList(params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `terms-of-business`, { params }
    );
  }

  getVersionHistory(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/tob-history`, { params }
    );
  }

  getVisitList(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/visits`, { params }
    );
  }

  getVisitNotes(propertyId: string, visitId: string): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/visits/${visitId}/notes`, {}
    );
  }

  getVisitHmoLicence(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/visits/hmo-licence`, { params }
    );
  }

  logout(): Observable<any> {
    return this.httpClient.post(
      environment.API_BASE_URL + `agents/user/logout`, {}
    );
  }

  getMarketingActivity(propertyId: string, params): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/marketing-activity`, { params });
  }

  getPropertyMaintenance(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/maintenance`, { params }
    );
  }

  getMaintenanceNotes(maintenanceId: string): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `maintenance/${maintenanceId}/notes`);
  }

  getRentindemnityProducts(params): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `rentindemnity/products`, { params });
  }
}
