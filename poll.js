'use strict';
import {search} from './modules/fetch.js';
import {colors} from './modules/colors.js';
import {Point, dist, quickSortPt} from './modules/algs.js';
import {mapPointHandler} from './modules/map.js';
import {OscBank, unlockAudioContext} from './modules/ljud.js';

{
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
}


let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
document.addEventListener("resize", function() {
  w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
});

const nb_oscs = 10;


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
}

search(
        -90,
        -180,
        90,
        180,
        fetchHandler
        );


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
},false );