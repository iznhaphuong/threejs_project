import * as THREE from 'three'

import { OrbitControls } from '/jsm/controls/OrbitControls.js'
import { FBXLoader } from '/jsm/loaders/FBXLoader.js';
import { Box3, Vector3 } from 'three';

import { ObjectLoader } from '/src/loaders/ObjectLoader.js'
import { AxesHelper } from '/src/helpers/AxesHelper.js'
// import { GUI } from '/jsm/libs/lil-gui.module.min.js'
import Stats from '/jsm/libs/stats.module.js'
import { TWEEN } from '/jsm/libs/tween.module.min.js'
//import self-defined class
import { ModelLoader } from './model-loader.js'
import { Plane } from './plane.js'
import { Monster } from './monster.js'
import { updateCurrentTime } from '../js/controllers/time-controller.js'
import { changeBackground } from '../js/controllers/time-controller.js'


class BasicCharacterControllerProxy {
    constructor(animations) {
        this._animations = animations;
    }

    get animations() {
        return this._animations;
    }
};


class BasicCharacterController {
    constructor(params) {
        this._Init(params);
    }

    _Init(params) {
        this._params = params;
        //Thêm vận tốc và hướng
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);//tốc độ
        this._acceleration = new THREE.Vector3(1, 0.25, 5.0);
        this._velocity = new THREE.Vector3(0, 0, 0);

        this._animations = {};
        this._input = new BasicCharacterControllerInput();
        this._stateMachine = new CharacterFSM(
            new BasicCharacterControllerProxy(this._animations));

        this._LoadModels();
    }

    _LoadModels() {
        const loader = new FBXLoader();
        loader.setPath('./resource/models/character/main_character/');
        loader.load('guard.fbx', (fbx) => {
            fbx.traverse(c => {
                c.castShadow = true;
            });

            this._target = fbx;
            this._params.scene.add(this._target);
            fbx.traverse(c => {
                c.castShadow = true;
            });
            //setup center values
            let bbox = new Box3().setFromObject(fbx);
            let cent = bbox.getCenter(new Vector3());
            let size = bbox.getSize(new Vector3());
            let maxAxis = Math.max(size.x, size.y, size.z);

            let scale = 1.0;
            //scale object
            // if (scaleParam >= 0) {
            //     scale = scaleParam;
            // }
            fbx.scale.setScalar(scale / maxAxis);
            bbox.setFromObject(fbx);
            bbox.getCenter(cent);
            bbox.getSize(size);
            // fbx.position.z = -1;
            const xyz = [0, -.4, 0];
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

            this._mixer = new THREE.AnimationMixer(this._target);

            this._manager = new THREE.LoadingManager();
            this._manager.onLoad = () => {
                this._stateMachine.SetState('idle');
            };

            const _OnLoad = (animName, anim) => {
                const clip = anim.animations[0];
                const action = this._mixer.clipAction(clip);

                this._animations[animName] = {
                    clip: clip,
                    action: action,
                };
            };

            const loader = new FBXLoader(this._manager);
            loader.setPath('./resource/models/character/main_character/guard/');
            loader.load('walk.fbx', (a) => { _OnLoad('walk', a); });
            loader.load('run.fbx', (a) => { _OnLoad('run', a); });
            loader.load('idle.fbx', (a) => { _OnLoad('idle', a); });
            loader.load('kick.fbx', (a) => { _OnLoad('dance', a); });

        });
    }

    Update(timeInSeconds) {
        if (!this._target) {
            return;
        }

        this._stateMachine.Update(timeInSeconds, this._input);

        const velocity = this._velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
        );
        frameDecceleration.multiplyScalar(timeInSeconds);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));

        velocity.add(frameDecceleration);

        const controlObject = this._target;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3();
        const _R = controlObject.quaternion.clone();

        const acc = this._acceleration.clone();
        if (this._input._keys.shift) {
            acc.multiplyScalar(1.0);
        }

        // console.log("currentSate "+this._stateMachine._currentState.Name());
        // if (this._stateMachine._currentState.name == 'dance') {
        //     acc.multiplyScalar(0.0);
        // }

        if (this._input._keys.forward) {
            velocity.z += acc.z * timeInSeconds;
        }
        if (this._input._keys.backward) {
            velocity.z -= acc.z * timeInSeconds;
        }
        if (this._input._keys.left) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
        if (this._input._keys.right) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }

        controlObject.quaternion.copy(_R);

        const oldPosition = new THREE.Vector3();
        oldPosition.copy(controlObject.position);

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(velocity.x * timeInSeconds);
        forward.multiplyScalar(velocity.z * timeInSeconds);

        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        oldPosition.copy(controlObject.position);

        if (this._mixer) {
            this._mixer.update(timeInSeconds);
        }
    }
};


class BasicCharacterControllerInput {
    constructor() {
        this._Init();
    }

    _Init() {
        this._keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false,
        };
        document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }

    _onKeyDown(event) {
        switch (event.keyCode) {
            case 87: // w
                this._keys.forward = true;

                break;
            case 65: // a
                this._keys.left = true;

                break;
            case 83: // s
                this._keys.backward = true;

                break;
            case 68: // d
                this._keys.right = true;

                break;
            case 32: // SPACE
                this._keys.space = true;

                break;
            case 16: // SHIFT
                this._keys.shift = true;

                break;
        }
    }

    _onKeyUp(event) {
        switch (event.keyCode) {
            case 87: // w
                this._keys.forward = false;
                break;
            case 65: // a
                this._keys.left = false;
                break;
            case 83: // s
                this._keys.backward = false;
                break;
            case 68: // d
                this._keys.right = false;
                break;
            case 32: // SPACE
                this._keys.space = false;
                break;
            case 16: // SHIFT
                this._keys.shift = false;
                break;
        }
    }
};


class FiniteStateMachine {
    constructor() {
        this._states = {};
        this._currentState = null;
    }

    _AddState(name, type) {
        this._states[name] = type;
    }

    SetState(name) {
        const prevState = this._currentState;

        if (prevState) {
            if (prevState.Name == name) {
                return;
            }
            prevState.Exit();
        }

        const state = new this._states[name](this);

        this._currentState = state;
        state.Enter(prevState);
    }

    Update(timeElapsed, input) {
        if (this._currentState) {
            this._currentState.Update(timeElapsed, input);
        }
    }
};


class CharacterFSM extends FiniteStateMachine {
    constructor(proxy) {
        super();
        this._proxy = proxy;
        this._Init();
    }

    _Init() {
        this._AddState('idle', IdleState);
        this._AddState('walk', WalkState);
        this._AddState('run', RunState);
        this._AddState('dance', DanceState);
    }
};


class State {
    constructor(parent) {
        this._parent = parent;
    }

    Enter() { }
    Exit() { }
    Update() { }
};


class DanceState extends State {
    constructor(parent) {
        super(parent);

        this._FinishedCallback = () => {
            this._Finished();
        }
    }

    get Name() {
        return 'dance';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['dance'].action;
        const mixer = curAction.getMixer();
        mixer.addEventListener('finished', this._FinishedCallback);// lắng nghe tiếp sự kiện sau đó

        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;

            curAction.reset();
            curAction.setLoop(THREE.LoopOnce, 1);
            curAction.clampWhenFinished = true;// dừng khi animation đã thực hiện
            curAction.crossFadeFrom(prevAction, 0.2, true);
            curAction.play();
        } else {
            curAction.play();
        }
    }

    _Finished() {
        this._Cleanup();
        this._parent.SetState('idle');
    }

    _Cleanup() {
        const action = this._parent._proxy._animations['dance'].action;

        action.getMixer().removeEventListener('finished', this._CleanupCallback);
    }

    Exit() {
        this._Cleanup();
    }

    Update(_) {
    }
};


class WalkState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'walk';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['walk'].action;
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;

            curAction.enabled = true;

            if (prevState.Name == 'run') {
                const ratio = curAction.getClip().duration / prevAction.getClip().duration;
                curAction.time = prevAction.time * ratio;
            } else {
                curAction.time = 0.0;
                curAction.setEffectiveTimeScale(1.0);
                curAction.setEffectiveWeight(1.0);
            }

            curAction.crossFadeFrom(prevAction, 0.5, true);
            curAction.play();
        } else {
            curAction.play();
        }
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input._keys.forward || input._keys.backward) {
            if (input._keys.shift) {
                this._parent.SetState('run');
            }
            return;
        }

        this._parent.SetState('idle');
    }
};


class RunState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'run';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['run'].action;
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;

            curAction.enabled = true;

            if (prevState.Name == 'walk') {
                const ratio = curAction.getClip().duration / prevAction.getClip().duration;
                curAction.time = prevAction.time * ratio;// nếu hành động trước đó là walk
            } else {
                curAction.time = 0.0;
                curAction.setEffectiveTimeScale(1.0);
                curAction.setEffectiveWeight(1.0);
            }

            curAction.crossFadeFrom(prevAction, 0.5, true);
            curAction.play();
        } else {
            curAction.play();
        }
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input._keys.forward || input._keys.backward) {
            if (!input._keys.shift) {
                this._parent.SetState('walk');
            }
            return;
        }

        this._parent.SetState('idle');
    }
};


class IdleState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'idle';
    }

    Enter(prevState) {
        const idleAction = this._parent._proxy._animations['idle'].action;
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;
            idleAction.time = 0.0;
            idleAction.enabled = true;
            idleAction.setEffectiveTimeScale(1.0);
            idleAction.setEffectiveWeight(1.0);
            idleAction.crossFadeFrom(prevAction, 0.5, true);// ngăn dừng animation đột ngột
            idleAction.play();
        } else {
            idleAction.play();
        }
    }

    Exit() {
    }

    Update(_, input) {
        if (input._keys.forward || input._keys.backward) {
            this._parent.SetState('walk');
        } else if (input._keys.space) {
            this._parent.SetState('dance');
        }
    }
};
//Define ThreeJS class
const path = './resource/models/character/main_character/'
const character = 'erika_archer.fbx';
const animCharacter = 'Walking.fbx';



class ThreeJS {

    //Constructor
    constructor() {

        this.scene = this.createScene();
        this.camera = this.createCamera();
        this.renderer = this.createRenderer();

        this.handleResize();
        this.controls = this.createControl();

        //Add lights
        this.ambientLight = this.createAmbientLight();
        this.scene.add(this.ambientLight);
        this.directionalLight = this.createDirectionalLight();
        this.scene.add(this.directionalLight);
        this.createGUI();
        this.stats = this.createStats();
        this.mixers = [];
        this.previousRAF = null;
        this._LoadAnimatedModel();
        // Monster.loadModel(this.scene, this.mixers, [0, -.4, 0], 1.0);
        // this._LoadAnimatedModel(path, character, animCharacter, [0, -.4, 0]);

    }

    _LoadAnimatedModel() {
        const params = {
            camera: this.camera,
            scene: this.scene,
        }
        this.controls = new BasicCharacterController(params);
    }
    //For Render()
    render() {

        TWEEN.update();
        //XỬ LÝ ANIMATION - render cảnh nhiều lần tạo anmt
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
        this._RAF();
    }

    _RAF() {
        requestAnimationFrame((t) => {
            if (this.previousRAF === null) {
                this.previousRAF = t;
            }

            this._RAF();
            this.renderer.render(this.scene, this.camera);
            this._Step(t - this.previousRAF);
            this.previousRAF = t;
        });
    }
    _Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        if (this.mixers) {
            this.mixers.map(m => m.update(timeElapsedS));
        }

        if (this.controls) {
            this.controls.Update(timeElapsedS);
        }
    }

    // _LoadAnimatedModel(path, modelFile, animFile, xyz) {
    //     const loader = new FBXLoader();

    //     loader.setPath(path);
    //     loader.load(modelFile, (fbx) => {

    //         fbx.traverse(c => {
    //             c.castShadow = true;
    //         });
    //         //setup center values
    //         let bbox = new Box3().setFromObject(fbx);
    //         let cent = bbox.getCenter(new Vector3());
    //         let size = bbox.getSize(new Vector3());
    //         let maxAxis = Math.max(size.x, size.y, size.z);

    //         let scale = 1.0;
    //         //scale object
    //         // if (scaleParam >= 0) {
    //         //     scale = scaleParam;
    //         // }
    //         fbx.scale.setScalar(scale / maxAxis);
    //         bbox.setFromObject(fbx);
    //         bbox.getCenter(cent);
    //         bbox.getSize(size);
    //         // fbx.position.z = -1;
    //         if (!Array.isArray(xyz) || xyz.length < 3) {
    //             //center object 
    //             fbx.position.x -= cent.x;
    //             fbx.position.y -= cent.y;
    //             fbx.position.z -= cent.z;
    //         } else {
    //             //custom set object position 
    //             fbx.position.x -= xyz[0];
    //             fbx.position.y -= xyz[1];
    //             fbx.position.z -= xyz[2];
    //         }

    //         this.target = fbx;
    //         this.params.scene.add(this.target);
    //         this.manager = new THREE.LoadingManager();
    //         this.manager.onLoad = () => {
    //             this.stateMachine.SetState('idle');
    //         };
    //         const _OnLoad = (animName, anim) => {
    //             const clip = anim.animations[0];
    //             const action = this._mixer.clipAction(clip);

    //             this.animations[animName] = {
    //                 clip: clip,
    //                 action: action,
    //             };
    //         };
    //         this.controls = new BasicCharacterControls(params);

    //         const loader = new FBXLoader(this.manager);
    //         loader.setPath('./resources/zombie/');
    //         loader.load('walk.fbx', (a) => { _OnLoad('walk', a); });
    //         loader.load('run.fbx', (a) => { _OnLoad('run', a); });
    //         loader.load('idle.fbx', (a) => { _OnLoad('idle', a); });
    //         loader.load('dance.fbx', (a) => { _OnLoad('dance', a); });

    //         // const anim = new FBXLoader();
    //         // //add an animation from another file    
    //         // anim.setPath(path);
    //         // anim.load(animFile, (anim) => {
    //         //     const m = new THREE.AnimationMixer(fbx);
    //         //     this.mixers.push(m);
    //         //     const idle = m.clipAction(anim.animations[0]);
    //         //     idle.play();
    //         // });
    //         // this.scene.add(fbx);

    //     });
    // }
    //Create SCENE
    createScene() {
        const scene = new THREE.Scene();
        //Hiển thị trục toạ độ cho cảnh
        const axesHelper = new AxesHelper(15);
        scene.add(axesHelper);
        return scene;
    }

    //Create CAMERA
    createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        camera.position.set(-8, 2, 10);
        // Luôn nhìn vào điểm trung tâm
        camera.lookAt(this.scene.position);
        return camera;
    }

    //Resize CAMERA
    onResize() {
        // const pixelRatio = window.devicePixelRatio;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.render();
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.onResize();
        });
    }

    //Create RENDERER
    createRenderer() {
        const renderer = new THREE.WebGLRenderer({
            //xử lý răng cưa
            antialias: true
        });
        document.body.appendChild(renderer.domElement);
        // renderer.setClearColor(new THREE.Color(0xFFFFFF));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMapSoft = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;


        return renderer;
    }

    //Creation Control 
    createControl() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.update();
    }

    //Create datGUI 
    createGUI() {
        const gui = new dat.GUI();
        // const animationsFolder = gui.addFolder('Animations')

        //Camera gui
        const co_ordinate = 100;
        const cameraFolder = gui.addFolder('Camera');
        cameraFolder.add(this.camera.position, 'x', -co_ordinate, co_ordinate);
        cameraFolder.add(this.camera.position, 'y', -co_ordinate, co_ordinate);
        cameraFolder.add(this.camera.position, 'z', -co_ordinate, co_ordinate);
        cameraFolder.add(this.camera, 'fov', 1, 179).onChange(value => {
            this.camera.updateProjectionMatrix();
        });

        // cameraFolder.open();
        // Ambient Light GUI
        const controls = {
            ambientColor: this.ambientLight.color.getHex(),
            directionalColor: this.directionalLight.color.getHex()
        };

        const ambientFolder = gui.addFolder('Ambient Light');
        ambientFolder.add(this.ambientLight, 'visible');
        ambientFolder.add(this.ambientLight, 'intensity', 0, 10);
        ambientFolder.addColor(controls, 'ambientColor').name('color')
            .onChange(color => {
                this.ambientLight.color.set(color);
            });

        //Directional Light GUI

        const directionalFolder = gui.addFolder('Directional Light');
        directionalFolder.add(this.directionalLight, 'visible');
        directionalFolder.add(this.directionalLight, 'intensity', 0, 5);
        directionalFolder.addColor(controls, 'directionalColor')
            .name('color')
            .onChange(color => {
                this.directionalLight.color.set(color);
            });
        directionalFolder.add(this.directionalLight, 'castShadow');
    }

    //Create ambient light
    createAmbientLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        ambientLight.visible = true;
        return ambientLight;
    }

    createDirectionalLight() {
        const color = 0xffffff;
        const directionalLight = new THREE.DirectionalLight(color);
        directionalLight.intensity = 1.3;
        directionalLight.castShadow = true;

        directionalLight.position.set(-10, 5, 0);
        directionalLight.target.position.set(0, .4, 0);
        this.scene.add(directionalLight.target);

        directionalLight.visible = true;
        // directionalLight.shadow.camera = true;
        // Phải cho đủ nếu không bóng sẽ bị cắt
        directionalLight.shadow.camera.near = 2;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.mapSize.width = 500;
        directionalLight.shadow.mapSize.height = 500;


        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
        directionalLightHelper.visible = true;

        const directionalCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        directionalCameraHelper.visible = true;

        this.scene.add(
            directionalLightHelper,
            directionalCameraHelper
        );

        return directionalLight;
    }

    //Create Stats
    createStats() {
        const stats = Stats()
        stats.setMode(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(stats.dom)
        return stats
    }

}

//Create ThreeJS object without render 
var three = new ThreeJS();

var hour = new Date().getMinutes();
// console.log(changeBackground(three, hour % 24))
// updateCurrentTime(three)

///////////////////////////////
/// ADD 3D OBJECT MODEL///////
/////////////////////////////
const planeModel = new Plane();
three.scene.add(planeModel.plane);

//Just support .GLB, .GLTF, FBX
//3 params (scene, path of model, )
const templePath = '../resource/models/chinese_temple/scene.gltf';
const monster = '../resource/models/character/wooden/scene.gltf';
// ModelLoader.load(three.scene, templePath, [0, -.4, 0],);
// Monster.loadModel(three.scene,three.mixers,[0, -.4, 0],10 );
// const courtyartPath = '../resource/models/ancient_chinese_courtyard_park/scene.gltf';
// ModelLoader.load(three.scene, monster, [5, -.4, 0],20);
// ModelLoader.loadFBX(three.scene,'../resource/models/character/characterLola.fbx','../resource/models/monster/breakdance1990.fbx')
// ModelLoader.load(three.scene, templePath, [-35, -4.25, 0], 10);
// ModelLoader.load(three.scene, templePath, [35, -4.25, 0], 10);
const courtyartPath = '../resource/models/ancient_chinese_courtyard_park/scene.gltf';
ModelLoader.load(three.scene, courtyartPath, [0, -.4, 0], 70);
// Monster.loadModel(three.scene,three.mixers,[0, -.4, 0],1.0);

//cập nhật animate của các object trong update()

function update() {
    // planeModel.animate();


}

//Render
three.render();





