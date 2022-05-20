import * as THREE from 'three'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'

export class Plane {
    constructor() {
        this.plane = this.createPlane();
    }

    createPlane() {
        //Create geometry, material
        const planeGeometry = new THREE.PlaneGeometry(30, 20, 1, 1);
        const planeMaterial = new THREE.MeshBasicMaterial({
            // color: 0xDDDDDDD
            color: new THREE.Color('rgb(106, 193, 116)')
        });

        //Set opacity to material
        planeMaterial.opacity = 0.4; // không ăn, phải thêm transparent bằng true
        planeMaterial.transparent = true;

        //Mesh 
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.setPosition(plane);
        return plane;
    }
    
    //Set position
    setPosition(object) {
        object.rotation.x = -0.5 * Math.PI;
        object.position.x = 0;
        object.position.y = -5;
        object.position.z = 0;
    }

    animate() {
        this.plane.rotation.z += 0.01
    }
}