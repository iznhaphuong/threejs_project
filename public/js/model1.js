import * as THREE from 'three';
import { OrbitControls } from '/jsm/controls/OrbitControls.js'
import {FBXLoader} from '/jsm/loaders/FBXLoader.js';


export default class Model1 {
    constructor() {
        this.createScene();
        this.createCamera();
        this.createRenderer()
        this.loadModel();

    }
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
    }
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        const aspectRatio = window.devicePixelRatio;
        this.renderer.setSize(window.innerWidth * aspectRatio, window.innerHeight * aspectRatio, false);
        document.body.appendChild(this.renderer.domElement)
    }

    async loadModel() {

        const fbxLoader = new FBXLoader();
       fbxLoader.setPath('./resource/models/monster/');
       fbxLoader.load('maw_j_laygo.fbx',(fbx)=>{
           fbx.scale.setScalar(0.1);
           fbx.traverse(c=>{
               c.castShadow = true;
           })
           console.log(fbx);
           const anim = new FBXLoader();
           anim.setPath('./resource/models/monster/');
           anim.load('hip_hop_dancing.fbx',(anim)=>{
               this.mixer = new THREE.AnimationMixer(fbx);
               const idle = this.mixer.clipAction(anim.animations[0]);
               idle.play();
           })
           this.scene.add(fbx);
       })     
    }

    createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 2);
        this.camera.lookAt(this.scene.position);
    }
    render() {

        if (this.mixer) {
            const delta = this.clock.getDelta();
            this.mixer.update(delta);
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }




}




