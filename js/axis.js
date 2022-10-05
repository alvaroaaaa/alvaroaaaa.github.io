import * as THREE from "../node_modules/three/build/three.module.js"
import {FontLoader} from '../node_modules/three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from '../node_modules/three/examples/jsm/geometries/TextGeometry.js';

export function axis(xMin, xMax, yMin, yMax, zMin, zMax, scene, scale) {
	let px =  new Float32Array(6);
	px[0] = xMin;
	px[3] = xMax;
	px[1] = px[2] = px[4] = px[5] = 0;

	let py = new Float32Array(6);
	py[1] = yMin;
	py[4] = yMax;
	py[0] = py[2] = py[3] = py[5] = 0;

	let pz = new Float32Array(6);
	pz[2] = zMin;
	pz[5] = zMax;
	pz[0] = pz[1] = pz[3] = pz[4] = 0;
	
	
	let xGeom = new THREE.BufferGeometry();
	let yGeom = new THREE.BufferGeometry();
	let zGeom = new THREE.BufferGeometry();

	xGeom.setAttribute( 'position', new THREE.BufferAttribute( px, 3 ) );
	yGeom.setAttribute( 'position', new THREE.BufferAttribute( py, 3 ) );
	zGeom.setAttribute( 'position', new THREE.BufferAttribute( pz, 3 ) );

	const materialRed = new THREE.MeshBasicMaterial( {color: 0xff0000 , transparent: true, opacity: 0.6} );
	const materialGreen = new THREE.MeshBasicMaterial( {color: 0x00b000 , transparent: true, opacity: 0.6} );
	const materialBlue = new THREE.MeshBasicMaterial( {color: 0x0000ff , transparent: true, opacity: 0.6} );

	let xLine = new THREE.LineSegments(xGeom, materialRed);
	let yLine = new THREE.LineSegments(yGeom, materialGreen);
	let zLine = new THREE.LineSegments(zGeom, materialBlue);

	scene.add(xLine); scene.add(yLine); scene.add(zLine);

	for (let i = 0; i <= xMax-xMin; i += scale) {
		let geometryCil = new THREE.CylinderGeometry(.05*scale, .05*scale, .025*scale, 32);
		geometryCil.rotateZ(Math.PI/2);
		geometryCil.translate(xMin+i, 0, 0);
		let cil = new THREE.Mesh(geometryCil, materialRed);
		scene.add(cil);
	}

	for (let i = 0; i <= yMax-yMin; i += scale) {
		let geometryCil = new THREE.CylinderGeometry(.05*scale, .05*scale, .025*scale, 32);
		geometryCil.translate(0, yMin+i, 0);
		let cil = new THREE.Mesh(geometryCil, materialGreen);
		scene.add(cil);
	}

	for (let i = 0; i <= zMax-zMin; i += scale) {
		let geometryCil = new THREE.CylinderGeometry(.05*scale, .05*scale, .025*scale, 32);
		geometryCil.rotateX(Math.PI/2);
		geometryCil.translate(0, 0, zMin+i);
		let cil = new THREE.Mesh(geometryCil, materialBlue);
		scene.add(cil);
	}

	let loader = new FontLoader();
	loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

		for (let i = 0; i <= xMax-xMin; i += scale) {
			let textGeometry = new TextGeometry( (xMin+i).toString(), {
				font: font,
				size: 0.15*scale,
				height: 0.05*scale,
				curveSegments: 12
			} );
			textGeometry.rotateX(Math.PI/2);
			textGeometry.translate(xMin-0.077*scale+i, 0.015*scale, -0.225*scale);
			let mesh = new THREE.Mesh( textGeometry, materialRed );
			scene.add(mesh);
		}

		for (let i = 0; i <= yMax-yMin; i += scale) {
			let textGeometry = new TextGeometry( (yMin+i).toString(), {
				font: font,
				size: 0.15*scale,
				height: 0.05*scale,
				curveSegments: 12
			} );
			textGeometry.rotateX(Math.PI/2);
			textGeometry.rotateZ(-Math.PI/2);
			textGeometry.translate(-0.077*scale, yMin+i+0.015*scale, -0.225*scale);
			let mesh = new THREE.Mesh( textGeometry, materialGreen );
			scene.add(mesh);
		}

		for (let i = 0; i <= zMax-zMin; i += scale) {
			let textGeometry = new TextGeometry( (zMin+i).toString(), {
				font: font,
				size: 0.15*scale,
				height: 0.05*scale,
				curveSegments: 12
			} );
			textGeometry.rotateX(Math.PI/2);
			textGeometry.translate(-0.17*scale*2, 0.015*scale, -0.07*scale+zMin+i);
			let mesh = new THREE.Mesh( textGeometry, materialBlue );
			scene.add(mesh);
		}
	});
}