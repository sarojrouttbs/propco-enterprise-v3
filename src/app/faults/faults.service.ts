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
    let params = new HttpParams()
      .append('status', '1')
      .append('status', '2')
      .append('status', '5')
      .append('status', '6');
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenancies`, { params: params });
  }

  getPropertyTenants(propertyId: string, agreementId?: string): Observable<any> {
    let params = new HttpParams()
    .set('agreementId', agreementId);
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/tenants`, { params: params });
  }

  getHMOLicenceDetailsAgainstProperty(propertyId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/hmo`);
  }

  getFaultAdditionalInfo(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `faults/additional-info`);
  }

  uploadDocument(formData: FormData, faultId): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/documents/upload`, formData);
  }

  escalateFault(faultId, requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/escalation`, requestObj);
  }

  deEscalateFault(faultId, requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/de-escalation`, requestObj);
  }

  getLandlordsOfProperty(propertyId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/landlords`);
  }

  getTenantGuarantors(tenantId): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}/guarantors`);
  }

  createFault(requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/create`, requestObj);
  }

  searchPropertyByText(text: string): Observable<any> {
    let params = new HttpParams()
    .set('limit', '10')
    .set('page', '1')
    .set('prop.mantypeLetCat', '3346')
    .set('text', text)
    .set('types', 'PROPERTY')
    return this.httpClient.get(environment.API_BASE_URL + `entities/search`, { params: params });
    }

}
