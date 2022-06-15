import * as THREE from 'three'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'
import { FBXLoader } from '/jsm/loaders/FBXLoader.js';
import { Box3, Vector3 } from 'three';

import { ObjectLoader } from '/src/loaders/ObjectLoader.js'
import { AxesHelper } from '/src/helpers/AxesHelper.js'
// import { GUI } from '/jsm/libs/lil-gui.module.min.js'
import Stats from '/jsm/libs/stats.module.js'

//import self-defined class
import { ModelLoader } from './model-loader.js'
import { Plane } from './plane.js'
import { Monster } from './monster.js'


class BasicCharacterControls {
    constructor(params) {
        this._Init(params);
    }

    _Init(params) {
        this._params = params;
        this._move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
        };
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this._velocity = new THREE.Vector3(0, 0, 0);

        document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }

    _onKeyDown(event) {
        switch (event.keyCode) {
            case 87: // w
                this._move.forward = true;
                break;
            case 65: // a
                this._move.left = true;
                break;
            case 83: // s
                this._move.backward = true;
                break;
            case 68: // d
                this._move.right = true;
                break;
            case 38: // up
            case 37: // left
            case 40: // down
            case 39: // right
                break;
        }
    }

    _onKeyUp(event) {
        switch (event.keyCode) {
            case 87: // w
                this._move.forward = false;
                break;
            case 65: // a
                this._move.left = false;
                break;
            case 83: // s
                this._move.backward = false;
                break;
            case 68: // d
                this._move.right = false;
                break;
            case 38: // up
            case 37: // left
            case 40: // down
            case 39: // right
                break;
        }
    }

    Update(timeInSeconds) {
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

        const controlObject = this._params.target;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3();
        const _R = controlObject.quaternion.clone();

        if (this._move.forward) {
            velocity.z += this._acceleration.z * timeInSeconds;
        }
        if (this._move.backward) {
            velocity.z -= this._acceleration.z * timeInSeconds;
        }
        if (this._move.left) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
        if (this._move.right) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, -Math.PI * timeInSeconds * this._acceleration.y);
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
    }
}
//Define ThreeJS class
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
        // Monster.loadModel(this.scene,this.mixers);
        this._LoadAnimatedModel([0, -.4, 0]);

    }

    //For Render()
    render() {
        update();
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
    _LoadAnimatedModel(xyz) {
        const loader = new FBXLoader();
        loader.setPath('./resource/models/monster/');
        loader.load('maw_j_laygo.fbx', (fbx) => {
            
            fbx.traverse(c => {
                c.castShadow = true;
            });
            //setup center values
            let bbox = new Box3().setFromObject(fbx);
            let cent = bbox.getCenter(new Vector3());
            let size = bbox.getSize(new Vector3());
            let maxAxis = Math.max(size.x, size.y, size.z);

            let scale = 3.0;
            //scale object
            // if (scaleParam >= 0) {
            //     scale = scaleParam;
            // }
            fbx.scale.setScalar(scale / maxAxis);
            bbox.setFromObject(fbx);
            bbox.getCenter(cent);
            bbox.getSize(size);
            // fbx.position.z = -1;
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
            const params = {
                target: fbx,
                camera: this.camera,
            }
            this.controls = new BasicCharacterControls(params);

            const anim = new FBXLoader();
            anim.setPath('./resources/zombie/');
            anim.load('walk.fbx', (anim) => {
                const m = new THREE.AnimationMixer(fbx);
                this.mixers.push(m);
                const idle = m.clipAction(anim.animations[0]);
                idle.play();
            });
            this.scene.add(fbx);
        });
    }
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
        camera.position.set(-30, 40, 30);
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
        //Camera gui
        const co_ordinate = 100;
        const cameraFolder = gui.addFolder('Camera');
        cameraFolder.add(this.camera.position, 'x', -co_ordinate, co_ordinate);
        cameraFolder.add(this.camera.position, 'y', -co_ordinate, co_ordinate);
        cameraFolder.add(this.camera.position, 'z', -co_ordinate, co_ordinate);
        cameraFolder.add(this.camera, 'fov', 1, 179).onChange(value => {
            this.camera.updateProjectionMatrix();
        });

        cameraFolder.open();
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
        // directionalFolder.add(this.directionalLightHelper, 'visible').name('helper');
    }

    //Create ambient light
    createAmbientLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        ambientLight.visible = true;
        return ambientLight;
    }

    createDirectionalLight() {
        const color = 0xeeeeee;
        const directionalLight = new THREE.DirectionalLight(color);
        directionalLight.intensity = 1;
        directionalLight.castShadow = true;

        directionalLight.position.set(10, 5, 0);
        directionalLight.target.position.set(0, .4, 0);
        this.scene.add(directionalLight.target);

        directionalLight.visible = true;
        directionalLight.shadowCameraVisible = true
        // Phải cho đủ nếu không bóng sẽ bị cắt
        directionalLight.shadow.camera.near = 2;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -5;
        directionalLight.shadow.camera.right = 5;
        directionalLight.shadow.camera.top = 5;
        directionalLight.shadow.camera.bottom = -5;
        directionalLight.shadow.mapSize.width = 50;
        directionalLight.shadow.mapSize.height = 50;


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


///////////////////////////////
/// ADD 3D OBJECT MODEL///////
/////////////////////////////
const planeModel = new Plane();
three.scene.add(planeModel.plane);

//Just support .GLB, .GLTF, FBX
//3 params (scene, path of model, )

const templePath = '../resource/models/chinese_temple/scene.gltf';
const monster = '../resource/models/character/wooden/scene.gltf';
ModelLoader.load(three.scene, templePath, [0, -.4, 0],);
// Monster.loadModel(three.scene,three.mixers,[0, -.4, 0],10 );
// const courtyartPath = '../resource/models/ancient_chinese_courtyard_park/scene.gltf';
// ModelLoader.load(three.scene, monster, [5, -.4, 0],20);
// ModelLoader.loadFBX(three.scene,'../resource/models/character/characterLola.fbx','../resource/models/monster/breakdance1990.fbx')

//cập nhật animate của các object trong update()

function update() {
    // planeModel.animate();


}


//Render
three.render();





