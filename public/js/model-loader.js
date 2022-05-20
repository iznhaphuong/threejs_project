import { GLTFLoader } from '/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from '/jsm/loaders/FBXLoader.js'

export class ModelLoader {
    static load(scene, path) {
        if (path.includes('glb') || path.includes('gltf')) {
            console.log('gltf');
            this.loadGLTF(scene, path)
          } else if (path.includes('fbx')) {
            console.log('fbx');
          }
    }

    static loadGLTF(scene, path) {
        // Instantiate a loader
        const loader = new GLTFLoader();

        // Load a glTF resource
        loader.load(
            // resource URL
            path,
            // called when the resource is loaded
            function (gltf) {
                const object = gltf.scene;
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
                const object= fbx.scene;
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

