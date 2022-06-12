import { GLTFLoader } from '/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from '/jsm/loaders/FBXLoader.js'
import { Box3, Vector3 } from 'three';

export class ModelLoader {
    static load(scene, path, xyz) {
        if (path.includes('glb') || path.includes('gltf')) {
            console.log('gltf');
            this.loadGLTF(scene, path, xyz)
        } else if (path.includes('fbx')) {
            console.log('fbx');
        }
    }

    static loadGLTF(scene, path, xyz) {
        // Instantiate a loader
        const loader = new GLTFLoader();

        // Load a glTF resource
        loader.load(
            // resource URL
            path,
            // called when the resource is loaded
            function (gltf) {
                const object = gltf.scene;
                //setup center values
                let bbox = new Box3().setFromObject(object);
                let cent = bbox.getCenter(new Vector3());
                let size = bbox.getSize(new Vector3());
                let maxAxis = Math.max(size.x, size.y, size.z);

                //scale object
                object.scale.multiplyScalar(1.0 / maxAxis);
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


                scene.add(object);
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

    static loadFBX(scene, path) {
        // Instantiate a loader
        const loader = new FBXLoader();

        // Load a glTF resource
        loader.load(
            // resource URL
            path,
            // called when the resource is loaded
            function (fbx) {
                const object = fbx.scene;
                scene.add(object);
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
}

