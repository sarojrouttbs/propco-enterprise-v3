import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';

@Injectable()
export class FaultsService {

  constructor(private httpClient: HttpClient) { }

  getAllFaults(params?: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'faults/list', { params: params });
  }

  getFaultNotes(faultId: String): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/${faultId}/notes`);
  }

  getPropertyById(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}`);
  }

  getPpropertyTenancies(propertyId: string): Observable<any> {
    let params = new HttpParams();
    params.set('status', '1');
    params.set('status', '2');
    params.set('status', '5');
    params.set('status', '6');
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenancies`, { params: params });
  }

  getPpropertyAgreementDetails(propertyId: string, agreementId: string): Observable<any> {
    let params = new HttpParams();
    params.set('agreementId', agreementId);
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenants`, { params: params });
  }

  getHMOLicenceDetailsAgainstProperty(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/hmo`);
  }

  getFaultAdditionalInfo(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/additional-info`);
  }

}
