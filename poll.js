'use strict';
import {search} from './modules/fetch.js';
import {colors} from './modules/colors.js';
import {Point, quickSortPt} from './modules/algs.js';
import {mapPointHandler, map} from './modules/map.js';
import {OscBank, unlockAudioContext} from './modules/ljud.js';

var wallOfText = "<p>„I Breathe” är ett nytt digitalt konstverk av Cha Blasco där han utforskar luftkvalitet och föroreningsindex i realtid. Genom att använda datasonification, en process där datainformation omvandlas till ljud och musik, får publiken en interaktiv och känslomässig upplevelse av den luft vi andas. Cha Blasco har ett stort engagemang i klimatfrågor och vill inspirera till kritisk självreflexivitet genom att ge en större förståelse de hälsorisker vi står framför.</p> \
<p>„I Breathe” presenteras som en webbplatsbaserad audiovisuell installation där användaren individuellt kan uppleva en världsomspännande kartografisk resa som alltid ändrar luftkvalitet och föroreningsindex i realtid.</br>\</p>\
<p>Luftkvalitetsindexet är baserat på mätning av partiklar (PM2,5 och PM10), Ozon (O3), kvävedioxid (NO2), svaveldioxid (SO2) och kolmonoxid (CO). De flesta av stationerna på kartan övervakar både PM2.5- och PM10-data, men det finns få undantag där endast PM10 är tillgänglig. Alla mätningar är baserade på timavläsningar. Detta index kategoriseras efter sex olika gruppnivåer: Bra (grön), Måttligt (gul), Ohälsosamt för känsliga grupper (orange), Ohälsosamt (röd), Mycket ohälsosamt (lila) och Farligt (brun).</p>"


  var bottom = document.getElementById("bottom");

  for (let c of colors) { 
    var color = document.createElement('div');
    color.className = c.color;
    bottom.appendChild(color);

    var hr = document.createElement("hr");
    hr.className = "blob";
    color.appendChild(hr);

    var level = createDiv("level", c.level);
    color.appendChild(level);

    var health = createDiv("health", c.health);
    color.appendChild(health);

    var caution = createDiv("caution", c.caution);
    color.appendChild(caution);
  }

  function createDiv(className, innerHTML) {
    var res = document.createElement("div");
    res.className = className;
    res.innerHTML = innerHTML;
    return res;
  }

  const info = document.getElementById("info");
  const infoexit = document.querySelector("#bottom #exit");

  info.addEventListener("click", function() {
    bottom.style.visibility = (bottom.style.visibility === "hidden") ? "visible" : "hidden";
    
  });

  infoexit.addEventListener("click", function() {
    bottom.style.visibility = (bottom.style.visibility === "hidden") ? "visible" : "hidden";
  });



function showCredit() {
  creditDiv.style.visibility = (creditDiv.style.visibility === "hidden") ? "visible" : "hidden";
}


document.getElementById("credits").addEventListener("click", function() {
  showCredit();
});

document.getElementById("exit").addEventListener("click", function() {
  showCredit();
});


function dist(x1,y1, x2, y2) {
  return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
}


let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
document.addEventListener("resize", function() {
  w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
});

const nb_oscs = 8;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
unlockAudioContext(audioCtx);

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
  mapPoints = Array.from(mapPointsMap.values()).concat(newPts);
  mapPointHandler(newPts);
}

var tajmer = setInterval(ssssss, 1000);

function ssssss() {
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
        window.clearInterval(tajmer)
      }
}

function scale(x, a1, a2, b1, b2) {
  return clip((b2-b1)*(x-a1)/(a2-a1) + b1, Math.min(b1,b2), Math.max(b1,b2));
}


function clip(x, min, max) {
  return Math.max(Math.min(x, max),min);
}

var oldCenter = new Point(0,0);

map.addEventListener("move", function() {
    var center = map.getCenter();
      var centerPoint = new Point(center.lat, center.lng);
      var closest = quickSortPt(mapPoints, centerPoint).slice(0,nb_oscs+1);

      if (typeof(closest) !== 'undefined' && oldCenter.dist(centerPoint) > 0.001) {
        for (let i = 0; i < nb_oscs; ++i) {
            var euc = centerPoint.dist(closest[i][0]);
            var px  = (closest[i][0].x-centerPoint.x);
            var py = (closest[i][0].y-centerPoint.y);

            //oscs[i].linearRampToFrequencyAtTime(10*closest[i][1], audioCtx.currentTime+0.1);

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