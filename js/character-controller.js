import { Box3, Vector3 } from 'three';
import * as THREE from 'three';
import { FBXLoader } from '/jsm/loaders/FBXLoader.js';
import { finite_state_machine } from './finite-state-machine.js';
import { model } from './model.js';
import { player_state } from './player-state.js';

export const character = (() => {
    class BasicCharacterControllerProxy {
        constructor(animations) {
            this._animations = animations;
        }

        get animations() {
            return this._animations;
        }
    };


    class BasicCharacterController extends model.Component {
        constructor(params) {
            super();
            this._Init(params);
        }

        _Init(params) {
            this._params = params;
            //Thêm vận tốc và hướng
            this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);//tốc độ
            this._acceleration = new THREE.Vector3(1, 0.5, 5.0);
            this._velocity = new THREE.Vector3(0, 0, 0);
            this._position = new THREE.Vector3();
            this._animations = {};
            this._input = new BasicCharacterControllerInput();
            this._stateMachine = new CharacterFSM(
                new BasicCharacterControllerProxy(this._animations));

            this.LoadModels();
        }

        InitComponent() {
            this._RegisterHandler('health.death', (m) => { this._OnDeath(m); });
        }

        _OnDeath(msg) {
            this._stateMachine.SetState('death');
        }

        async LoadModels() {
            const loader = new FBXLoader();
            loader.setPath('./resource/models/character/main_character/');
            loader.load('erika_archer.fbx', (fbx) => {
                this._target = fbx;
                this._params.scene.add(this._target);


                //setup center values
                let bbox = new Box3().setFromObject(fbx);
                let cent = bbox.getCenter(new Vector3());
                let size = bbox.getSize(new Vector3());
                let maxAxis = Math.max(size.x, size.y, size.z);
                let scale = 1.0;

                fbx.scale.setScalar(scale / maxAxis);
                bbox.setFromObject(fbx);
                bbox.getCenter(cent);
                bbox.getSize(size);

                const xyz = [6, 0, -45];
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
                // console.log(this._target);
                // this._bones = {};

                // for (let b of this._target.children[1].skeleton.bones) {
                //     this._bones[b.name] = b;
                // }

                this._target.traverse(c => {
                    c.castShadow = true;
                    c.receiveShadow = true;
                    if (c.material && c.material.map) {
                        c.material.map.encoding = THREE.sRGBEncoding;
                    }
                });


                this.Broadcast({
                    topic: 'load.character',
                    model: this._target,
                    bones: this._bones,
                });

                this._mixer = new THREE.AnimationMixer(this._target);

                const _OnLoad = (animName, anim) => {
                    const clip = anim.animations[0];
                    const action = this._mixer.clipAction(clip);

                    this._animations[animName] = {
                        clip: clip,
                        action: action,
                    };
                };

                //set default animation
                this._manager = new THREE.LoadingManager();

                this._manager.onLoad = () => {
                    this._stateMachine.SetState('idle');
                };

                const loader = new FBXLoader(this._manager);
                loader.setPath('./resource/models/character/main_character/animation/');
                loader.load('walk.fbx', (a) => { _OnLoad('walk', a); });
                loader.load('run.fbx', (a) => { _OnLoad('run', a); });
                loader.load('idle.fbx', (a) => { _OnLoad('idle', a); });
                loader.load('jump.fbx', (a) => { _OnLoad('jump', a); });
                loader.load('punch.fbx', (a) => { _OnLoad('punch', a); });
                loader.load('flyingKick.fbx', (a) => { _OnLoad('flyKick', a); });
                loader.load('kick.fbx', (a) => { _OnLoad('kick', a); });
                loader.load('death2.fbx', (a) => { _OnLoad('death', a); });



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
        get Position() {
            return this._position;
        }

        get Rotation() {
            if (!this._target) {
                return new THREE.Quaternion();
            }
            return this._target.quaternion;
        }
        // _FindIntersections(pos) {
        //     const _IsAlive = (c) => {
        //         const h = c.entity.GetComponent('HealthComponent');
        //         if (!h) {
        //             return true;
        //         }
        //         return h._health > 0;
        //     };

        //     const grid = this.GetComponent('SpatialGridController');
        //     const nearby = grid.FindNearbyEntities(5).filter(e => _IsAlive(e));
        //     const collisions = [];

        //     for (let i = 0; i < nearby.length; ++i) {
        //         const e = nearby[i].entity;
        //         const d = ((pos.x - e._position.x) ** 2 + (pos.z - e._position.z) ** 2) ** 0.5;

        //         // HARDCODED
        //         if (d <= 4) {
        //             collisions.push(nearby[i].entity);
        //         }
        //     }
        //     return collisions;
        // }

        Update(timeInSeconds) {
            if (!this._stateMachine._currentState) {
                return;
            }

            this._stateMachine.Update(timeInSeconds, this._input);
            // HARDCODED
            if (this._stateMachine._currentState._action) {
                this.Broadcast({
                    topic: 'player.action',
                    action: this._stateMachine._currentState.Name,
                    time: this._stateMachine._currentState._action.time,
                });
            }

            const currentState = this._stateMachine._currentState;
            if (currentState.Name != 'walk' &&
                currentState.Name != 'run' &&
                currentState.Name != 'idle' &&
                currentState.Name != 'jump' &&
                currentState.Name != 'punch' &&
                currentState.Name != 'kick') {
                return;
            }

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

            //animation cho shift
            const acc = this._acceleration.clone();
            if (this._input._keys.shift) {
                acc.multiplyScalar(2.0);
            }


            //add animation 
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

            // const pos = controlObject.position.clone();
            // pos.add(forward);
            // pos.add(sideways);

            // // const collisions = this._FindIntersections(pos);
            // // if (collisions.length > 0) {
            // //     return;
            // // }
            // this._position.copy(pos);



            // oldPosition.copy(controlObject.position);

            controlObject.position.add(forward);
            controlObject.position.add(sideways);
            this._position.copy(controlObject.position);
            this._parent.SetPosition(this._position);
            this._parent.SetQuaternion(this._target.quaternion);

            oldPosition.copy(controlObject.position);

            if (this._mixer) {
                this._mixer.update(timeInSeconds);
            }
        }
    };
    class ThirdPersonCamera extends model.Component {
        constructor(params) {
            super();
            this._params = params;
            this._camera = params.camera;
            this._currentPosition = new THREE.Vector3();
            this._currentLookat = new THREE.Vector3();
        }

        _CalculateIdealOffset() {

            const idealOffset = new THREE.Vector3(-0, 10, -15);
            idealOffset.applyQuaternion(this._params.target._rotation);
            idealOffset.add(this._params.target._position);
            return idealOffset;
        }

        _CalculateIdealLookat() {
            const idealLookat = new THREE.Vector3(0, 2, 3);
            idealLookat.applyQuaternion(this._params.target._rotation);

            idealLookat.add(this._params.target._position);
            return idealLookat;
        }

        Update(timeElapsed) {
            const idealOffset = this._CalculateIdealOffset();
            const idealLookat = this._CalculateIdealLookat();

            const t = 1.0 - Math.pow(0.001, timeElapsed);

            this._currentPosition.lerp(idealOffset, t);
            this._currentLookat.lerp(idealLookat, t);

            // this._camera._position.copy(this._currentPosition);
            this._camera.lookAt(this._currentLookat);
        }
    }

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
                keyZ: false,
                keyX: false,
                keyC: false,
            };
            document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
            document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
        }

        _onKeyDown(event) {
            switch (event.keyCode) {
                case 87: // w
                    this._keys.forward = true;
                    console.log("forward");
                    break;
                case 65: // a
                    this._keys.left = true;
                    console.log("left");
                    break;
                case 83: // s
                    this._keys.backward = true;
                    console.log("backward");
                    break;
                case 68: // d
                    this._keys.right = true;
                    console.log("right");
                    break;
                case 32: // SPACE
                    this._keys.space = true;
                    console.log("space");
                    break;
                case 16: // SHIFT
                    this._keys.shift = true;
                    console.log("shift");
                    break;
                case 90: // keyZ
                    this._keys.keyZ = true;
                    console.log("keyZ");
                    break;
                case 88: // keyX
                    this._keys.keyX = true;
                    console.log("keyX");
                    break;
                case 67: // keyC
                    this._keys.keyC = true;
                    console.log("keyC");
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
                case 90: // keyZ
                    this._keys.keyZ = false;
                    break;
                case 88: // keyX
                    this._keys.keyX = false;
                    break;
                case 67: // keyC
                    this._keys.keyC = false;
                    break;
            }
        }
    };



    class CharacterFSM extends finite_state_machine.FiniteStateMachine {
        constructor(proxy) {
            super();
            this._proxy = proxy;
            this._Init();
        }

        _Init() {
            this._AddState('idle', player_state.IdleState);
            this._AddState('walk', player_state.WalkState);
            this._AddState('run', player_state.RunState);
            this._AddState('jump', player_state.JumpState);
            this._AddState('punch', player_state.PunchState);
            // this._AddState('flyKick', player_state.FlykickState);
            this._AddState('kick', player_state.KickState);
            this._AddState('death', player_state.DeathState);
        }
    };
    return {
        BasicCharacterControllerProxy: BasicCharacterControllerProxy,
        BasicCharacterController: BasicCharacterController,
        BasicCharacterControllerInput: BasicCharacterControllerInput,
        ThirdPersonCamera: ThirdPersonCamera,
    };

})()