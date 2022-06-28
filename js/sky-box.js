import * as THREE from 'three'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'

export class SkyBox {
    constructor(landscape) {
        this.skybox = this.createSkyBox(landscape);
    }

    createSkyBox(landscape) {
        const orders = [
            landscape + '_ft', // right - phải
            landscape + '_bk', // left - trái
            landscape + '_up', // top - trên
            landscape + '_dn', // bottom - dưới
            landscape + '_rt', // front - trước
            landscape + '_lf' // back - sau
        ];

        const images = orders.map(fileName => {
            return `../resource/textures/skybox-${landscape}/${fileName}.png`;
        });

        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const cubeSkyBox = cubeTextureLoader.load(images); // .setPath('')
        return cubeSkyBox;
    }

    //Set position
    setPosition(object) {
        // object.rotation.x = -.5 * Math.PI;
        // object.position.x = 0;
        // object.position.y = 0;
        // object.position.z = 0;
    }

    animate() {
        this.plane.rotation.z += 0.01
    }
}