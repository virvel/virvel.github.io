'use strict';
import {search} from './modules/fetch.js';
import {colors} from './modules/colors.js';
import {Point, quickSortPt, clip} from './modules/algs.js';
import {mapPointHandler, map} from './modules/map.js';
import {OscBank, unlockAudioContext} from './modules/ljud.js';

function createDiv(className, innerHTML) {
  var res = document.createElement("div");
  res.className = className;
  res.innerHTML = innerHTML;
  return res;
}

const bottom = document.getElementById("bottom");

for (let c of colors) { 
  var color = document.createElement('div');
  color.className = c.color;
  bottom.appendChild(color);
  var hr = document.createElement("hr");
  hr.className = "blob";
  color.appendChild(hr);
  color.appendChild(createDiv("level", c.level));
  color.appendChild(createDiv("health", c.health));
  color.appendChild(createDiv("caution", c.caution));
}

function addElementHider(elementToListenTo, elementToShow) {
  elementToListenTo.addEventListener("click", function() {
    elementToShow.style.visibility = (elementToShow.style.visibility === "hidden") ? "visible" : "hidden";
  });
}

addElementHider(document.querySelector("#info"), bottom)
addElementHider(document.querySelector("#bottom #exit"), bottom);
addElementHider(document.querySelector("#credits"), creditDiv)
addElementHider(document.querySelector("#exit"), creditDiv);



const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
unlockAudioContext(audioCtx);

const nb_oscs = 8;
const notes = [220.0, 261.6, 329.6, 392.0, 523.3, 659.3];
const oscs = new Array(nb_oscs);
const frequencies = new Array(nb_oscs);
var vol = .005/nb_oscs;
const pannerNodes = new Array(nb_oscs);
const gainNodes = new Array(nb_oscs);

for (let i = 0; i < nb_oscs; i++) {

  gainNodes[i] = audioCtx.createGain();
  gainNodes[i].connect(audioCtx.destination);
  gainNodes[i].gain.value = vol;

  pannerNodes[i] = audioCtx.createPanner();
  pannerNodes[i].connect(gainNodes[i]);
  pannerNodes[i].setPosition(0,0,0.5);

  var s = Math.floor(Math.random()*notes.length);
  frequencies[i] = notes[s]/2;

  oscs[i] = new OscBank(audioCtx, frequencies[i], [1,2,3,5,7], 1200);
  oscs[i].connect(pannerNodes[i]);
  oscs[i].start();
}

var mapPointsMap = new Map();
var mapPoints = new Array();

function fetchHandler(response) {
  var newPts = new Array();
  var res= JSON.parse(response).data;
  res.forEach( (p,i) => {
      var aqi = parseFloat(p.aqi);
      if (!Number.isNaN(aqi)) {
        if (!mapPointsMap.has(p.uid)) {
          mapPointsMap.set(p.uid, [new Point(parseFloat(p.lat), parseFloat(p.lon)), aqi]);
          newPts.push([new Point(parseFloat(p.lat), parseFloat(p.lon)), aqi]);
        }}}
    );
  mapPoints = mapPoints.concat(newPts);
  mapPointHandler(newPts);
}

var bnds = map.getBounds();

search(
  bnds._northEast.lat,
  bnds._northEast.lng,
  bnds._southWest.lat,
  bnds._southWest.lng,
  fetchHandler
  );



var oldCenter = new Point(0,0);

map.addEventListener("moveend", pointAdder);

function pointAdder() {

      var bnds = map.getBounds();

      search(
        bnds._northEast.lat,
        bnds._northEast.lng,
        bnds._southWest.lat,
        bnds._southWest.lng,
        fetchHandler
        );

      if (mapPoints.length > 10000)
      {
        map.removeEventListener("moveend", pointAdder, false);
      }
}

map.addEventListener("move", function() {
    var center = map.getCenter();
      var centerPoint = new Point(center.lat, center.lng);
      var closest = quickSortPt(mapPoints, centerPoint).slice(0,nb_oscs+1);

      if (typeof(closest) !== 'undefined' && oldCenter.dist(centerPoint) > 0.001) {
        for (let i = 0; i < nb_oscs; ++i) {
            var euc = centerPoint.dist(closest[i][0]);
            var px  = (closest[i][0].x-centerPoint.x);
            var py = (closest[i][0].y-centerPoint.y);

            oscs[i].linearRampToDissAtTime(clip(20000*Math.exp(-closest[i][1]/30)+3, 3,20000), audioCtx.currentTime+0.05);
            if (pannerNodes[i].positionY) {
              pannerNodes[i].positionX.linearRampToValueAtTime(px, audioCtx.currentTime+0.1);
              pannerNodes[i].positionY.linearRampToValueAtTime(py, audioCtx.currentTime+0.1);
            }
            else {
              pannerNodes[i].setPosition(px,py,0);
            }
            gainNodes[i].gain.linearRampToValueAtTime(
              0.25*Math.exp(-euc/50)/(nb_oscs*2),
              audioCtx.currentTime + 0.01
            );

        }
      }
      oldCenter = centerPoint;
});