import * as THREE from 'three';
import { FBXLoader } from '/jsm/loaders/FBXLoader.js';
import { Box3, Vector3 } from 'three';
export class Monster {

    static async loadModel(scene, mixers, xyz,scale) {
        const clock = new THREE.Clock(); 
        const fbxLoader = new FBXLoader();
        fbxLoader.setPath('../resource/models/character/main_character');
        fbxLoader.load('guard.fbx', (fbx) => {
            
            fbx.traverse(c => {
                c.castShadow = true;
            })
            //setup center values
            let bbox = new Box3().setFromObject(fbx);
            let cent = bbox.getCenter(new Vector3());
            let size = bbox.getSize(new Vector3());
            let maxAxis = Math.max(size.x, size.y, size.z);
            fbx.scale.setScalar(scale/maxAxis);
            bbox.setFromObject(fbx);
            bbox.getCenter(cent);
            bbox.getSize(size);

            if (!Array.isArray(xyz) || xyz.length < 3) {
                //center object 
                fbx.position.x -= cent.x;
                fbx.position.y -= cent.y;
                fbx.position.z -= cent.z;
            } else {
                //custom set object position 
                fbx.position.x -= xyz[0];
                fbx.position.y -= xyz[1];
                fbx.position.z -= xyz[2];
            }
            // fbx.position.z = -10;
            console.log(fbx);
            // const params = {
            //     target: fbx,
            //     camera: this.camera,
            // }
            const anim = new FBXLoader();
            anim.setPath('../resource/models/monster/');
            anim.load('hip_hop_dancing.fbx',
                function (anim) {
                    const mixer = new THREE.AnimationMixer(fbx);

                    console.log(mixer);
                    mixers.push(mixer);
                    console.log(anim.animations[0]);
                    const idle = mixer.clipAction(anim.animations[0]);
                    activateAllActions();
                    idle.play();

                },
                // onProgress callback
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },

                // onError callback
                function (err) {
                    console.log('An error happened' + err);
                }

            ),

                scene.add(fbx);
        })
    }



}




