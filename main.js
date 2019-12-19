'use strict';
import {rbf_interp} from './modules/rbf.js';

const duk = document.getElementById("duk");
const ctx = duk.getContext('2d');
ctx.globalAlpha = 0.5;
ctx.globalCompositeOperation = "lighten";

ctx.drawImage(document.getElementById("hej"), 10, 10);

const w = 1700;
const h = 900;
const n = 10;

const xx = new Array(n);
const yy = new Array(n);
const f = new Array(n);
for (let i = 0; i < n; ++i) {
  xx[i] = Math.random()*w;
  yy[i] = Math.random()*h;
  f[i] = Math.floor(Math.random()*255);
}

const S = rbf_interp(xx, yy, f, w, "fastgauss");


let tone = new Array(255);
for (let x = 0; x < 255; ++x) {
    tone[x] = [
        Math.max(-Math.pow((x-128),2)/128 + 128,0),
        Math.floor(255-1.5*x),
        0
    ];
}

var fmax = 255;
var fmin = 0;
for (let i = 0 ; i < w; i++) {
  for (let j = 0; j < h; j++) {
    fmax = S[i][j] > fmax ? S[i][j] : fmax;
    fmin = S[i][j] < fmin ? S[i][j] : fmin;
  }
}

const imgData = ctx.createImageData(w, h);
const old = ctx.getImageData(0,0,w,h);

var d = Math.floor(fmax - fmin);
for (let i = 0; i < w; i++) {
  for (let j = 0; j < h; j++) {
    var k = 4*(i + w*j);
    let c = Math.floor((S[i][j] - fmin) * 254 / d);
    imgData.data[k] =   tone[ c ][0];
    imgData.data[k+1] = tone[ c ][1];
    imgData.data[k+2] = tone[ c ][2];
    imgData.data[k+3] = c;
  }
}

ctx.putImageData(imgData, 0, 0);


