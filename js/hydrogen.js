import * as THREE from "../node_modules/three/build/three.module.js"
import { TDSLoader } from '../node_modules/three/examples/jsm/loaders/TDSLoader.js';

import {axis} from './axis.js'

let electronM = 9.109383701528e-31;
let planck = 1.054571817e-34;
let electronC = 1.602176634e-19;
let vacuum = 8.854187812813e-12;
let jtoev = 6.2415093433e+18;

let objHydr = {
  n:  1,
  l: 0,
  m: 0,
  probability: false
};

function clearScene(sceneFunc) {
  while(sceneFunc.children.length > 0) {
    sceneFunc.remove(sceneFunc.children[0]); 
  }
}

export function iniValuesHydr() {
  objHydr.n = 1;
  objHydr.l = 0;
  objHydr.m = 0;
  objHydr.probability = false;
}

let spriteMap = new THREE.TextureLoader().load( 'js/circle.png' );

function load(scene, mesh) {
	const loader = new TDSLoader( );
        let m = (objHydr.m).toString();
        if (m[0] == '-') m = m.substring(1);
				loader.load( 'models/waveFunction/'+objHydr.n+objHydr.l+m+'Hydrogen.3ds', function ( object ) {
          if (mesh[0]) scene.remove(mesh[0]);
          mesh[0] = object;
          scene.add(mesh[0]);

				} );

}

export function setCameraAutoHydr(controls, camera) {
  controls.target = new THREE.Vector3(0,0,0);
  camera.position.set(0,-10-Math.pow(2.5,objHydr.n),0);
    switch(objHydr.n) {
    case 2:
      camera.position.set(0,-17,0);
      break;
    case 3:
      camera.position.set(0,-30,0);
      break;
    case 4:
      camera.position.set(0,-55,0);
      break;
    case 5:
      camera.position.set(0,-87,0);
      break;
    case 6:
      camera.position.set(0,-120,0);
      break;
    default:
      camera.position.set(0,-7,0);
  }
}

export function iniGuiHydr(gui) {
  let sliderN = gui.add(objHydr, "n").min(1).max(6).step(1);
  let sliderL = gui.add(objHydr, "l").min(0).max(0).step(1);
  let sliderM = gui.add(objHydr, "m").min(0).max(0).step(1);
  gui.add(objHydr, "probability");
  gui.open();

  sliderL.onChange(function(value) {
    gui.__controllers[2].min(-objHydr.l).max(objHydr.l).updateDisplay();
  });
  sliderN.onChange(function(value) {
    if (objHydr.n <= objHydr.l) {
      gui.__controllers[1].setValue(0);
      gui.__controllers[1].max(objHydr.n-1).updateDisplay();
      gui.__controllers[2].setValue(0).updateDisplay();
      gui.__controllers[2].min(0).max(0).updateDisplay();
    }
    else gui.__controllers[1].max(objHydr.n-1).updateDisplay();
  })

}
function createPointCloud(points, values, scene, mesh) {
  console.log(points.length);
  let geometry = new THREE.BufferGeometry();
  let uniforms = {
        color: { value: new THREE.Color( 0xffffff ) },
        texture: { value: spriteMap },
        n: {value: objHydr.n}
    };
    let material = new THREE.ShaderMaterial({
        uniforms:       uniforms,

  vertexShader: `
      attribute float alpha;
      varying float vAlpha;
      uniform float n;
      void main() {

          vAlpha = alpha;

          vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

          gl_PointSize = n*n*5.0 / length( mvPosition.xyz );

          gl_Position = projectionMatrix * mvPosition;

      }

  `,
  fragmentShader: `

      uniform vec3 color;
      uniform sampler2D texture;

      varying float vAlpha;

      void main() {

          gl_FragColor = vec4( color, vAlpha );
          gl_FragColor = gl_FragColor;

      }
  `,
        transparent:    true,
        depthTest: false
    });
// * texture2D(texture, gl_PointCoord)
    let positions = new Float32Array(points.length*3);
    let alphas = new Float32Array(points.length);

    console.log(points.length);

    for(let i in points){
      positions[i*3] = points[i].x;
      positions[i*3+1] = points[i].y;
      positions[i*3+2] = points[i].z;

      alphas[i] = values[i];
    }

    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

    if (mesh[0]) scene.remove(mesh[0]);
    mesh[0] = new THREE.Points(geometry, material);
    scene.add(mesh[0]);
}

export function waveFunctionHydr(scene, mesh, sceneAxis) {

  computeEnergy();

  clearScene(sceneAxis);
//define axis
  console.log("?????????")
  switch(objHydr.n) {
    case 2:
      axis(-6,6,-6,6,-6,6,sceneAxis,2);
      break;
    case 3:
      axis(-12,12,-12,12,-12,12,sceneAxis,3);
      break;
    case 4:
      axis(-22,22,-22,22,-22,22,sceneAxis,4);
      break;
    case 5:
      axis(-35,35,-35,35,-35,35,sceneAxis,5);
      break;
    case 6:
      axis(-45,45,-45,45,-45,45,sceneAxis,6);
      break;
    default:
      console.log("wtf");
      axis(-2,2,-2,2,-2,2,sceneAxis,1);
  }

  if (!objHydr.probability) {
    load(scene, mesh);
  }
  else {
    let pointstxt;
    let m = (objHydr.m).toString();
    if (m[0] == '-') m = m.substring(1);
    let name = objHydr.n.toString()+objHydr.l.toString()+m;
    fetch('models/probability/'+name+'HydrogenP.txt')
        .then(response => response.text())
        .then((data) => {
          let values = [];
          let points = [];
          pointstxt = data.replace(/{/g,',').split(',');
          pointstxt.shift();
          for (let i = 0; i < pointstxt.length; ++i) {
            points.push({x: parseFloat(pointstxt[i].replace(/[^0-9.\-]/g, '')), y: parseFloat(pointstxt[++i].replace(/[^0-9.\-]/g, '')), z: parseFloat(pointstxt[++i].replace(/[^0-9.\-]/g, ''))});
            values.push(parseFloat(pointstxt[++i].replace(/[^0-9.\-]/g, '')));
          }
          let positions = [];
          let alphas = [];

          let max = 0;
          let imax = 0;
          for(let i in values){
            if(values[i] > max) {
              max = values[i]
              imax = i;
            }          
          }
          for(let i in values){
            values[i] = values[i]/max;
            if(values[i] > 0.02){
              positions.push(points[i]);
              alphas.push(values[i]);
            }
          }
          console.log(positions);
          createPointCloud(positions, alphas, scene, mesh);
        });

  }
}

function computeEnergy() {
  let popup = document.getElementById("myPopupEnergy");
  let energy = -((electronM*Math.pow(electronC,4))/(2*4*Math.PI*vacuum*4*Math.PI*vacuum*planck*planck))*(1/objHydr.n)
  let energyString = "$$E_n = "+energy.toPrecision(3)+"\\:J = $$"
  popup.textContent = '$$E_n = -({m_ee^{4}\\over 2(4\\pi\\varepsilon_0)\\hbar^{2}})({1 \\over n^{2}})$$ $$m_e = electron\\: mass$$ $$e = electron\\: charge$$ $$\\varepsilon_0 = vacuum\\: permittivity$$'+energyString+(energy*jtoev).toPrecision(4)+' eV';
  renderMathInElement(popup);

  let popupText = document.getElementById("myPopupInfo");
  popupText.textContent = "A hydrogen atom is an atom of the chemical element hydrogen. The electrically neutral atom contains a single positively charged proton and a single negatively charged electron bound to the nucleus by the Coulomb force.";
}