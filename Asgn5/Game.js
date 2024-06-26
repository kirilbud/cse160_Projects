//import * as THREE from './lib/three.module.js';

import * as THREE from 'three';
import {OBJLoader} from './lib/addons/OBJLoader.js';
import {MTLLoader} from './lib/addons/MTLLoader.js';
import {GLTFLoader} from './lib/addons/GLTFLoader.js';
import {OrbitControls} from './lib/addons/OrbitControls.js';
import {Player} from './Player.js';
import {Moiths} from './Moiths.js';
import {Water} from './lib/addons/Water.js';

//wack ass onload work around
window.onload = function() {main()}

//GLOBALS
let g_canvas;
let g_renderer;
let g_camera; //move into player at some point
let g_scene;

let g_shapes; //temp

let g_player;
let g_boids;

let g_controlls; //temp

let g_musicbox;

let g_Moon;

let g_Water;

const g_raycaster = new THREE.Raycaster();

let g_clock = new THREE.Clock();

let g_music = new Audio('./music/made_in_like20min.mp3');

function main(){
    //console.log("hello world");
    //set up Three.js
    const canvas = document.querySelector('#c');
    g_canvas = canvas;
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    g_renderer = renderer;

    //create cammera
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    //set camera pos
    camera.position.z = -10;
    camera.position.y = 4;
    camera.position.x = -10;
    g_camera = camera;

    g_controlls = new OrbitControls(camera, g_renderer.domElement);
    g_controlls.enablePan = false;
    g_controlls.maxDistance = 35;
    g_controlls.minDistance = 2;
    console.log(g_controlls.getAzimuthalAngle())
    g_controlls.target = new THREE.Vector3(-4,0,-4);
    //create scene
    const scene = new THREE.Scene();
    g_scene = scene;



    { // create light 
        const color = 0xCBC3E3;
		const intensity = 7;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( - 1, 2, 4 );
		scene.add( light );
    }

    //define box
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const box = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    //define cone
    const rad = 1;
    const height = 1;
    const radialSegs = 16;
    const cone = new THREE.ConeGeometry( rad, height, radialSegs );

    //define Torus
    const torRad = 1;
    const tubeRad = .2;
    const torRadSegs = 14;
    const tubSegs =  20;
    const geometry = new THREE.TorusGeometry(torRad, tubeRad, torRadSegs, tubSegs);

    //make music box
    //var musicBox;
    const mtlLoader = new MTLLoader();
    mtlLoader.load('./Objs/music_box.mtl', (mtl) => {
        mtl.preload();
        //mtl.minFilter = THREE.NearestFilter;
        //mtl.magFilter = THREE.NearestFilter;
        const music_box = new OBJLoader();
        music_box.setMaterials(mtl);
        //let mus_box;
        music_box.load('./Objs/music_box.obj', (root) => {
            scene.add(root);
            root.position.y = 2;
            root.position.x = -15;
            
            g_musicbox = root;
        });
    });
    

    
    const gltfLoader = new GLTFLoader();
    let url = "./glb/scene.gltf";
    /*
    gltfLoader.load(url, (gltf) => {
        const root = gltf.scene;
        
        scene.add(root);

    });
    */
    

    //const gltfLoader = new GLTFLoader();
    //spawn robot
    g_player = new Player(scene, g_controlls);

    //make boids
    g_boids = new Moiths(g_player, scene);


    //gltfLoader = new GLTFLoader();
    url = "./glb/moon.glb";
    gltfLoader.load(url, (gltf) => {
        const root = gltf.scene;
        root.scale.set(3, 3, 3);
        g_Moon = root;

        g_Moon.position.y = g_boids.center.y;

        scene.add(root);

    });

    const waterMesh = new THREE.PlaneGeometry( 5000, 5000 );

    g_Water = new Water(waterMesh,{
        textureWidth: 512,
        textureHight: 512,
        waterNormals: new THREE.TextureLoader().load('./Textures/water/waternormals.jpg', function(texture){
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),

        sunDirection: new THREE.Vector3( 1, -2, -4),
        sunColor: 0x4f42b5,
        waterColor: 0x05014a,
        distortionScale: 1,
        fog: scene.fog !== undefined
    });

    g_Water.rotation.x = -Math.PI / 2;
    
    scene.add(g_Water);


    /*
    url = "./glb/UV_the_robot.glb";
    gltfLoader.load(url, (gltf) => {
        const root = gltf.scene;

        root.scale.set(.6,.6,.6);
        scene.add(root);

    });
    */

    //create geometry
    /*
    g_shapes = [
        makeInstance(box, 0xF5A9B8,  1, 5, 2),
        makeInstance(box, 0x5BCEFA,  4, 1, 8),
        makeInstance(box, 0xF5A9B8,  3, 2, -8),
        makeInstance(box, 0xffffff,  -2, 3, 2),
        makeInstance(cone, 0xF5A9B8, -3, 4, -2),
        makeInstance(cone, 0x5BCEFA, 3, 2, 2),
        makeInstance(cone, 0xffffff, -8, 2, 2),
        makeInstance(geometry, 0x5BCEFA,  2, 4, -3),
        makeInstance(geometry, 0xffffff,  -6, 2, -3),
        makeInstance(geometry, 0xF5A9B8,  -2, 4, 3),
    ];
    */
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load( './Imgs/silly.jpg' );
    texture.colorSpace = THREE.SRGBColorSpace;
    //g_shapes[0].material =  new THREE.MeshBasicMaterial({map: texture});


    //skybox
    {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            "./Textures/sky/divine_ft.jpg",
            "./Textures/sky/divine_bk.jpg",
            "./Textures/sky/divine_up.jpg",
            "./Textures/sky/divine_dn.jpg",
            "./Textures/sky/divine_rt.jpg",
            "./Textures/sky/divine_lf.jpg",
        ]);
        scene.background = texture;
    }


    renderer.render(scene, camera);

    document.addEventListener('mousedown', onClick);
    document.addEventListener('mouseup', unClick);

    
    
    requestAnimationFrame(render); // calls the render function and passes time since last render
}


//function that renders the whole scene and is called with requestAnimationFrame
function render(time) {
    //console.log(g_controlls.getAzimuthalAngle())
    g_player.Update();
    g_boids.Update();

    

    time *= 0.001;  // convert time to seconds

    g_Water.material.uniforms['time'].value += 1.0 / 600.0;

    g_controlls.update();
   
    //fix stretch
    if (resizeRendererToDisplaySize(g_renderer)) {//check if the display needs to be updated
        const canvas = g_renderer.domElement;
        g_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        g_camera.updateProjectionMatrix();
    }
    
    /*
    g_shapes.forEach((shape, ndx) => {//rotate all the shapes
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        shape.rotation.x = rot;
        shape.rotation.y = rot;
    });
    */
    
    //musicBox.rotation.x = time * 3;
    if (g_musicbox) {
        g_musicbox.rotation.y = time * 3;
    }
    

    if (g_Moon) {
        g_Moon.rotation.y = time /5;
    }
   
    g_renderer.render(g_scene, g_camera);//render the next frame
   
    requestAnimationFrame(render);
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;//checks if the current dementions are the same as the ones the canvas is  at
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}

function makeInstance(geometry, color, x, y, z) { // returns the following geometry
    const material = new THREE.MeshPhongMaterial({color});
   
    const shape = new THREE.Mesh(geometry, material);
    g_scene.add(shape);
   
    shape.position.x = x;
    shape.position.y = y;
    shape.position.z = z;
   
    return shape;
}

function onClick(ev){
    const canvas = g_renderer.domElement;
    const cursorX = (ev.clientX / canvas.clientWidth) * 2 -1;
    const cursorY = -((ev.clientY / canvas.clientHeight) * 2 -1);
    const coords = new THREE.Vector2(cursorX,cursorY);
    g_raycaster.setFromCamera(coords, g_camera);
 
    const moons = g_raycaster.intersectObject(g_Moon, true);
    

    if (moons.length > 0) {
        //console.log("AMONGUS")
        g_boids.moonPullFalse();
    }

    const box =  g_raycaster.intersectObject(g_musicbox, true);
    if (box.length > 0) {
        
        if (g_music.paused) {
            g_music.play();
        }else{
            g_music.pause();
            g_music.currentTime = 0;
        }
    }


    const chest =  g_raycaster.intersectObject(g_boids.box, true);
    if (chest.length > 0) {
        g_boids.OpenBox();
    }
}

function unClick(ev){
    
    g_boids.moonPullTrue();
    

}


//main();