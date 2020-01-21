import {search} from './fetch.js';
import {Point} from './algs.js';

export var map = L.map('map',
  {
    worldCopyJump: true,
    maxBoundsViscosity: 5
  }).setView([52.520008, 13.404954], 5);


L.control.search({
    url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
    propertyName: 'display_name',
    jsonpParam: 'json_callback',    
    propertyLoc: ['lat','lon'],
    autoCollapse: true,
    autoType: false,
    minLength: 3,
    zoom: 5,
    moveToLocation: function(latlng) {
      map.panTo(new L.LatLng(latlng.lat, latlng.lng));
    }
  })
  .addTo(map);

var tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 5,
    minZoom: 5
}).addTo(map);

var heat = L.heatLayer([],
        {
          radius: 15,
          blur: 15,
          max:1000,
          gradient: 
              {
              0.: 'green',
              0.3: 'lime',
              0.5: 'orange',
              0.7: 'red',
              0.95: 'purple',
              1.0: 'black'
            },
          minOpacity: 0.2
        }).addTo(map);


export function mapPointHandler(mapPoints) {

  mapPoints.forEach(p => {
    heat.addLatLng(new L.LatLng(p[0].x, p[0].y, p[1]))
  });
}

