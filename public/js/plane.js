import * as THREE from 'three'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'

export class Plane {
    constructor(three) {
        this.plane = this.createPlane(three);
    }

    createPlane(three) {
        var textureLoader = new THREE.TextureLoader();
        var grassTexture = textureLoader.load("../resource/textures/terrians/grass1.jpg");
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(10, 10);

        //Create geometry, material
        const planeGeometry = new THREE.PlaneGeometry(500, 500);
        const planeMaterial = new THREE.MeshLambertMaterial({
            color: '#e6cb00', map: grassTexture
        });

        //Mesh 
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.setPosition(plane);
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        return plane;

    }

    //Set position
    setPosition(object) {
        object.rotation.x = -.5 * Math.PI;
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 0;
    }

    animate() {
        this.plane.rotation.z += 0.01
    }
}