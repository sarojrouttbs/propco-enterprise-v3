import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpClient:HttpClient) { }

  getDomains(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `agents/domains`);
  }

  authenticateUser(requestObj): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `agents/authenticate`, requestObj);
  }
}
