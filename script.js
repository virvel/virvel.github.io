(function () {
   'use strict';
}());
var c = 100;
var buffer_size = 512;
var lookuptable_size = 512;
var sample_rate = 44100;
var ctx;
var left_buffer = new Float32Array(buffer_size);
var right_buffer = new Float32Array(buffer_size);
var point_buffer = [];
var audiobuffer = [];

var sintable = new Float32Array(lookuptable_size);

var frequency1;
var frequency2;
var inc1;
var inc2;
var phase1;
var phase2;

function toPoint(xx,yy)
{
    return {x: xx, y: yy};
}

function mul(a, p)
{
    return {x: a * p.x, y: a * p.y};
}

function add(a,p)
{
    return {x: a.x + p.x, y: a.y + p.y};
}

function catmull_rom_spline(P0, P1, P2, P3, nPoints)
{
    var t0 = 0;
    var t1 = 1;
    var t2 = 2;
    var t3 = 3;

    var t = new Array(nPoints);
    var A1 = new Array(nPoints);
    var A2 = new Array(nPoints);
    var A3 = new Array(nPoints);
    var B1 = new Array(nPoints);
    var B2 = new Array(nPoints);
    var C = new Array(nPoints);

    for (var i = 0; i < nPoints; i += 1)
    {
        t[i] = t1 + (t2 - t1)/nPoints*i;

        A1[i] = add(mul((t1 - t[i])/(t1 - t0), P0),
                    mul((t[i] - t0)/(t1 - t0), P1));
        A2[i] = add(mul((t2 - t[i])/(t2 - t1), P1),
                    mul((t[i] - t1)/(t2 - t1), P2));
        A3[i] = add(mul((t3 - t[i])/(t3 - t2), P2),
                    mul((t[i] - t2)/(t3 - t2), P3));
        B1[i] = add(mul((t2 - t[i])/(t2 - t0), A1[i]),
                    mul((t[i] - t0)/(t2 - t0), A2[i]));
        B2[i] = add(mul((t3 - t[i])/(t3 - t1), A2[i]),
                    mul((t[i] - t1)/(t3 - t1), A3[i]));
        C[i]  = add(mul((t2 - t[i])/(t2 - t1), B1[i]),
                    mul((t[i] - t1)/(t2 - t1), B2[i]));
    }

    return C;
}

function catmull_rom_chain(p)
{

    var numPoints = p.length;

    var C = [];
    var pts;
    for (var i = 0; i < numPoints-3; i += 1)
    {
        pts = catmull_rom_spline(p[i], p[i+1], p[i+2], p[i+3], 10);
        C = C.concat(pts);
    }

    return C;

}

function prepare() {

    frequency1 = 468.75; //3750, 3750
    frequency2 = 1875; //1875, 7500
    inc1 = 2*Math.PI * frequency1 * lookuptable_size / sample_rate;
    inc2 = 2*Math.PI * frequency2 * lookuptable_size / sample_rate;
    phase1 = 0;
    phase2 = 0;

    for (var i = 0; i < lookuptable_size; i += 1)
    {
        sintable[i] = Math.sin(2*Math.PI*i/lookuptable_size);
    }
}

function updatePath()
{
    point_buffer = catmull_rom_chain(toPoints());
}

window.onload = function()
{

    window.addEventListener("deviceorientation", eventHandler, true);

    prepare();

    var actx = new (window.AudioContext || window.webkitAudioContext)();
    audiobuffer = actx.createBuffer(2, 512, sample_rate);
    var lll = audiobuffer.getChannelData(0);
    var rrr = audiobuffer.getChannelData(1);
    for (var i = 0; i < audiobuffer.length; i += 1)
    {
        lll[i] = sintable[phase1]*0.1;
        rrr[i] = sintable[phase2]*0.1;
        phase1 = parseInt((phase1 + inc1) % lookuptable_size);
        phase2 = parseInt((phase2 + inc2) % lookuptable_size);
    }

    var source = actx.createBufferSource();
    source.loop = true;
    source.buffer = audiobuffer;
    source.connect(actx.destination);
    //source.start();

    topath();
    point_buffer = catmull_rom_chain(toPoints());

    var duk = document.getElementById("duk");
    ctx = duk.getContext("2d");
    ctx.translate(100,100);
    var timer = setInterval(draw, 16);
    return timer;
};


function topath()
{
        for (var i = 0; i < buffer_size; i += 1)
        {
            left_buffer[i] = sintable[phase1];
            right_buffer[i] = sintable[phase2];
            phase1 = parseInt((phase1 + inc1) % lookuptable_size);
            phase2 = parseInt((phase2 + inc2) % lookuptable_size);
        }
}

function toPoints()
{

    var pts = Array();
    for (var i = 0; i < buffer_size+3; i += 1)
    {
        pts = pts.concat(toPoint(left_buffer[i%buffer_size],
                                 right_buffer[i%buffer_size]));
    }
    return pts;
}

function eventHandler(event)
{
    var x;
    var y;

    if (event.type === "mousedown")
    {
        x = event.clientX;
        y = event.clientY;
        frequency1 = 15000/(x);
        frequency2 = 15000/(y);
    }

    else if (event.type === "deviceorientation")
    {
        x = event.alpha;
        y = event.beta;
        frequency1 = 10000/(x+1)+100;
        frequency2 = 10000/(y+181)+100;
    }

    inc1 = frequency1 * lookuptable_size / sample_rate;
    inc2 = frequency2 * lookuptable_size / sample_rate;

    updatePath();
}


function draw()
    {


    topath();

    ctx.beginPath();
    var interp = 1;
    if (interp)
    {
        var point_buffer_length = point_buffer.length;
        for (var i = 0; i < point_buffer_length; i += 1)
        {
            ctx.lineTo(point_buffer[i].x*c+c, point_buffer[i].y*c+c);
        }
    }
    else
    {
        for (var i = 0; i < buffer_size; i += 1)
        {
            ctx.lineTo(left_buffer[i]*c+c, right_buffer[i]*c+c);
        }
    }
    ctx.closePath();


    ctx.fillStyle = "rgba(0,30,50,0.85)";
    ctx.shadowColor = "rgba(0,30,50,0)";
    ctx.fillRect(-200,-200,500,500);
    ctx.lineWidth = "2";
    ctx.shadowColor = "rgba(50,255,200,0.7)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "rgba(50,255,200,1)";
    ctx.stroke();

}