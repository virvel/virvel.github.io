import {search} from './fetch.js';
import {Point} from './algs.js';

var map = L.map('map').setView([52.520008, 13.404954], 5);

var tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 5,
    minZoom: 5
}).addTo(map);

var heat = L.heatLayer([],
        {
          radius: 50,
          blur: 50,
          gradient: 
              {
              0.: 'green',
              0.2: 'lime',
              0.4: 'orange',
              0.5: 'red',
              0.6: 'purple',
              1: 'black'
            },
          minOpacity: 0.1
        }).addTo(map);

export function mapPointHandler(mapPoints) {
  mapPoints.forEach( p => {
      heat.addLatLng(new L.LatLng(p[0].x, p[0].y, p[1]));
    });
  heat.redraw();
}

