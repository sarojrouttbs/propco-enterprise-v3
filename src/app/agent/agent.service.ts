import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, Subject } from 'rxjs';
import { catchError, debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CommonService } from '../shared/services/common.service';

@Injectable({
  providedIn: 'root',
})
export class AgentService {

  private getViewingCount = new BehaviorSubject<number>(0);
  updatedViewingCount = this.getViewingCount.asObservable();

  private resetViewingFilter = new BehaviorSubject<any>('');
  updateResetFilter = this.resetViewingFilter.asObservable();

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) { }

  updateCount(message: number) {
    this.getViewingCount.next(message);
  }

  resetFilter(message: any) {
    this.resetViewingFilter.next(message);
  }

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
      environment.API_BASE_URL + `properties/${propertyId}/tenancies/node`, { params }
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

  getWhitegoodsList(propertyId: string, params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/management-services`, { params }
    );
  }

  getKeysListing(propertyId: string, params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/keys`, { params });
  }

  getkeysetLogHistory(keySetId: number): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `keys/${keySetId}/logs`);
  }

  getUsersList(params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `users-list`, { params });
  }

  createKeyset(propertyId: string, requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `properties/${propertyId}/keys`, requestObj);
  }

  deleteKeyset(keySetId: number): Observable<any> {
    return this.httpClient.delete(environment.API_BASE_URL + `keys/${keySetId}`, {});
  }

  updateKeyset(keySetId: number, requestObj: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `keys/${keySetId}`, requestObj);
  }

  addKeysetActivity(keySetId: number, requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `keys/${keySetId}/logs`, requestObj);
  }

  updateKeysetActivity(keyLogId: number, requestObj: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `keys/logs/${keyLogId}`, requestObj);
  }

  getsafetyDeviceList(propertyId: string, params: any): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/safety-devices`, { params }
    );
  }

  getChangeHistory(params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `change-history`, { params });
  }

  getLatlongFromAddress(url: any, params: any): Observable<any> {
    return this.httpClient.get(url, { params });
  }

  getAgreementDetails(agreementId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `agreement/${agreementId}/details`);
  }

  getAgreementHistory(agreementId: string,): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `agreement/${agreementId}/history`);
  }

  getTenantGuarantors(tenantId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `tenants/${tenantId}/guarantors`);
  }

  getPropertyHMOLicence(propertyId: string, params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/licences`, { params });
  }

  getViewings(propertyId: string, params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/viewings`, { params });
  }

  getClauses(params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `clauses/node`, { params });
  }

  getPropertyClauses(propertyId: string, params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/clauses/node`, { params });
  }

  getClausesHeadings(params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `clauses/headings/node`, { params });
  }

  getUserDetails(params: any): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `user/logged-in`, { params });
  }

  getPropertyShortLetDesc(propertyId: string, params): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `properties/${propertyId}/shortlet/node`, { params })
  }

  updatePropertyDetails(propertyId: string, requestObj: any): Observable<any> {
    const params = new HttpParams().set('hideLoader', 'true');
    return this.httpClient.patch(environment.API_BASE_URL + `properties/${propertyId}/update/node`, requestObj, { params }).pipe(
      catchError(this.handleError<any>(''))
    );
  }

  createWhiteGoods(propertyId: number, requestObj: any) {
    return this.httpClient.post(environment.API_BASE_URL + `properties/${propertyId}/management-services`, requestObj);
  }

  createClause(requestObj: any) {
    return this.httpClient.post(environment.API_BASE_URL + `clauses/node`, requestObj);
  }

  addEntityClause(entityId: string, clauseId: string, requestObj: any) {
    return this.httpClient.post(environment.API_BASE_URL + `properties/${entityId}/clauses/${clauseId}/node`, requestObj);
  }

  deleteClause(entityId: string, clauseId: string, requestObj: any) {
    return this.httpClient.delete(environment.API_BASE_URL + `properties/${entityId}/clauses/${clauseId}/node`, requestObj);
  }

  createPeriodicVisit(propertyId: number, requestObj: any) {
    return this.httpClient.post(environment.API_BASE_URL + `properties/${propertyId}/visits/node`, requestObj);
  }

  updatePeriodicVisit(visitId: string, requestObj: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `visits/${visitId}/node`, requestObj);
  }

  updateAgreementDetails(agreementId: string, requestObj: any): Observable<any> {
    return this.httpClient.put(environment.API_BASE_URL + `agreements/${agreementId}`, requestObj);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }
}

