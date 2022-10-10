import * as THREE from "../node_modules/three/build/three.module.js"
import { ParametricGeometry } from '../node_modules/three/examples/jsm/geometries/ParametricGeometry.js'
import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js';

let segments = 200;
let electronM = 9.109383701528e-31;
let planck = 1.054571817e-34;
let jtoev = 6.2415093433e+18;

let objInf = {
	L:  3,
	nx: 3,
	ny: 3,
	probability: false
};

export function iniValuesInf () {
	objInf.L = 3;
	objInf.nx = 3;
	objInf.ny = 3;
	objInf.probability = false;
}

export function iniGuiInf(gui) {
	gui.add(objInf, "nx").min(1).max(5).step(1);
	gui.add(objInf, "ny").min(1).max(5).step(1);
	gui.add(objInf, "L").min(1).max(5).step(0.25).name('L (m)');
	gui.add(objInf, "probability");
	gui.open();
}

export function setCameraAutoInf(controls, camera) {
	controls.target = new THREE.Vector3(objInf.L/2, objInf.L/2, 0.5);
	camera.position.set(objInf.L/2, -objInf.L-7/objInf.L, objInf.L);
}

export function waveFunctionInf(scene, mesh) {

	computeEnergy();

	let xMin = 0, xMax = objInf.L, xRange = xMax - xMin,
	yMin = 0, yMax = objInf.L, yRange = yMax - yMin,
	zMin, zMax, zRange;

	var func;

	if (!objInf.probability) {
		func = function(x,y,target) {
			x = xRange * x + xMin;
			y = yRange * y + yMin;
			let z = 2/objInf.L*Math.sin((objInf.nx*Math.PI*x)/objInf.L)*Math.sin((objInf.ny*Math.PI*y)/objInf.L);
	        target.set(x, y, z);
    	}
	}

	else {
		func = function(x,y,target) {
			x = xRange * x + xMin;
			y = yRange * y + yMin;
			let z = 2/objInf.L*Math.sin((objInf.nx*Math.PI*x)/objInf.L)*Math.sin((objInf.ny*Math.PI*y)/objInf.L);
			z = z*z;
	        target.set(x, y, z);
	    }
	}

	let geometry = new ParametricGeometry( func, segments, segments, true );
	geometry.computeBoundingBox();

	zMin = geometry.boundingBox.min.z;
	zMax = geometry.boundingBox.max.z;
	zRange = zMax - zMin;

	var material = new THREE.ShaderMaterial({
  uniforms: {
    zMax: {
      value: zMax
    },
    zRange: {
      value: zRange
    }
  },
  vertexShader: `
    uniform float zMax;
    uniform float zRange;
  
    varying vec3 color;

    float hue2rgb(float p, float q, float t) {

		  if (t < 0.) 
		    t += 1.;
		  if (t > 1.) 
		    t -= 1.;
		  if (t < 1./6.) 
		    return p + (q - p) * 6. * t;
		  if (t < 1./2.) 
		    return q;
		  if (t < 2./3.)   
		    return p + (q - p) * (2./3. - t) * 6.;
		    
		  return p;
		  
		}

    void main() {
    	float h = 0.7*(zMax-position.z)/zRange;
    	float s = 1.;
    	float l = 0.5;

    	float q = l < 0.5 ? l * (1. + s) : l + s - l * s;
    	float p = 2. * l - q;
      color = vec3(hue2rgb(p,q,h+1./3.), hue2rgb(p,q,h), hue2rgb(p,q,h-1./3.));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    varying vec3 color;
    
    void main() {
      
      gl_FragColor = vec4(color,1.0);
    }
  `,
  side: THREE.DoubleSide
});

	if (mesh[0]) 
	{
		scene.remove( mesh[0] );
	}	

	mesh[0] = new THREE.Mesh( geometry, material );
	scene.add(mesh[0]);
}

function computeEnergy() {
	let popup = document.getElementById("myPopupEnergy");
	let energyx = (objInf.nx*objInf.nx*Math.PI*Math.PI*planck*planck)/(2*electronM*objInf.L*objInf.L);
	let energyxPrec = energyx.toPrecision(3);
	let energyy = (objInf.ny*objInf.ny*Math.PI*Math.PI*planck*planck)/(2*electronM*objInf.L*objInf.L);
	let energyyPrec = energyy.toPrecision(3);
	let energyTotal = energyy+energyx;
	let energyTotalEV = energyTotal*jtoev;
	let energyTotalPrec = energyTotal.toPrecision(3);
	let energyTotalEVPrec = energyTotalEV.toPrecision(3);
	let sum = energyTotalPrec + ' J = '+energyxPrec+' + '+energyyPrec + ' = ' + energyTotalEVPrec + ' eV';
	console.log(popup)
	popup.textContent = '$$E_n = {n^{2}\\pi^{2}\\hbar^{2} \\over 2mL^{2}}$$ $$E_{total} = E_{nx} + E_{ny}$$'+sum;
	renderMathInElement(popup);

	let popupText = document.getElementById("myPopupInfo");
	popupText.textContent = "The infinite well model describes a particle free to move in a small space surrounded by impenetrable barriers. For the computations, we assumed the particle is an electron."
}
