import * as THREE from 'three'
// import { OBJLoader } from '/jsm/loaders/OBJLoader.js'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'
import { ObjectLoader } from '/src/loaders/ObjectLoader.js'

// export class Fox {
//     constructor() {
//         this.fox = this.createPlane();
//     }

//     createObject() {
//         var loader = new THREE.ObjectLoader();

//         loader.load(
//             //model here
//             '/public/resource/models/teapot/teapot-claraio.json',
//             function (object) {
//                 scene.add(object);
//             }
//         );
//     }
//     setLight() {
//         var light = new THREE.DirectionalLight(0xffffff);
//         light.position.set(1, 1, 1);
//     }
//     //Set position
//     setPosition(object) {
//         object.rotation.x = -0.5 * Math.PI;
//         object.position.x = 0;
//         object.position.y = 1;
//         object.position.z = 0;
//     }

//     animate() {
//         this.plane.rotation.z += 0.01
//     }
// }