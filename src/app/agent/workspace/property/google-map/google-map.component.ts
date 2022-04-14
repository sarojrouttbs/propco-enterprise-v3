import {
  Component,
  OnInit,
  Input
} from "@angular/core";


@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit {

lat:Number;
lng:Number;
centerLongitude;
centerLatitude;
@Input() propertyData;
propertyAddress:any;


markers: marker[] = [
];

ngOnInit(): void {    
  if(this.propertyData?.address){
    this.propertyAddress = this.propertyData?.address;
    console.log(' this.propertyAddress', this.propertyAddress);
    this.setCurrentPosition();
  }
}


  private setCurrentPosition() {
    this.lat = Number(this.propertyAddress.latitude);
    this.lng = Number(this.propertyAddress.longitude);
    this.markers.push({
      lat: Number(this.propertyAddress.latitude) ,
      lng: Number(this.propertyAddress.longitude),
      label: "A",
      draggable: true,
      content: "InfoWindow content"
    })
  }
}

// just an interface for type safety.
interface marker {
lat: number;
lng: number;
label?: string;
draggable: boolean;
content: string;
}
