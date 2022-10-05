import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js';

let objPot = {
	barrierWidth: 10,
	barrierEnergy: 0.04,
	waveEnergy: 0.03,
	speed: 40,
	probability: false
};

let context;

let xMax;
let yMax;

let psiReal;
let psiIm;

let psiPrevReal;
let psiPrevIm;

let psiNextReal;
let psiNextIm;
let p;
let dt;

export function iniValuesPot() {
	objPot.barrierWidth = 10;
	objPot.barrierEnergy = 0.04;
	objPot.waveEnergy = 0.03;
	objPot.speed = 40;
	objPot.probability = false;
}

export function iniGuiPot(gui) {
	let sliderW = gui.add(objPot, "barrierWidth").min(0).max(50).step(1); 
	let sliderE = gui.add(objPot, "barrierEnergy").min(0).max(0.2).step(0.01);
	gui.add(objPot, "waveEnergy").min(0).max(0.2).step(0.01);
	gui.add(objPot, "speed").min(0).max(100).step(1);
	gui.add(objPot, "probability");
	gui.open();

	sliderW.onChange(function(value) {
		modBarrier();
	});
	sliderE.onChange(function(value) {
		modBarrier();
	})
}

function iniValues(canv) {
	canv.width = window.innerWidth
	canv.height = window.innerHeight
	canv.id = 'canvasId';
	document.body.appendChild(canv); // adds the canvas to the body element
	context = canv.getContext('2d');

	xMax = canv.width*3;
	yMax = canv.height*3;

	psiReal = new Array(xMax+1);
	psiIm = new Array(xMax+1);
	psiNextReal = new Array(xMax+1);
	psiNextIm = new Array(xMax+1);
	psiPrevReal = new Array(xMax+1);
	psiPrevIm = new Array(xMax+1);
	p = new Array(xMax+1);
	dt = 0.45;

}

export function waveFunctionPot(canv, timeouts) {
	let popup = document.getElementById("myPopupEnergy");
  	popup.textContent = 'You can set the energy of the wave function and the barrier above!';
  	renderMathInElement(popup);
	window.clearTimeout(timeouts[0]);
	iniValues(canv);

	resizePot(canv);
	next(canv, timeouts);
}

export function resizePot(canv) {
	xMax = canv.width = window.innerWidth;
	yMax = canv.height = window.innerHeight;

	modBarrier();
	initWave(canv);
}

function modBarrier() {
	for (let i = 0; i <= xMax*3; ++i) p[i] = 0.0;
	let barrierStart = Math.round(xMax/2-objPot.barrierWidth/2);
	for (let i = barrierStart+xMax; i < barrierStart+objPot.barrierWidth+xMax; ++i) p[i] = objPot.barrierEnergy;
}

function next(canv, timeouts) {
	for (let i = 0; i < objPot.speed; ++i) nextValue();
	paintCanvas(canv);
	let id = window.setTimeout(next, 1000/30, canv, timeouts);
	timeouts[0] = id;
}

function nextValue() {
	for (let i = 1; i < xMax*3; ++i) {
		psiNextReal[i] = psiPrevReal[i]+dt*(-psiIm[i+1]-psiIm[i-1]+2*(1+p[i])*psiIm[i]);
		psiNextIm[i] = psiPrevIm[i]-dt*(-psiReal[i+1]-psiReal[i-1]+2*(1+p[i])*psiReal[i]);
	}
	for (let i = 1; i < xMax*3; ++i) {
		psiPrevReal[i] = psiReal[i];
		psiPrevIm[i] = psiIm[i];
		psiReal[i] = psiNextReal[i];
		psiIm[i] = psiNextIm[i];
	}
}

function initWave(canv) {
	let center = xMax+100;
	let k = Math.sqrt(2*objPot.waveEnergy);

	for (let i = 0; i <= xMax*3; ++i) {
		let base = Math.exp(-(i-center)*(i-center)/(49*49));
		psiReal[i] = base * Math.cos(k*i-center);
		psiIm[i] = base * Math.sin(k*i-center);
	}
	for (let i = 1; i < xMax*3; ++i) {
		psiPrevReal[i] = psiReal[i] - dt * (-psiIm[i+1]-psiIm[i-1] + 2*(1+p[i])*psiIm[i]);
		psiPrevIm[i] = psiIm[i] + dt * (-psiReal[i+1]-psiReal[i-1] + 2*(1+p[i])*psiReal[i]);
	}
	paintCanvas(canv);
}

function paintCanvas(canv) {
	context.fillStyle = "#008888";
	context.fillRect(0,0,canv.width,canv.height);

	context.lineWidth = 2;
	let l = (60-objPot.barrierEnergy*100).toString();
	for (let i = 0; i < xMax; ++i) {
		if (p[i+xMax] != 0) {
			context.strokeStyle = "hsl(0,0%,"+l+"%)";
			context.beginPath();
			context.moveTo(i, 0);
			context.lineTo(i, canv.height);		// not optimized
			context.stroke();
		}
	}

	let baselineY, pxPerY;
	let delta = 20;

	if (!objPot.probability) {
		baselineY = yMax*0.5;
		pxPerY = baselineY * 0.8;

		context.strokeStyle = "#c0c0c0";
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(0, baselineY);
		context.lineTo(xMax, baselineY);
		context.stroke();

		context.lineWidth = 2;

		// Plot the real part of psi:
		context.beginPath();
		context.moveTo(0, baselineY - psiReal[xMax]*pxPerY);
		for (let i=1; i<=xMax; i++) {
			context.lineTo(i, baselineY - psiReal[i+xMax]*pxPerY);
		}
		context.strokeStyle = "#ffc000";
		context.stroke();

		// Plot the imaginary part of psi:
		context.beginPath();
		context.moveTo(0, baselineY - psiIm[xMax]*pxPerY);
		for (let i=1; i<=xMax; i++) {
			context.lineTo(i, baselineY - psiIm[i+xMax]*pxPerY);
		}
		context.strokeStyle = "#00d0ff";
		context.stroke();
	}
	else {
		baselineY = yMax * 0.80;
		pxPerY = baselineY * 0.55;

		context.strokeStyle = "#c0c0c0";
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(0, baselineY);
		context.lineTo(xMax, baselineY);
		context.stroke();

		context.lineWidth = 2;
		for (let i = 0; i <= xMax; ++i) {
			context.beginPath();
			context.moveTo(i, baselineY);
			context.lineTo(i, baselineY-pxPerY*(psiReal[i+xMax]*psiReal[i+xMax]+psiIm[i+xMax]*psiIm[i+xMax]));
			context.stroke();
		}
	}
}