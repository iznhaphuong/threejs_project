import * as THREE from 'three';
import { OrbitControls } from '/jsm/controls/OrbitControls.js'
import {FBXLoader} from '/jsm/loaders/FBXLoader.js';


export class Monster {

     static async loadModel(scene) {

        const fbxLoader = new FBXLoader();
       fbxLoader.setPath('../resource/models/monster/');
       fbxLoader.load('maw_j_laygo.fbx',(fbx)=>{
           fbx.scale.setScalar(0.1);
           fbx.traverse(c=>{
               c.castShadow = true;
           })
           console.log(fbx);
           const anim = new FBXLoader();
           anim.setPath('../resource/models/monster/');
           anim.load('Breakdance_1990.fbx',(anim)=>{
               this.mixer = new THREE.AnimationMixer(fbx);
               const idle = this.mixer.clipAction(anim.animations[0]);
               idle.play();
           })
           scene.add(fbx);
       })     
    }



}




