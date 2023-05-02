import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MapComponent } from '@maplibre/ngx-maplibre-gl';
import { LngLat } from 'maplibre-gl';

interface TreeInfo {
  lng: number;
  lat: number;
  description: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {

  public imageLoaded = false;

  public nearbyTrees: TreeInfo[] = [];

  private defaultLng = -85.5871801;
  private defaultLat = 42.9308076;
  public center: LngLat = new LngLat(this.defaultLng, this.defaultLat);
  heading: [number] | undefined = undefined;
  errorMsg: string = '';

  @ViewChild('map') map: MapComponent | null = null;

  private readonly treesDb: TreeInfo[] = [
    {
      lng: -85.59002609659022,
      lat: 42.932341568753785,
      description: "A happy tree!",
    }
  ];

  constructor() {
    window.navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.heading) {
          this.heading = [position.coords.heading];
        }
        // update center of map.
        this.center = new LngLat(position.coords.longitude, position.coords.latitude);
        this.highlightNearbyTrees();
      },
      (error) => {
        this.errorMsg = error.message;
      },
      {
        enableHighAccuracy: true,
      }
    );

  }

  ngAfterViewInit() {
    setTimeout(() => this.map!.mapInstance.resize(), 0);
  }

  highlightNearbyTrees() {
    this.nearbyTrees = this.treesDb.filter(tree =>
      this.center.distanceTo(new LngLat(tree.lng, tree.lat)) < 10  // meters
    );
  }
}
