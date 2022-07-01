import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import * as Leaflet from 'leaflet';
import { AgentService } from 'src/app/agent/agent.service';
import { AddressPipe } from 'src/app/shared/pipes/address-string-pipe.pipe';
@Component({
  selector: 'app-open-street-map',
  templateUrl: './open-street-map.component.html',
  styleUrls: ['./open-street-map.component.scss'],
})

export class OpenStreetMapComponent implements OnInit {
  @Input() propertyData: { address: any };
  propertyAddress: any;
  lat: number;
  long: number;
  options: Leaflet.MapOptions;

  constructor(private agentService: AgentService) {}

  ngOnInit() {
    this.initMap();
  }

  private async initMap() {
    this.propertyAddress = this.propertyData?.address;
    const latitude = +this.propertyAddress.latitude;
    const longitude = +this.propertyAddress.longitude;
    if (latitude && longitude) {
      this.lat = latitude;
      this.long = longitude;
      this.options = getOptions(this.lat, this.long);
    } else {
      const addressPipe = new AddressPipe();
      const addressStr = addressPipe.transform(this.propertyAddress);
      const latLong: any = await this.addressToCoordinates(addressStr);
      this.lat = +latLong.lat;
      this.long = +latLong.lon;
      this.options = getOptions(this.lat, this.long);
    }
  }

  private addressToCoordinates(address: string) {
    const params = new HttpParams()
      .set('hideLoader', 'true')
      .set('q', address)
      .set('format', 'json');
    const promise = new Promise((resolve, reject) => {
      this.agentService.getLatlongFromAddress('https://nominatim.openstreetmap.org/search', params).subscribe(
        (resp: any) => {
          if (resp && resp[0]) {
            resolve(resp[0]);
          }
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }
}

export const getOptions = (lat: number, long: number) => {
  const options: Leaflet.MapOptions = {
    layers: getLayers(lat,long),
    zoom: 17,
    center: new Leaflet.LatLng(lat,long)
  };
  return options;
}

export const getLayers = (lat: number, long: number): Leaflet.Layer[] => {
  const layers = [
    // Basic style
    new Leaflet.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '...'
    } as Leaflet.TileLayerOptions),
    ...getMarkers(lat, long)
  ] as Leaflet.Layer[];
  return layers;
};

export const getMarkers = (lat: number, long: number): Leaflet.Marker[] => {
  const markers = [
    new Leaflet.Marker(new Leaflet.LatLng(lat, long), {
      icon: new Leaflet.Icon({
        iconSize: [50, 41],
        iconAnchor: [13, 41],
        iconUrl: 'assets/images/agent/red-marker.svg',
      }),
    } as Leaflet.MarkerOptions),
  ] as Leaflet.Marker[];
  return markers;
};