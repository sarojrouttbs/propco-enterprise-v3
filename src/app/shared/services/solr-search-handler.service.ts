import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SolrSearchHandlerService {
  private subject = new Subject<any>();

  search(entity, searchTerm) {
    this.subject.next({ entity: entity, searchTerm: searchTerm });
  }

  getSearch(): Observable<any> {
    return this.subject.asObservable();
  }
}
