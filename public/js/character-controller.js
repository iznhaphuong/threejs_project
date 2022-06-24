import { Box3, Vector3 } from 'three';
import * as THREE from 'three';
import { FBXLoader } from '/jsm/loaders/FBXLoader.js';


class BasicCharacterControllerProxy {
    constructor(animations) {
        this._animations = animations;
    }

    get animations() {
        return this._animations;
    }
};


export class BasicCharacterController {
    constructor(params) {
        this.Init(params);
    }

    Init(params) {
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

    async LoadModels() {
        const loader = new FBXLoader();
        loader.setPath('./resource/models/character/main_character/');
        loader.load('erika_archer.fbx', (fbx) => {


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

            const xyz = [8, 0, -45];
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
            //set default animation
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
            loader.setPath('./resource/models/character/main_character/animation/');
            loader.load('walk.fbx', (a) => { _OnLoad('walk', a); });
            loader.load('run.fbx', (a) => { _OnLoad('run', a); });
            loader.load('idle.fbx', (a) => { _OnLoad('idle', a); });
            loader.load('jump.fbx', (a) => { _OnLoad('jump', a); });
            loader.load('punch.fbx', (a) => { _OnLoad('punch', a); });
            loader.load('flyingKick.fbx', (a) => { _OnLoad('flyKick', a); });
            loader.load('kick.fbx', (a) => { _OnLoad('kick', a); });
            loader.load('death2.fbx', (a) => { _OnLoad('death', a); });



        }, // called while loading is progressing
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

        //animation cho shift
        const acc = this._acceleration.clone();
        if (this._input._keys.shift) {
            acc.multiplyScalar(1.0);
        }

        // console.log("currentSate "+this._stateMachine._currentState.Name());
        // if (this._stateMachine._currentState.Name() == 'jump') {
        //     acc.multiplyScalar(0.0);
        // }

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

        controlObject.position.add(forward);
        controlObject.position.add(sideways);
        this._position.copy(controlObject.position);

        oldPosition.copy(controlObject.position);

        if (this._mixer) {
            this._mixer.update(timeInSeconds);
        }
    }
};
export class ThirdPersonCamera {
    constructor(params) {
        this._params = params;
        this._camera = params.camera;
        console.log(this._params.target);
        this._currentPosition = new THREE.Vector3();
        this._currentLookat = new THREE.Vector3();
        console.log(this._params.target.Rotation);
    }
    
    _CalculateIdealOffset() {

        const idealOffset = new THREE.Vector3(-15, 20, -20);
        idealOffset.applyQuaternion(this._params.target.Rotation);
        idealOffset.add(this._params.target.Position);
        return idealOffset;
    }

    _CalculateIdealLookat() {
        const idealLookat = new THREE.Vector3(0, 10, 50);
        idealLookat.applyQuaternion(this._params.target.Rotation);
      
        idealLookat.add(this._params.target.Position);
        return idealLookat;
    }

    Update(timeElapsed) {
        const idealOffset = this._CalculateIdealOffset();
        const idealLookat = this._CalculateIdealLookat();

        // const t = 0.05;
        // const t = 4.0 * timeElapsed;
        const t = 1.0 - Math.pow(0.001, timeElapsed);

        this._currentPosition.lerp(idealOffset, t);
        this._currentLookat.lerp(idealLookat, t);

        // this._camera.position.copy(this._currentPosition);
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
        // kiểm tra có trạng thái trước đó sẽ dừng lại
        if (prevState) {
            if (prevState.Name == name) {
                return;
            }
            prevState.Exit();
        }

        const state = new this._states[name](this);
        // đặt lại trạng thái hiện tại
        this._currentState = state;
        state.Enter(prevState);
    }
    // khi thực hiện hành động
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
        this._AddState('jump', JumpState);
        this._AddState('punch', PunchState);
        this._AddState('flyKick', FlykickState);
        this._AddState('kick', KickState);
        this._AddState('death', DeathState);
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


class JumpState extends State {
    constructor(parent) {
        super(parent);

        this._FinishedCallback = () => {
            this._Finished();
        }
    }

    get Name() {
        return 'jump';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['jump'].action;
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
        const action = this._parent._proxy._animations['jump'].action;

        action.getMixer().removeEventListener('finished', this._CleanupCallback);
    }

    Exit() {
        this._Cleanup();
    }

    Update(_) {
    }
};
class PunchState extends State {
    constructor(parent) {
        super(parent);

        this._FinishedCallback = () => {
            this._Finished();
        }
    }

    get Name() {
        return 'punch';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['punch'].action;
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
        const action = this._parent._proxy._animations['punch'].action;

        action.getMixer().removeEventListener('finished', this._CleanupCallback);
    }

    Exit() {
        this._Cleanup();
    }

    Update(_) {
    }
};
class FlykickState extends State {
    constructor(parent) {
        super(parent);

        this._FinishedCallback = () => {
            this._Finished();
        }
    }

    get Name() {
        return 'flyKick';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['flyKick'].action;
        const mixer = curAction.getMixer();
        mixer.addEventListener('finished', this._FinishedCallback);// lắng nghe tiếp sự kiện sau đó

        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;
            curAction.enabled = true;
            curAction.reset();
            curAction.setLoop(THREE.LoopOnce, 1);
            curAction.clampWhenFinished = true;// dừng khi animation đã thực hiện
            curAction.crossFadeFrom(prevAction, 0.5, true);
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
        const action = this._parent._proxy._animations['flyKick'].action;

        action.getMixer().removeEventListener('finished', this._CleanupCallback);
    }

    Exit() {
        this._Cleanup();
    }

    Update(_) {
    }
};
class KickState extends State {
    constructor(parent) {
        super(parent);

        this._FinishedCallback = () => {
            this._Finished();
        }
    }

    get Name() {
        return 'kick';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['kick'].action;
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
        const action = this._parent._proxy._animations['kick'].action;

        action.getMixer().removeEventListener('finished', this._CleanupCallback);
    }

    Exit() {
        this._Cleanup();
    }

    Update(_) {
    }
};
class DeathState extends State {
    constructor(parent) {
        super(parent);

        this._FinishedCallback = () => {
            this._Finished();
        }
    }

    get Name() {
        return 'death';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['death'].action;
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
        const action = this._parent._proxy._animations['death'].action;

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
            this._parent.SetState('jump');
        } else if (input._keys.keyZ) {
            this._parent.SetState('punch');
        } else if (input._keys.keyC) {
            this._parent.SetState('kick');
        }
    }

};
