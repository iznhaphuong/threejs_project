import * as THREE from 'three'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'

import { ObjectLoader } from '/src/loaders/ObjectLoader.js'
import { AxesHelper } from '/src/helpers/AxesHelper.js'
// import { GUI } from '/jsm/libs/lil-gui.module.min.js'
import Stats from '/jsm/libs/stats.module.js'

//import self-defined class
import { ModelLoader } from './model-loader.js'
import { Plane } from './plane.js'

//Define ThreeJS class
class ThreeJS {
    //Constructor
    constructor() {
        this.scene = this.createScene();
        this.camera = this.createCamera();
        this.renderer = this.createRenderer();
        this.handleResize();
        this.control = this.createControl();
        this.control.update();
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
        return renderer;
    }

    //Creation Control 
    createControl(){
        const controls  = new OrbitControls(this.camera, this.renderer.domElement);
        return controls ;
    }
    
    //Create datGUI 
    createGUI() {
        const gui = new dat.GUI();
        const co_ordinate = 100;
        const cameraFolder = gui.addFolder('Camera');
        cameraFolder.add(this.camera.position, 'x', -co_ordinate, co_ordinate);
        cameraFolder.add(this.camera.position, 'y', -co_ordinate, co_ordinate);
        cameraFolder.add(this.camera.position, 'z', -co_ordinate, co_ordinate);
        cameraFolder.add(this.camera, 'fov', 1, 179).onChange(value => {
            this.camera.updateProjectionMatrix();
        });
        
        cameraFolder.open();

        const lightFolder = gui.addFolder('Light');

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
const sneakersPath = '../resource/models/chinese_temple/scene.gltf';
//3 params (scene, path of model, )
ModelLoader.load(three.scene, sneakersPath, [10,2,2]);


///////////////////////////////
/// SET UP THE LIGHTS   //////
/////////////////////////////
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
three.scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
three.scene.add(directionalLight);


//cập nhật animate của các object trong update()
function update() {
    // planeModel.animate();
}

//////////////////////////////
/// RENDER            ///////
////////////////////////////

three.render();


