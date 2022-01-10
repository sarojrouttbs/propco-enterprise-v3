import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class SolrService {
  constructor(private httpClient: HttpClient) {}

  getUserDetails(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `user/logged-in`);
  }

  entityGetSuggestion(params: HttpParams): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `entities/suggestions`, {
      params,
    });
  }
  
  entitySearch(params: HttpParams): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `entities/search`, {
      params,
    });
  }
}
