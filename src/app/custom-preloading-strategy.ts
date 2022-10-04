import { Injectable } from "@angular/core";
import { PreloadingStrategy, Route } from "@angular/router";
import { Observable, of, timer } from "rxjs";
import { concatMap } from "rxjs/operators";

@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
    preload(route: Route, loadMe: () => Observable<any>): Observable<any> {
        if (route.data && route.data['preload']) {
            var delay: number = route.data['delay'];
            return timer(delay).pipe(
                concatMap(_ => {
                    return loadMe();
                }));
        } else {
            return of(null);
        }
    }
}

