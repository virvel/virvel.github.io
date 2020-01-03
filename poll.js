'use strict';
import {search} from './modules/fetch.js';
import {colors} from './modules/colors.js';
import {Point, quickSortPt} from './modules/algs.js';
import {mapPointHandler, map, centerGetter} from './modules/map.js';
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
  info.addEventListener("click", function() {
    bottom.style.visibility = (bottom.style.visibility === "hidden") ? "visible" : "hidden";
  });


function showCredit() {
  creditDiv.style.visibility = (creditDiv.style.visibility === "hidden") ? "visible" : "hidden";
  cross.style.visibility = (creditDiv.style.visibility === "hidden") ? "visible" : "hidden";
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

const nb_oscs = 6;


// Generate randoms points for testing
const xx = new Array(nb_oscs);
const yy = new Array(nb_oscs);
const f = new Array(nb_oscs);
for (let i = 0; i < nb_oscs; ++i) {
  xx[i] = Math.random()*w;
  yy[i] = Math.random()*h;
  f[i] = 100+Math.random()*4900;
}



const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
unlockAudioContext(audioCtx);

const notes = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3];
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

  oscs[i] = new OscBank(audioCtx, frequencies[i], [1,2,3,5,7], f[i]/100);
  oscs[i].connect(pannerNodes[i]);
  oscs[i].start();
}

var mapPoints = new Array();

function fetchHandler(response) {
  var res= JSON.parse(response).data;
  res.forEach( (p,i) => {
      var aqi = parseFloat(p.aqi)/1000.0;
      if (Number.isNaN(aqi)) {
        aqi = 0;
      }
      mapPoints[i] = [new Point(parseFloat(p.lat), parseFloat(p.lon)), aqi];
    }
    );
  mapPointHandler(mapPoints);

console.log(mapPoints.length);
}

search(
        -90,
        -180,
        90,
        180,
        fetchHandler
        );


/*
document.addEventListener("mousemove", function(e) {
  var mouseX = e.clientX;
  var mouseY = e.clientY;
  for (let i = 0; i < nb_oscs; ++i) {
    var euc = dist(mouseX, mouseY, xx[i], yy[i]);
    var px  = (xx[i]-mouseX)/w;
    var py = (yy[i]-mouseY)/h;

    pannerNodes[i].positionX.linearRampToValueAtTime(px, audioCtx.currentTime+0.01);
    pannerNodes[i].positionY.linearRampToValueAtTime(py, audioCtx.currentTime+0.01);

    gainNodes[i].gain.linearRampToValueAtTime(
      0.5*Math.exp(-euc/500)/nb_oscs,
      audioCtx.currentTime + 0.01
    );
  }
},false );*/



map.addEventListener("move", function() {
    var center;
      center = centerGetter();
      var centerPoint = new Point(center.lat, center.lng);
      var closest = quickSortPt(mapPoints, centerPoint).slice(0,nb_oscs+1);
      
      for (let i = 0; i < nb_oscs; ++i) {
          var euc = centerPoint.dist(closest[i][0]);
          var px  = (closest[i][0].x-centerPoint.x);
          var py = (closest[i][0].y-centerPoint.y);

          oscs[i].exponentialRampToFrequencyAtTime(50+500*closest[i][1], audioCtx.currentTime+0.1);
          oscs[i].exponentialRampToDissAtTime(300-200*closest[i][1], audioCtx.currentTime+0.1);
          pannerNodes[i].positionX.linearRampToValueAtTime(px, audioCtx.currentTime+0.1);
          pannerNodes[i].positionY.linearRampToValueAtTime(py, audioCtx.currentTime+0.1);

          gainNodes[i].gain.linearRampToValueAtTime(
            0.5*Math.exp(-euc/50)/nb_oscs,
            audioCtx.currentTime + 0.01
          );
      }
});