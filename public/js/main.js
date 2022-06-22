import * as THREE from 'three'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'
import { FBXLoader } from '/jsm/loaders/FBXLoader.js';
import { Box3, Vector3 } from 'three';

import { ObjectLoader } from '/src/loaders/ObjectLoader.js'
import { AxesHelper } from '/src/helpers/AxesHelper.js'
import Stats from '/jsm/libs/stats.module.js'
import { TWEEN } from '/jsm/libs/tween.module.min.js'
//import self-defined class
import { ModelLoader } from './model-loader.js'
import { Plane } from './plane.js'
import { Monster } from './monster.js'
import { updateCurrentTime } from '../js/controllers/time-controller.js'
import { changeBackground } from '../js/controllers/time-controller.js'
import { updatePosition } from '../js/controllers/position-controller.js'
import { Group, Vector2 } from 'three'
import dat from 'https://unpkg.com/dat.gui@0.7.7/build/dat.gui.module.js'
import { BasicCharacterController } from './character-controller.js'




//Define ThreeJS class
class ThreeJS {

    //Constructor
    constructor() {

        this.scene = this.createScene();
        this.camera = this.createCamera();
        this.renderer = this.createRenderer();

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

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
        // this._LoadAnimatedModel();  
        this._RAF();
        // Monster.loadModel(this.scene, this.mixers, [0, -.4, 0], 1.0);
        // this._LoadAnimatedModel(path, character, animCharacter, [0, -.4, 0]);

    }


    //For Render()
    render() {

        TWEEN.update();
        //XỬ LÝ ANIMATION - render cảnh nhiều lần tạo anmt
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
        // this._RAF();
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
        camera.position.set(-9, 2, 50);
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

    //Resize
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

    //Create directionalLight
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

console.log(changeBackground(three, hour % 24))
updateCurrentTime(three)
updatePosition(three)


///////////////////////////////
/// ADD 3D OBJECT MODEL///////
/////////////////////////////


const params = {
    camera: three.camera,
    scene: three.scene,
}
three.controls = new BasicCharacterController(params);

const planeModel = new Plane(three);
three.scene.add(planeModel.plane);

//Just support .GLB, .GLTF, FBX
//3 params (scene, path of model, )
const courtyart = new THREE.Object3D( );
const courtyartPath = 'ancient_chinese_courtyard_park/scene.gltf';

const trees = new THREE.Object3D( );
const treesPath = 'trees/scene.gltf';

const redTree = new THREE.Object3D( );
const redTreePath = 'red-tree/scene.gltf';

const fortuneTeller = new THREE.Object3D( );
const fortuneTellerPath = 'fortune-teller/scene.gltf';

const temple = new THREE.Object3D( );
const templePath = 'chinese_temple/scene.gltf';

const monster = '../resource/models/character/wooden/scene.gltf';
// Monster.loadModel(three.scene,three.mixers,[0, -.4, 0],10 );
// ModelLoader.load(three.scene, monster, [5, -.4, 0],20);
// ModelLoader.loadFBX(three.scene,'../resource/models/character/characterLola.fbx','../resource/models/monster/breakdance1990.fbx')
// ModelLoader.load(three.scene, templePath, [-35, -4.25, 0], 10);
// ModelLoader.load(three.scene, templePath, [35, -4.25, 0], 10);

// Monster.loadModel(three.scene,three.mixers,[0, -.4, 0],1.0);
ModelLoader.load(courtyart, courtyartPath, [0, -.4, 0], 70);
ModelLoader.load(fortuneTeller, fortuneTellerPath, [8, 0, -42], 1.4);
ModelLoader.load(redTree, redTreePath, [8, .5, 40], 5);
ModelLoader.load(trees, treesPath, [-10, 0, 10], 12);

three.scene.add(courtyart);
three.scene.add(fortuneTeller);
three.scene.add(trees);
three.scene.add(redTree);


//cập nhật animate của các object trong update()

function update() {
    // resetMaterials()
    // hoverPieces()
}
const compass = document.querySelector('#compass');
// when camera change
function onPointerMove(event) {
    // cap nhat lai vi tri
    updatePosition(three)
    three.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    three.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;


    var vector = new THREE.Vector3();
    var center = new THREE.Vector3();
    var spherical = new THREE.Spherical();
    vector.copy(three.camera.position).sub(center);
    spherical.setFromVector3(vector);
    var rot = spherical.theta;
    console.log((rot) / Math.PI * 180);
    compass.style.transform = `rotate(${(rot) / Math.PI * 180}deg)`;
    console.log(compass.style.transform.rotate);
}

//  function when hover
// function hoverPieces() {
//     three.raycaster.setFromCamera(three.pointer, three.camera)
//     const intersects = three.raycaster.intersectObjects(three.scene.children);
//     for (let i = 0; i < intersects.length; i++) {
//         intersects[i].object.material.opacity = 0
//     }
// }

function resetMaterials() {
    for (let i = 0; i < three.scene.children.length; i++) {
        if (three.scene.children[i].material) {
            three.scene.children[i].material.opacity = 1;
        }
    }
}

function onClick(event) {
    three.raycaster.setFromCamera(three.pointer, three.camera)
    const intersects = three.raycaster.intersectObjects(three.scene.children);
    if (intersects.length > 0) {
        var temp = intersects[0].object;
        if (temp.parent) {
            if (temp.parent.parent) {
                if (temp.parent.parent.parent) {
                    if (temp.parent.parent.parent.parent) {
                        if (temp.parent.parent.parent.parent.parent) {
                            if (temp.parent.parent.parent.parent.parent.name == fortuneTeller)
                                alert(temp.parent.parent.parent.parent.parent.name);
                        }
                    }
                }
            }
        }
    }
}
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('click', onClick)
//Render
three.render();