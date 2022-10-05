import * as THREE from "../node_modules/three/build/three.module.js"
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js';
import { CSS2DRenderer, CSS2DObject } from '../node_modules/three/examples/jsm/renderers/CSS2DRenderer.js';

import {axis} from './axis.js'

import { iniValuesInf, waveFunctionInf, iniGuiInf, setCameraAutoInf } from './infiniteWell.js'
import { iniValuesHarm, waveFunctionHarm, iniGuiHarm, setCameraAutoHarm } from './harmonicOscillator.js'
import { iniValuesHydr, waveFunctionHydr, iniGuiHydr, setCameraAutoHydr } from './hydrogen.js'
import { iniValuesPot, waveFunctionPot, iniGuiPot, resizePot } from './potentialBarrier.js'

let canv = document.createElement('canvas');
canv.id = 'canvasId'

let myButtonEnergy = document.getElementById('myButtonEnergy');
myButtonEnergy.onclick = function() {
	let popup = document.getElementById("myPopupEnergy");	
	popup.classList.toggle("show");
}

let myButtonInfo = document.getElementById('myButtonInfo');
myButtonInfo.onclick = function() {
	let popup = document.getElementById("myPopupInfo");	
	popup.classList.toggle("show");
}

let canvB = false;
let axisB = {
	Show_Axis: true
};

window.addEventListener("resize", () => {
	if (canvB) resizePot(canv);
	onWindowResize();
});

function clearScene(sceneFunc) {
	while(sceneFunc.children.length > 0) {
		sceneFunc.remove(sceneFunc.children[0]); 
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	//labelRenderer.setSize( window.innerWidth, window.innerHeight );
}

let scene = new THREE.Scene();
let sceneAxis = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.add( new THREE.SpotLight() );
let mesh = [undefined];
let timeouts = [undefined];

let gui = new dat.GUI();
//let customContainer = document.getElementById('my-gui-container');
//customContainer.appendChild(gui.domElement);

let refreshInf = {
	setCameraAuto: function() {setCameraAutoInf(controls, camera)},
	refresh: function() {waveFunctionInf(scene, mesh); }
}

let refreshHarm = {
	setCameraAuto: function() {setCameraAutoHarm(controls, camera)},
	refresh: function() {waveFunctionHarm(scene, mesh); }
}

let refreshHydr = {
	setCameraAuto: function() {setCameraAutoHydr(controls, camera)},
	refresh: function() {waveFunctionHydr(scene, mesh, sceneAxis); }
}

let refreshPot = {
	refresh: function() {waveFunctionPot(canv, timeouts); }
}

let modelFunctions = {
	Infinite_Well: function() {iniInfiniteWell(); },
	Harmonic_Oscillator: function() {iniHarmonicOscillator(); },
	Hydrogen_Atom: function() {iniHydrogenAtom(); },
	Potential_Barrier: function() {iniPotentialBarrier(); }
}

scene.add(camera);
camera.position.set(1.5,-1.5-7/1.5,3);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.id = 'rendererId';
renderer.autoClear = false;
document.body.appendChild( renderer.domElement );

//const axesHelper = new THREE.AxesHelper( 6 );
//scene.add( axesHelper );

//scene.add(line);

renderer.setClearColor( 0x8888, 1 );

let controls = new OrbitControls( camera, renderer.domElement );
controls.target = new THREE.Vector3(1.5,1.5,0.5);

iniInfiniteWell(scene);

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	renderer.clear();
	renderer.render( scene, camera );
	//labelRenderer.render( scene, camera );
	renderer.clearDepth();
	if (axisB.Show_Axis) renderer.render( sceneAxis, camera );
	//labelRenderer.render( scene, camera );
};

function iniInfiniteWell() {
	if (canvB) {
		document.body.appendChild(renderer.domElement);
		document.body.removeChild(canv);
		canvB = false;
	}

	clearScene(sceneAxis);
	axis(-3,6,-3,6,0,6,sceneAxis,1);

	gui.destroy();
	gui = new dat.GUI();
	let folderParameters = gui.addFolder("Parameters");
	let folderModels = gui.addFolder("Models");
	addModels(folderModels);
	iniValuesInf();
	iniGuiInf(folderParameters);
	waveFunctionInf(scene, mesh);
	setCameraAutoInf(controls, camera);
	gui.add(refreshInf, 'refresh');
	gui.add(refreshInf, 'setCameraAuto');
	gui.add(axisB, 'Show_Axis');
}

function iniHarmonicOscillator() {
	if (canvB) {
		document.body.appendChild(renderer.domElement);
		document.body.removeChild(canv);
		canvB = false;
	}

	clearScene(sceneAxis);
	axis(-3,6,-3,6,0,6,sceneAxis,1);

	gui.destroy();
	gui = new dat.GUI();
	let folderParameters = gui.addFolder("Parameters");
	let folderModels = gui.addFolder("Models");
	addModels(folderModels);
	iniValuesHarm();
	iniGuiHarm(folderParameters);
	waveFunctionHarm(scene, mesh);
	setCameraAutoHarm(controls, camera)
	gui.add(refreshHarm, 'refresh');
	gui.add(refreshHarm, 'setCameraAuto');
	gui.add(axisB, 'Show_Axis');
}

function iniHydrogenAtom() {
	if (canvB) {
		document.body.appendChild(renderer.domElement);
		document.body.removeChild(canv);
		canvB = false;
	}

	gui.destroy();
	gui = new dat.GUI();
	let folderParameters = gui.addFolder("Parameters");
	let folderModels = gui.addFolder("Models");
	addModels(folderModels);
	iniValuesHydr();
	iniGuiHydr(folderParameters);
	waveFunctionHydr(scene, mesh, sceneAxis);
	setCameraAutoHydr(controls, camera);
	gui.add(refreshHydr, 'refresh');
	gui.add(refreshHydr, 'setCameraAuto');
	gui.add(axisB, 'Show_Axis');
}

function iniPotentialBarrier() {
	if (!canvB) {
		document.body.removeChild(renderer.domElement);
		document.body.appendChild(canv);
		canvB = true;
	}
	gui.destroy();
	gui = new dat.GUI();
	let folderParameters = gui.addFolder("Parameters");
	let folderModels = gui.addFolder("Models");
	addModels(folderModels);
	iniValuesPot();
	iniGuiPot(folderParameters);
	waveFunctionPot(canv, timeouts);
	gui.add(refreshPot, 'refresh'); 
	gui.add(axisB, 'Show_Axis');
}

function addModels(folder) {
	folder.add(modelFunctions, 'Infinite_Well');
	folder.add(modelFunctions, 'Harmonic_Oscillator');
	folder.add(modelFunctions, 'Hydrogen_Atom')
	folder.add(modelFunctions, 'Potential_Barrier');
	folder.open();
}

animate();