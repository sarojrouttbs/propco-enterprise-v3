import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AgentService {
  constructor(private httpClient: HttpClient) {}

  getPropertyById(propertyId: string,params): Observable<any> {
    return this.httpClient.get(
      environment.API_BASE_URL + `properties/${propertyId}/tob`,{params}
    );
  }
}
