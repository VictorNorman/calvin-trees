import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FeatureComponent, MapComponent } from '@maplibre/ngx-maplibre-gl';
import { LngLat } from 'maplibre-gl';


import treeJson from '../../assets/trees.json';
import tour1Json from '../../assets/tour1_geojson.json';

interface TreeInfo {
  treeId: number;
  lng: number;
  lat: number;
  commonName: string;
  scientificName: string;
  commemoration: string;
  attachmentURL?: string;
}
type AppMode = 'tour1' | 'wander' | 'tour2';


// Bob Speelman's 12 favorite trees.
const Tour1 = [
  54, 23, 13, 24, 25, 43, 98, 93, 82, 88, 75, 84,
];

interface GeometryType {
  type: string;
  coordinates: number[][];
}


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {

  public imageLoaded = false;

  public nearbyTrees: TreeInfo[] = [];
  public tour1Markers: TreeInfo[] = [];

  private defaultLng = -85.5871801;
  private defaultLat = 42.9308076;
  public center: LngLat = new LngLat(this.defaultLng, this.defaultLat);
  heading: [number] | undefined = undefined;
  errorMsg: string = '';

  public mode: AppMode = 'wander';
  public tour1Json: any = tour1Json.routes[0].geometry;

  @ViewChild('map') map: MapComponent | null = null;

  private readonly treesDb: TreeInfo[] = [
    // {
    //   lng: -85.59002609659022,
    //   lat: 42.932341568753785,
    //   description: "Fancy pine",
    // },
    // {
    //   lng: -85.591,
    //   lat: 42.93245,
    //   description: "Redwood",
    // }
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

    this.treesDb = treeJson.features.map((tree) => {
      return {
        treeId: tree.properties.OBJECTID,
        lng: tree.geometry.coordinates[0],
        lat: tree.geometry.coordinates[1],
        scientificName: tree.properties.scientific,
        commonName: tree.properties.common_nam,
        commemoration: tree.properties.commemorat,
      }
    });

    this.tour1Markers = treeJson.features
      .filter(tree => Tour1.includes(tree.id))
      .map(tree => {
        return {
          treeId: tree.properties.OBJECTID,
          lng: tree.geometry.coordinates[0],
          lat: tree.geometry.coordinates[1],
          scientificName: tree.properties.scientific,
          commonName: tree.properties.common_nam,
          commemoration: tree.properties.commemorat,
        }
      });

  }

  ngAfterViewInit() {
    setTimeout(() => this.map!.mapInstance.resize(), 0);
  }

  highlightNearbyTrees() {
    this.nearbyTrees = this.treesDb.filter(tree =>
      this.center.distanceTo(new LngLat(tree.lng, tree.lat)) < 10  // meters
    );

    // For each tree, we need to get attachment numbers. To do this, build a URL ending in,
    // ...FeatureServer/7/{{tree.treeId}}/attachments?f=json. Using the REST API gives back a json object like this:
    // {
    //   "attachmentInfos" : [
    //     {
    //       "id": 70,
    //       "parentObjectId": 97,
    //       "name": "IMG_2084.JPG",
    //       "contentType": "image/jpeg",
    //       "size": 3880050,
    //       "keywords": "",
    //       "exifInfo": null
    //     }
    //   ]
    // }
    // Then build the image url: FeatureServer/7/{{tree.treeId}}/attachments/{{attachmentInfos[0].id}}
    const baseURL = 'https://services2.arcgis.com/DBcRJmfPI2l07jMS/arcgis/rest/services/Calvin_Campus_Speelman_Arboretum_WFL1/FeatureServer/7';

    this.nearbyTrees.forEach(async tree => {
      const response = await fetch(`${baseURL}/${tree.treeId}/attachments?f=json`);
      const treeAttachmentData = await response.json();
      // console.log(JSON.stringify(treeAttachmentData, null, 2));
      if (treeAttachmentData.attachmentInfos.length > 0) {
        tree.attachmentURL = `${baseURL}/${tree.treeId}/attachments/${treeAttachmentData.attachmentInfos[0].id}`;
      }
    });
  }

  public setMode(mode: AppMode) {
    this.mode = mode;
    console.log('mode set to ', mode);

    if (mode == 'tour1') {
      // clear all pop-ups
      // (for now) put markers on the map for the tour trees.
      console.table(this.tour1Markers);

    }
  }
}


/*
To get tree info:
https://services2.arcgis.com/DBcRJmfPI2l07jMS/ArcGIS/rest/services/Calvin_Campus_Speelman_Arboretum_WFL1/FeatureServer/7/113?f=json
last number is 1 - 113.

https://services2.arcgis.com/DBcRJmfPI2l07jMS/ArcGIS/rest/services/Calvin_Campus_Speelman_Arboretum_WFL1/FeatureServer/7/getEstimates/?f=pjson

https://services2.arcgis.com/DBcRJmfPI2l07jMS/ArcGIS/rest/services/Calvin_Campus_Speelman_Arboretum_WFL1/FeatureServer/7/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=

Get attachments for a tree:
https://services2.arcgis.com/DBcRJmfPI2l07jMS/ArcGIS/rest/services/Calvin_Campus_Speelman_Arboretum_WFL1/FeatureServer/7/78/attachments?f=json

The id field indicates how to access the image.  end url with attachment/{{id}}

Mapbox API token: pk.eyJ1IjoidnRuMiIsImEiOiJjbGhnbTNoNzcwOW9yM2pwOGl0emFpNjhyIn0.AxiB76BK9PaUGaadHSOrDA

-85.5887953328383	, 42.9292720330779
-85.5870504205405	, 42.9294823836051
-85.5852588262338	, 42.9294587907906
-85.5850631553403, 42.9294710026847
-85.5857617648935, 42.9302758203728
-85.5885371914382, 42.9299075965584
-85.587076244573, 42.9320003036711
-85.5868522531289, 42.9330915086662
-85.5862032654683, 42.9320615016371
-85.5864893434085, 42.9344492637226
-85.5891379421623, 42.9325158544232


Don't love these results...
https://api.mapbox.com/directions/v5/mapbox/walking/-85.5887953328383%2C42.9292720330779%3B-85.5870504205405%2C42.9294823836051%3B-85.5852588262338%2C42.9294587907906%3B-85.5850631553403%2C42.9294710026847%3B-85.5857617648935%2C42.9302758203728%3B-85.5885371914382%2C42.9299075965584%3B-85.587076244573%2C42.9320003036711%3B-85.5868522531289%2C42.9330915086662%3B-85.5862032654683%2C42.9320615016371%3B-85.5864893434085%2C42.9344492637226%3B-85.5891379421623%2C42.9325158544232%3B-85.5891282735509%2C42.9315326049458?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=simplified&steps=true&access_token=pk.eyJ1IjoidnRuMiIsImEiOiJjbGhnbHpucGowNXBnM21xamxsNXBocGdjIn0.klEa91Svy8rM2OWA2bbMuA

*/