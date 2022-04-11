import {
  Component,
  OnInit,
  NgZone,
  Input
} from "@angular/core";
import { MouseEvent, LatLngLiteral } from "@agm/core";
import { BehaviorSubject } from "rxjs";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit {

  @Input() propertyData;
    propertyAddress:any;
    map_zoom: number = 4;
    clulster_max_zoom = 4;

  // initial center position for the map
  lat: number = 51.673858;
  lng: number = 7.815982;
  minClusterSize = 2;
  openedWindow: number = -1;
  centerLatitude = this.lat;
  centerLongitude = this.lng;

  public markers = new BehaviorSubject<any[]>(null);
  public searchControl: FormControl;

  constructor() {}

  ngOnInit(): void {
    if(this.propertyData?.address){
      this.propertyAddress = this.propertyData?.address;
      this.setCurrentPosition();
    }
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = this.propertyAddress.latitude;
        this.lng = this.propertyAddress.longitude;
        this.map_zoom = 12;
      });
    }
  }

  centerChange(coords: LatLngLiteral) {
    this.centerLatitude = coords.lat;
    this.centerLongitude = coords.lng;
  }

  clickedMarker(label: string, index: number) {
    this.openedWindow = index;
    console.log(`clicked the marker: ${label || index}`);
  }

  markerDragEnd(m: marker, $event: MouseEvent) {
    console.log("dragEnd", m, $event);
  }

public centerChanged(coords: LatLngLiteral) {
    this.centerLatitude = coords.lat;
    this.centerLongitude = coords.lng;
  }

public mapReady(map) {
  map.addListener("dragend", () => {
    console.log(this.centerLatitude, this.centerLongitude)
    });
  }
}

// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
