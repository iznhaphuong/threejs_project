import * as THREE from 'three'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'

export class Plane {
    constructor() {
        this.plane = this.createPlane();
    }

    createPlane() {
        var textureLoader= new THREE.TextureLoader();
        var grassTexture=textureLoader.load("../resource/textures/terrians/grass1.jpg");
        grassTexture.wrapS=THREE.RepeatWrapping;
        grassTexture.wrapT=THREE.RepeatWrapping;
        grassTexture.repeat.set(10,10);

        //Create geometry, material
        const planeGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
        const planeMaterial = new THREE.MeshLambertMaterial ({
            color: '#e6cb00', map: grassTexture
        });

        
        //Set opacity to material
        // planeMaterial.opacity = 0.5; // k hien thi, phải thêm transparent bằng true
        // planeMaterial.transparent = true;

        //Mesh 
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.setPosition(plane);
        plane.receiveShadow = true;

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