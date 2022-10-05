import * as THREE from "../node_modules/three/build/three.module.js"
import { ParametricGeometry } from '../node_modules/three/examples/jsm/geometries/ParametricGeometry.js'
import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js';

let segments = 200;

let planck = 6.62607015e-34;
let alpha = 3;

var objHarm = {
	nx: 0,
	ny: 0,
	probability: false
};

export function iniValuesHarm () {
	objHarm.nx = 3;
	objHarm.ny = 3;
	objHarm.probability = false;
}

export function iniGuiHarm(gui) {
	gui.add(objHarm, "nx").min(0).max(4).step(1);
	gui.add(objHarm, "ny").min(0).max(4).step(1);
	gui.add(objHarm, "probability");
	gui.open();
}

function normhermitepoly( n, x ) {
	if (n == 0) return 1;
	if (n == 1) return 2*x;
	return 2*x*normhermitepoly(n-1,x)-2*(n-1)*normhermitepoly(n-2,x);
}

function sFact(num)
{
    let rval=1;
    for (let i = 2; i <= num; i++)
        rval = rval * i;

    return rval;
}

export function setCameraAutoHarm(controls, camera) {
	controls.target = new THREE.Vector3(0, 0, 0.5);
	camera.position.set(0,-2.7*2.5, 4);
}

export function waveFunctionHarm(scene, mesh) {

	computeEnergy();

	var xMin = -2.7, xMax = 2.7, xRange = xMax - xMin,
	yMin = -2.7, yMax = 2.7, yRange = yMax - yMin,
	zMin, zMax, zRange;

	var func;

	//http://hyperphysics.phy-astr.gsu.edu/hbase/quantum/hosc5.html

	if (!objHarm.probability) {
		func = function(x,y,target) {
			x = xRange * x + xMin;
			y = yRange * y + yMin;
      let fx = (Math.pow(alpha/Math.PI, 1/4))*(1/Math.sqrt(Math.pow(2,objHarm.nx)*sFact(objHarm.nx)))*normhermitepoly(objHarm.nx,Math.pow(alpha, 1/2)*x)*(Math.pow(Math.E, -(alpha*x*x/2)));
      let fy = (Math.pow(alpha/Math.PI, 1/4))*(1/Math.sqrt(Math.pow(2,objHarm.ny)*sFact(objHarm.ny)))*normhermitepoly(objHarm.ny,Math.pow(alpha, 1/2)*y)*(Math.pow(Math.E, -(alpha*y*y/2)));
      let result = fx*fy;
      target.set(x, y, result);
    	}
	}

	else {
		func = function(x,y,target) {
			x = xRange * x + xMin;
			y = yRange * y + yMin;
			let fx = (Math.pow(alpha/Math.PI, 1/4))*(1/Math.sqrt(Math.pow(2,objHarm.nx)*sFact(objHarm.nx)))*normhermitepoly(objHarm.nx,Math.pow(alpha, 1/2)*x)*(Math.pow(Math.E, -(alpha*x*x/2)));
      let fy = (Math.pow(alpha/Math.PI, 1/4))*(1/Math.sqrt(Math.pow(2,objHarm.ny)*sFact(objHarm.ny)))*normhermitepoly(objHarm.ny,Math.pow(alpha, 1/2)*y)*(Math.pow(Math.E, -(alpha*y*y/2)));

      let result = fx*fy;
			result = result*result;
      target.set(x, y, result);
	   }
	}

	let geometry = new ParametricGeometry( func, segments, segments, true );
    geometry.computeBoundingBox();

	zMin = geometry.boundingBox.min.z;
	zMax = geometry.boundingBox.max.z;
	zRange = zMax - zMin;

	let material = new THREE.ShaderMaterial({
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
	let omega = Math.PI*2*100;
	let energyx = (objHarm.nx+0.5)*planck*omega;
	let energyy = (objHarm.ny+0.5)*planck*omega;

	let energyxPrec = energyx.toPrecision(3);
	let energyyPrec = energyy.toPrecision(3);

	let energyTotal = energyy+energyx;
	let energyTotalPrec = energyTotal.toPrecision(3);
	let sum = energyTotalPrec + ' J = '+energyxPrec+' + '+energyyPrec;

	popup.textContent = '$$E_n = (n + {1 \\over 2})\\hbar\\omega$$ $$\\omega = 2\\pi frequency$$ $$E_{total} = E_{nx} + E_{ny}$$'+sum;
	renderMathInElement(popup);
}
