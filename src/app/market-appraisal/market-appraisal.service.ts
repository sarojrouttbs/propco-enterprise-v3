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
}
