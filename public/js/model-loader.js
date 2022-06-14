import { GLTFLoader } from '/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from '/jsm/loaders/FBXLoader.js'
import { AnimationMixer } from '/src/animation/AnimationMixer.js'
// import { AnimationAction } from '/jsm/amimation/AnimationAction.js'

export class ModelLoader {

    static load(scene, path) {
        if (path.includes('glb') || path.includes('gltf')) {

            this.loadGLTF(scene, path)
        } else if (path.includes('fbx')) {
            this.loadFBX(scene, path)
        }
    }

    static loadGLTF(scene, path) {
        // Instantiate a loader
        const loader = new GLTFLoader();
        let mixer = new AnimationMixer();
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

    static loadFBX(scene, path, animPath) {
        // Instantiate a loader
        const loader = new FBXLoader();
        // let mixer = new AnimationMixer();
        const mixers = [];
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
                    const m = new AnimationMixer(fbx);
                    mixers.push(m);
                    const idle = m.clipAction(anim.animations[0]);
                    idle.play();
                });
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

