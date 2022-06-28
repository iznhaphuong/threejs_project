import * as THREE from 'three';


export const player_state = (() => {

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
    class AttackState extends State {
        constructor(parent) {
          super(parent);
      
          this._action = null;
      
          this._FinishedCallback = () => {
            this._Finished();
          }
        }
      
        get Name() {
          return 'attack';
        }
      
        Enter(prevState) {
          this._action = this._parent._proxy._animations['attack'].action;
          const mixer = this._action.getMixer();
          mixer.addEventListener('finished', this._FinishedCallback);
      
          if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;
      
            this._action.reset();  
            this._action.setLoop(THREE.LoopOnce, 1);
            this._action.clampWhenFinished = true;
            this._action.crossFadeFrom(prevAction, 0.2, true);
            this._action.play();
          } else {
            this._action.play();
          }
        }
      
        _Finished() {
          this._Cleanup();
          this._parent.SetState('idle');
        }
      
        _Cleanup() {
          if (this._action) {
            this._action.getMixer().removeEventListener('finished', this._FinishedCallback);
          }
        }
      
        Exit() {
          this._Cleanup();
        }
      
        Update(_) {
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

    return {
        State: State,
        KickState: KickState,
        PunchState: PunchState,
        JumpState: JumpState,
        IdleState: IdleState,
        WalkState: WalkState,
        RunState: RunState,
        DeathState: DeathState,
    };

})();