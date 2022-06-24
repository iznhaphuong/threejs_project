import * as THREE from 'three';
import { GLTFLoader } from '/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from '/jsm/loaders/FBXLoader.js'
import { Box3, Vector3 } from 'three';

export class ModelLoader {
    static load(temp, path, xyz, scaleParam) {

        if (path.includes('glb') || path.includes('gltf')) {
            this.loadGLTF(scene, path, xyz, scaleParam)
        } else if (path.includes('fbx')) {
            console.log('fbx');
        }
    }

    static loadGLTF(temp, path, xyz, scaleParam) {
        // Instantiate a loader
        const loader = new GLTFLoader();
        // let mixer = new AnimationMixer();
        // Load a glTF resource
        loader.load(
            // resource URL
            '../resource/models/' + path,
            // called when the resource is loaded
            function (gltf) {
                
                gltf.scene.traverse( function( node ) {

                    if ( node.type === 'Mesh' ) { node.castShadow = true; }
            
                } );
               
                const object = gltf.scene;
                
                //setup center values
                let bbox = new Box3().setFromObject(object);
                let cent = bbox.getCenter(new Vector3());
                let size = bbox.getSize(new Vector3());
                let maxAxis = Math.max(size.x, size.y, size.z);
                
                let scale = 1.0;
                //scale object
                if (scaleParam >= 0) {
                    scale = scaleParam;
                }

                object.scale.multiplyScalar(scale / maxAxis);
                bbox.setFromObject(object);
                bbox.getCenter(cent);
                bbox.getSize(size);

                if (!Array.isArray(xyz) || xyz.length < 3) {
                    //center object 
                    object.position.x -= cent.x;
                    object.position.y -= cent.y;
                    object.position.z -= cent.z;
                } else {
                    //custom set object position 
                    object.position.x -= xyz[0];
                    object.position.y -= xyz[1];
                    object.position.z -= xyz[2];
                }
                object.name = path
                
                temp.add(object);
            },
            // called while loading is progressing
            function (xhr) {
                console.log(path + (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // called when loading has errors
            function (error) {
                console.log('An error happened');

            }
        );
    }

    static loadFBX(scene, path, animPath) {
        // Instantiate a loader
        const loader = new FBXLoader();
        // let mixer = new AnimationMixer();

        // Load a fbx resource
        loader.load(
            // resource URL
            path,
            // called when the resource is loaded
            function (fbx) {
                fbx.scale.setScalar(0.1);
                fbx.traverse(c => {
                    c.castShadow = true;
                })
                const anim = new FBXLoader();
                // anim.setPath(animPath);
                anim.load(animPath, (anim) => {
                    this.mixer =  new THREE.AnimationMixer(fbx);

                    const idle = this.mixer.clipAction(anim.animations[0]);
                    idle.play();
                });
                // setupAnimation(fbx);
                scene.add(fbx);
            },

            // called while loading is progressing
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },

            // called when loading has errors
            function (error) {
                console.log('An error happened');
            }

        );
    }
    static setupAnimation(object) {
        this.mixer = new AnimationMixer(object);
        const clip = object.animations[0];
        const action = this.mixer.clipAction(clip);
        action.play();

    }
}

