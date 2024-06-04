import * as THREE from 'three';
import { GLTFLoader } from './lib/addons/GLTFLoader.js';

export class Player {
    constructor(scene , controlls) {
        this.controlls = controlls;
        

        this.up = new THREE.Vector3(0,1,0);
        this.forward = 

        this.position = new THREE.Vector3(-4,0,-4);
        this._input = new Input();
        
        //console.log("hello");
        //variables
        this.mixer;
        this.clock = new THREE.Clock();
        this.animations = null;

        this._stateMachine = new CharacterFSM(this.animations, this.mixer);//these will be null cuz of asynch
        

        const gltfLoader = new GLTFLoader();
        let url = "./glb/UV_the_robot.glb";
        gltfLoader.load(url, (gltf) => {
            const root = gltf.scene;

            root.scale.set(.6, .6, .6);
            root.position.set(-4, 0, -4);
            scene.add(root);
            this.mixer = new THREE.AnimationMixer(root);
            this.bot = root;

            console.log(this.bot)
            const clips = gltf.animations;

            //add all animations to a dictionary
            this.animations = clips;


            //pass this into state machine
            this._stateMachine.actions = this.animations;
            this._stateMachine.mixer = this.mixer;

            //console.log(this._stateMachine.actions)
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

        let timeDelta = this.clock.getDelta();


        let forward = new THREE.Vector3(0,0,-1);
        forward.applyAxisAngle(this.up, this.controlls.getAzimuthalAngle());

        let LR_vector = new THREE.Vector3();
        LR_vector.crossVectors(forward, this.up);
        LR_vector.normalize();

        let wanted_vector = new THREE.Vector3();

        

        //get actions
        const runClip = THREE.AnimationClip.findByName(this.animations, 'Run');
        const runAct = this.mixer.clipAction(runClip);

        const idleClip = THREE.AnimationClip.findByName(this.animations, 'Idle');
        const idleAct = this.mixer.clipAction(idleClip);


        //set camera to bot and set offset
        const camOffset = new THREE.Vector3(0,2.5,0);

        this.controlls.target = this.position.clone();

        this.controlls.target.add(camOffset);
        

        //check if a moving key has been pressed
        if (!(this._input._keys.forward || this._input._keys.backward || this._input._keys.left || this._input._keys.right)) { //idle
            //console.log("idle");
            runAct.stop();
            idleAct.play();


        }else{ //running
            //make bot match the camera angle
            runAct.play();
            idleAct.stop();

            //create wanted vector from key input

            if (this._input._keys.forward) {
                wanted_vector.add(forward);
            }
            if (this._input._keys.backward) {
                wanted_vector.sub(forward);
            }

            if (this._input._keys.left) {
                wanted_vector.sub(LR_vector);
            }
            if (this._input._keys.right) {
                wanted_vector.add(LR_vector);
            }

            wanted_vector.normalize();

            forward.copy(wanted_vector)


            forward.multiplyScalar(timeDelta*11);


            //console.log(timeDelta*10)

            this.position.add(forward);
            

            this.controlls.object.position.x += forward.x;
            this.controlls.object.position.y += forward.y;
            this.controlls.object.position.z += forward.z;

            this.bot.lookAt(this.position);

            //this.bot.rotation.y = this.controlls.getAzimuthalAngle() + Math.PI;
        }

        //set bot to right position
        this.bot.position.x = this.position.x;
        this.bot.position.y = this.position.y;
        this.bot.position.z = this.position.z;

        //update animation
        this.mixer.update(timeDelta*1.2);
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
        //ev.preventDefault();
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

    Enter(){}
    Exit(){}
    Update(){};
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
    constructor(actions, mixer){
        super();
        this.mixer = mixer;
        this.actions = actions;
        this._Init();
    }

    _Init(){
        this._AddState('Idle', IdleState);
        //this._AddState('Walk', WalkState);
        //this._AddState('Run', RunState)
    }
}


class IdleState extends State{

    
    constructor(parent){
        super(parent);
    }

    //get the name of the this state
    get Name(){
        return 'Idle'
    }

    Enter(prevState){
        const idleClip = THREE.AnimationClip.findByName(this._parent._proxy.animations, 'Run');
        const idleact = THREE.AnimationClip.findByName(this._parent._proxy.animations, 'Run');
        if (prevState) {
            
        }else{
            idleAct.play;
        }
    }
}

