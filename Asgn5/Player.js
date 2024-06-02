import * as THREE from 'three';
import { GLTFLoader } from './lib/addons/GLTFLoader.js';

export class Player {
    constructor(scene) {
        this._input = new Input();
        this._stateMachine = new StateMachine();
        //console.log("hello");
        //variables
        this.mixer;
        this.clock = new THREE.Clock();
        this.animations;

        const gltfLoader = new GLTFLoader();
        let url = "./glb/UV_the_robot.glb";
        gltfLoader.load(url, (gltf) => {
            const root = gltf.scene;

            root.scale.set(.6, .6, .6);
            root.position.set(-4, 0, -4);
            scene.add(root);
            this.mixer = new THREE.AnimationMixer(root);
            //console.log(this.mixer)
            const clips = gltf.animations;

            //add all animations to a dictionary
            this.animations = clips;

            console.log(this.animations)
            const clip = THREE.AnimationClip.findByName(clips, 'Run');
            const action = this.mixer.clipAction(clip);
            action.play();
        });
    }

    Update() {
        //console.log("hi");
        //console.log(this.mixer);
        if (this.mixer == null) {
            return
        }
        this.mixer.update(this.clock.getDelta());
    }
}

//using code from https://www.youtube.com/watch?v=EkPfhzIbp2g&t=3s as reference for alot of below
class Controller {
    constructor() {
        this._input = new Input();
        this._stateMachine = new StateMachine();

    }
}

class Input {
    constructor() {
        this._keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false,
        }
        document.addEventListener('keydown', (e) => this.onKeyDown(e, true), false);
        document.addEventListener('keyup', (e) => this.onKeyDown(e, false), false);
    }

    onKeyDown(ev, down) { //gets the key down and if its up or not
        ev.preventDefault();
        //console.log("ev = " + ev);
        switch (ev.keyCode) {
            case 87: //w key
                //console.log("w = " + down)
                this._keys.forward = down;
                break;

            case 65: //a key
                //console.log("a = " + down)
                this._keys.left = down;
                break;

            case 83: //s key
                //console.log("s = " + down)
                this._keys.backward = down;
                break;

            case 68: //d key
                //console.log("d = " + down)
                this._keys.right = down;
                break;
            case 32: //spacebar
                //console.log("spacebar =" + down)
                this._keys.space = down;
                ev.preventDefault(); //prevents spacebar from scrolling on the page
                // found on stack overflow https://stackoverflow.com/questions/22559830/html-prevent-space-bar-from-scrolling-page
                break;
            case 16: //shift  
                this._keys.shift = down;
                break;
            default:
                //console.log("unknown Keydown  = " + ev.keyCode);
                break;
        }
    }

}

class State{
    constructor(parent){
        this._parent = parent;
    }
}

class StateMachine {
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
            if (prevState.Name == name) {//if we are in the same state dont do nothing
                return;
            }
            prevState.Exit();
        }

        const state = new this._states[name](this);

        this._currentState = state;
        state.Enter(prevState);
    }
}

class CharacterFSM extends StateMachine{
    constructor(proxy){
        super();
        this._proxy = proxy;
        this._Init();
    }

    _Init(){
        this._AddState('idle', IdleState);
        this._AddState('walk', WalkState);
        this._AddState('run', RunState)
    }
}

