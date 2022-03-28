import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SolrSearchHandlerService {
  private subject = new Subject<any>();

  search(data) {
    this.subject.next(data);
  }

  getSearch(): Observable<any> {
    return this.subject.asObservable();
  }
}
