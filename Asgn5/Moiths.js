import * as THREE from 'three';
import { GLTFLoader } from './lib/addons/GLTFLoader.js';
import {Player} from './Player.js';

export class Moiths{
    constructor(bot, scene){
        this.clock = new THREE.Clock();
        this.boids = [];
        this.bot = bot; // pass in the bot so the boids can avoid it
        this.scene = scene;
        this.box;
        this.mixer;
        this.boxOpen;

        this.center = new THREE.Vector3(0,15,0);

        //generate boids
        for (let i = 0; i < 100; i++) {
            let boid = new Moith(this.scene);
            this.boids.push(boid);
        }

        this.moonPull = true;



        const gltfLoader = new GLTFLoader();
        let url = "./glb/box.glb";
        gltfLoader.load(url, (gltf) => {
            const root = gltf.scene;

            //root.scale.set(.6, .6, .6);
            //root.position.copy(this.position);



            this.scene.add(root);
            this.mixer = new THREE.AnimationMixer(root);
            this.box = root;
            this.box.rotation.y = Math.PI;

            //console.log(this.bot)
            const clips = gltf.animations;
            const clip = THREE.AnimationClip.findByName(clips, 'Open');

            const action = this.mixer.clipAction(clip);
            this.boxOpen = action;
            this.boxOpen.setLoop(THREE.LoopOnce);
            //this.boxOpen.clampWhenFinished = true;
            //this.boxOpen.enable = true;
            //action.play();

        });
    }

    OpenBox(){
        console.log(this.boxOpen)
        
        let boid1 = new Moith(this.scene);
        boid1.position = new THREE.Vector3(0,.1,0);
        boid1.volocity = new THREE.Vector3(0,1,0);
        this.boids.push(boid1);

        let boid2 = new Moith(this.scene);
        boid2.position = new THREE.Vector3(0,.1,1);
        boid2.volocity = new THREE.Vector3(0,1,0);
        this.boids.push(boid2);

        let boid3 = new Moith(this.scene);
        boid3.position = new THREE.Vector3(0,.1,-1);
        boid3.volocity = new THREE.Vector3(0,1,0);
        this.boids.push(boid3);

        this.boxOpen.play().reset();
        this.boxOpen.play();
    }

    moonPullTrue(){
        this.moonPull = true;
        //console.log("sans")
    }

    moonPullFalse(){
        this.moonPull = false;
    }

    Update(){
        let timeDelta = this.clock.getDelta();
        this.boids.forEach((boid) => {
            if (!boid.mixer) {
               return 
            }
            
            let position = boid.position;
            let velocity = boid.volocity;
            

            let rule1 = new THREE.Vector3();//boids want to go to the center of other nearby boids
            let rule2 = new THREE.Vector3();//keep a small distance away from all boids
            let rule3 = new THREE.Vector3();//match velocity of other boids

            let rule4 = this.center.clone();//all boids should try to go to the center
            rule4.sub(position);
            
            
            let numOfBoidsNear = 0;
            this.boids.forEach((boid2) => {
                if (boid2 == boid) {
                    return;
                }
                let distance = boid2.position.clone().sub(position);

                //if the distance is larger than 3 we dont care
                if (distance.length() > 2) { //todo check if behind using dot product
                    return;
                }
                numOfBoidsNear += 1;

                rule2.sub(distance)

                rule3.add(boid2.volocity);

                //boid2
            });
            if (numOfBoidsNear != 0) {
                rule3.divideScalar(numOfBoidsNear);
            }
            
            let BotPos = this.bot.position.clone();
            //console.log(BotPos)
            BotPos.y += 2;
            let distToBot = BotPos.sub(position);
            //console.log(distToBot)
            if (distToBot.length() < 7) {
                //console.log("BotPos")
                distToBot.multiplyScalar(1);
                rule2.sub(distToBot);
            }


            rule2.divideScalar(0.5);
            rule2.multiplyScalar(timeDelta);

            rule3.divideScalar(1);
            rule3.multiplyScalar(timeDelta);

            rule4.divideScalar(8);
            rule4.multiplyScalar(timeDelta);
            //console.log(burger)
            //add all the rules together
            boid.volocity.add(rule2);
            boid.volocity.add(rule3);
            //console.log(rule3)

            if (this.moonPull) {
                boid.volocity.add(rule4);
            }else{
                boid.volocity.sub(rule4);
            }
            

            boid.volocity.normalize()
            boid.volocity.multiplyScalar(1.5);
            boid.Update()
        });

        if (this.mixer) {
            this.mixer.update(timeDelta*1 );
        }
        

    }
}

class Moith{
    constructor(scene){

        //this.volocity = new THREE.Vector3();// ra
        this.volocity = new THREE.Vector3().random();//random starting volocity
        this.volocity.x += -.5;
        this.volocity.y += -.5;
        this.volocity.z += -.5;
        this.volocity.normalize();

        this.position = new THREE.Vector3().random();//random position
        this.position.x += -.5;
        this.position.y += -.5;
        this.position.z += -.5;
        this.position.multiplyScalar(20);
        this.position.y += 15;

        this.animationOffset = Math.random();

        this.obj;
        this.clock = new THREE.Clock();

        this.scene = scene;


        //load moth model and animations
        const gltfLoader = new GLTFLoader();
        let url = "./glb/moth.glb";
        gltfLoader.load(url, (gltf) => {
            const root = gltf.scene;

            root.scale.set(.6, .6, .6);
            root.position.copy(this.position);



            this.scene.add(root);
            this.mixer = new THREE.AnimationMixer(root);
            this.obj = root;

            //console.log(this.bot)
            const clips = gltf.animations;
            //console.log(clips)

            //console.log(this._stateMachine.actions)
            const clip = THREE.AnimationClip.findByName(clips, 'Fly');
            this.animationOffset = this.animationOffset * clip.duration;


            const action = this.mixer.clipAction(clip);
            action.time = this.animationOffset;
            action.play();

        });


        //set position

        //set volocity
    }

    
    Update() {
        //console.log("hi");
        //console.log(this.mixer);
        if (this.mixer == null) {
            return
        }
        let timeDelta = this.clock.getDelta();
        //console.log("hello everybody")
        let next = new THREE.Vector3().copy(this.position);
        let vel = new THREE.Vector3().copy(this.volocity);
        vel.multiplyScalar(timeDelta*5);
        next.add(vel);
        

        //this.volocity.normalize();
        //this.volocity.multiplyScalar(timeDelta);
        this.position.copy(next);
        

        this.obj.lookAt(next);

        let rule1 = new THREE.Vector3();//boids want to go to the center
        let rule2 = new THREE.Vector3();//
        let rule3 = new THREE.Vector3();

        

        this.obj.position.x = this.position.x;
        this.obj.position.y = this.position.y;
        this.obj.position.z = this.position.z;
        

        //update animation
        this.mixer.update(timeDelta*1 );
    }
}