import * as THREE from 'three';
import { OrbitControls } from '/jsm/controls/OrbitControls.js'
import { FBXLoader } from '/jsm/loaders/FBXLoader.js';

export class Monster {

    static async loadModel(scene) {
        const clock = new THREE.Clock();
        const fbxLoader = new FBXLoader();
        fbxLoader.setPath('../resource/models/character/');
        fbxLoader.load('characterLola.fbx', (fbx) => {
            fbx.scale.setScalar(0.1);
            fbx.traverse(c => {
                c.castShadow = true;
            })
            fbx.position.z = -10;
            console.log(fbx);
            // const params = {
            //     target: fbx,
            //     camera: this.camera,
            // }
            this.mixers =[];
            const anim = new FBXLoader();
            anim.setPath('../resource/models/monster/');
            anim.load('hip_hop_dancing.fbx',
                function (anim) {
                    const m = new THREE.AnimationMixer(fbx);
                    mixers.push(m);
                    console.log(anim.animations[0]);
                    const idle = m.clipAction(anim.animations[0]);
                    idle.play();

                },
                // onProgress callback
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },

                // onError callback
                function (err) {
                    console.log('An error happened'+ err);
                }

            ),

            scene.add(fbx);
        })
    }



}




