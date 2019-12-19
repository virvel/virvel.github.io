'use strict';
var ctx;
var c = 100;
var max_x = 500;
var max_y = 500;
const buffer_size = 256;
const exponent = 11;
const lookuptable_size = parseInt(Math.pow(2,exponent));
const sample_rate = 10000;
var left_buffer = new Float32Array(buffer_size);
var right_buffer = new Float32Array(buffer_size);
var point_buffer;
var sintable = new Float32Array(lookuptable_size);
var frequency1 = 1300;
var frequency2 = 1332;
var inc1 = frequency1 * buffer_size / sample_rate;
var inc2 = frequency2 * buffer_size / sample_rate;
var phase1 = 0;
var phase2 = 0;

const twopi = 2*Math.PI;


for (let i = 0; i < lookuptable_size; ++i) {
	sintable[i] = Math.sin(twopi*i/lookuptable_size);
}

function toPoint(xx,yy) {
	return {x: xx, y: yy};
}

function mul(a, p) {
	return {x: a * p.x, y: a * p.y};
}

function add(a,p) {
	return {x: a.x + p.x, y: a.y + p.y};
}

function catmull_rom_spline(P0, P1, P2, P3, nPoints)
{
	var t0 = 0;
	var t1 = 1;
	var t2 = 2;
	var t3 = 3;

	var t = Array(nPoints);
	var A1 = Array(nPoints);
	var A2 = Array(nPoints);
	var A3 = Array(nPoints);
	var B1 = Array(nPoints);
	var B2 = Array(nPoints);
	var C = Array(nPoints);

	var i = 0;

	for (let te = t1; te <= t2; te += (t2 - t1)/nPoints)
	{
		t[i++] = te;
	}

	for (let i = 0; i < nPoints; ++i)
	{
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

function catmull_rom_chain(p) {

	if (p) {

		var numPoints = p.length;

		var C = Array();
		var pts;
		for (let i = 0; i < numPoints-3; ++i)
		{
			pts = catmull_rom_spline(p[i], p[i+1], p[i+2], p[i+3], 15);
			C = C.concat(pts);
		}

		return C;
	}

	else {
		console.log('Inga punkter eller?');
	}

}

window.onload = function() {

        
        var duk = document.getElementById("duk");
		ctx = duk.getContext("2d");
		ctx.translate(0,100);

        draw();
}


function topath()
{
	for (let i = 0; i < buffer_size; ++i)
	{
		left_buffer[i] = sintable[phase1];
		right_buffer[i] = sintable[phase2];
		phase1 = parseInt((phase1 + inc1) % lookuptable_size);
		phase2 = parseInt((phase2 + inc2) % lookuptable_size);
	}

}

function toPoints() {

	var pts = Array();
	for (let i = 0; i < buffer_size+3; ++i) {
		pts = pts.concat(toPoint(left_buffer[i%buffer_size],
								 right_buffer[i%buffer_size]));
	}
	return pts;
}


	function draw()
	{
                requestAnimationFrame(draw);
		topath();
		ctx.beginPath();
		var interp = 1;
		if (interp) {
			point_buffer = catmull_rom_chain(toPoints());
  		var point_buffer_length = point_buffer.length;
		for (let i = 0; i < point_buffer_length; ++i) {
			//ctx.lineTo(point_buffer[i].x*c+c, point_buffer[i].y*c+c);
			ctx.lineTo(i/point_buffer_length*max_y, point_buffer[i].y*c+c);
		}
	}
	else {
		for (var i = 0; i < buffer_size; ++i) {
			ctx.lineTo(left_buffer[i]*c+c, right_buffer[i]*c+c);
		}
	}

        ctx.closePath();
        ctx.fillStyle = "rgba(0,30,50,0.85)";
        ctx.shadowColor = 'rgba(0,30,50,0)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillRect(0,-200,500,500);
        ctx.lineWidth = "3";
        ctx.shadowColor = 'rgba(50,255,200,0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = "rgba(50,255,200,1)";
        ctx.stroke();
}
