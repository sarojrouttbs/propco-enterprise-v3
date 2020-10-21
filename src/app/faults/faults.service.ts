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

  getPropertyTenancies(propertyId: string): Observable<any> {
    let params = new HttpParams();
    params.set('status', '1');
    params.set('status', '2');
    params.set('status', '5');
    params.set('status', '6');
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenancies`, { params: params });
  }

  getPropertyAgreementDetails(propertyId: string, agreementId: string): Observable<any> {
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

  uploadDocument(formData: FormData): Observable<any> {
    let faultId = "205e5506-ce3c-4bdf-820a-99d5e49e8066";
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/documents/upload`, formData);
    }

}
