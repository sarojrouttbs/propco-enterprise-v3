import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";


@Injectable()
export class SendEmailService {

  constructor(private httpClient: HttpClient) { }

  sendEmail(faultId: any, requestObj: any): Observable<any> {
    return this.httpClient.post(environment.API_BASE_URL + `faults/${faultId}/notifications/send`, requestObj);
  }
}
