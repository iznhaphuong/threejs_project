import * as THREE from 'three'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'

import { ObjectLoader } from '/src/loaders/ObjectLoader.js'
import { AxesHelper } from '/src/helpers/AxesHelper.js'
// import { GUI } from '/jsm/libs/lil-gui.module.min.js'
import Stats from '/jsm/libs/stats.module.js'
//import self-defined class
import { ModelLoader } from './model-loader.js'
import { Plane } from './plane.js'
import { updateCurrentTime } from '../js/controllers/time-controller.js'
import { changeBackground } from '../js/controllers/time-controller.js'
import { updatePosition } from '../js/controllers/position-controller.js'
import { Group, Vector2 } from 'three'
import dat from 'https://unpkg.com/dat.gui@0.7.7/build/dat.gui.module.js'

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
    }

    //For Render()
    render() {
        update();
        //XỬ LÝ ANIMATION - render cảnh nhiều lần tạo anmt
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
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

const planeModel = new Plane(three);
three.scene.add(planeModel.plane);

//Just support .GLB, .GLTF, FBX
//3 params (scene, path of model, )
const templePath = 'chinese_temple/scene.gltf';
ModelLoader.load(three.scene, templePath, [-35, -4.25, 0], 10);
ModelLoader.load(three.scene, templePath, [35, -4.25, 0], 10);

const courtyartPath = 'ancient_chinese_courtyard_park/scene.gltf';
ModelLoader.load(three.scene, courtyartPath, [0, -.4, 0], 70);

const fortuneTeller = 'fortune-teller/scene.gltf';
ModelLoader.load(three.scene, fortuneTeller, [8, 0, -42], 1.4);

const redTree = 'red-tree/scene.gltf';
ModelLoader.load(three.scene, redTree, [8, .5, 40], 5);

const trees = 'trees/scene.gltf';
ModelLoader.load(three.scene, trees, [-10, 0, 10], 12);

//cập nhật animate của các object trong update()
function update() {
    // resetMaterials()
    // hoverPieces()
}

// when camera change
function onPointerMove(event) {
    // cap nhat lai vi tri
    updatePosition(three)
    three.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    three.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
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
                            if ( temp.parent.parent.parent.parent.parent.name == fortuneTeller)
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

