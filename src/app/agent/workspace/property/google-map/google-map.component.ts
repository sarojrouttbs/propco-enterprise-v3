import { Component, OnInit, Input, NgZone } from "@angular/core";
import { Observable } from "rxjs";
import { MapsAPILoader } from "@agm/core";
import { tap, map, switchMap } from "rxjs/operators";
import { from, of } from "rxjs";

declare var google: any;

@Component({
  selector: "app-google-map",
  templateUrl: "./google-map.component.html",
  styleUrls: ["./google-map.component.scss"],
})
export class GoogleMapComponent implements OnInit {
  private geocoder: any;

  lat: number;
  lng: number;
  centerLongitude: any;
  centerLatitude: any;
  @Input() propertyData: { address: any };
  propertyAddress: any;

  markers: marker[] = [];

  constructor(private _zone: NgZone, private mapLoader: MapsAPILoader) {}

  ngOnInit(): void {
    this.propertyAddress = this.propertyData?.address;

    if (
      Number(this.propertyAddress.latitude) &&
      Number(this.propertyAddress.longitude)
    ) {
      this.setCurrentPosition(
        Number(this.propertyAddress.latitude),
        Number(this.propertyAddress.longitude)
      );
    } else {
      const addressStr =
        this.propertyAddress?.addressLine1 +
        " " +
        this.propertyAddress?.addressLine1 +
        " " +
        this.propertyAddress?.addressLine3 +
        " " +
        this.propertyAddress?.town +
        " " +
        this.propertyAddress?.county +
        " " +
        this.propertyAddress?.postcode;
      this.addressToCoordinates(addressStr);
    }
  }

  private initGeocoder() {
    this.geocoder = new google.maps.Geocoder();
  }

  waitForMapsToLoad(): Observable<boolean> {
    if (!this.geocoder) {
      return from(this.mapLoader.load()).pipe(
        tap(() => this.initGeocoder()),
        map(() => true)
      );
    }
    return of(true);
  }

  geocodeAddress(location: string): Observable<any> {
    return this.waitForMapsToLoad().pipe(
      switchMap(() => {
        return new Observable((observer) => {
          this.geocoder.geocode({ address: location }, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              observer.next({
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              });
            } else {
              observer.next({ lat: 0, lng: 0 });
            }
            observer.complete();
          });
        });
      })
    );
  }

  addressToCoordinates(address: string) {
    this.geocodeAddress(address).subscribe((location: any) => {
      this.lat = location.lat;
      this.lng = location.lng;
      this.setCurrentPosition(this.lat, this.lng);
    });
  }

  private setCurrentPosition(lat, lng) {
    this.lat = lat;
    this.lng = lng;
    this.markers.push({
      lat: lat,
      lng: lng,
      draggable: false,
    });
  }
}

interface marker {
  lat: number;
  lng: number;
  draggable: boolean;
}
