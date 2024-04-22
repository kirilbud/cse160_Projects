//import * as THREE from './lib/three.module.js';

import * as THREE from 'three';
import {OBJLoader} from './lib/addons/OBJLoader.js';
import {MTLLoader} from './lib/addons/MTLLoader.js';

//wack ass onload work around
window.onload = function() {main()}


function main(){
    //console.log("hello world");
    //set up Three.js
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    //create cammera
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    //set camera pos
    camera.position.z = 4;

    //create scene
    const scene = new THREE.Scene();

    { // create light 
        const color = 0xFFFFFF;
		const intensity = 3;
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
    var musicBox;
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
            root.position.y = -1;
            musicBox = root;
        });
    });
    



    //create geometry
    const shapes = [
        makeInstance(box, 0xF5A9B8,  0, 1),
        makeInstance(cone, 0xFFFFFF, -3, 0),
        makeInstance(geometry, 0x5BCEFA,  3, 0),
    ];

    //create material using css hex codes
    //const material = new THREE.MeshBasicMaterial({color: 0x44aa88}); //MeshBasicMaterial is not affected by lights
    //const material = new THREE.MeshPhongMaterial({color: 0x44aa88}); //MeshPhongMaterial is affected by lights

    //add the cube to the scene
    //const cube = new THREE.Mesh(geometry, material);
    //scene.add(cube);


    renderer.render(scene, camera);

    function makeInstance(geometry, color, x, y) { // returns the following geometry
        const material = new THREE.MeshPhongMaterial({color});
       
        const shape = new THREE.Mesh(geometry, material);
        scene.add(shape);
       
        shape.position.x = x;
        shape.position.y = y;
       
        return shape;
    }

    
    //function that renders the whole scene and is called with requestAnimationFrame
    function render(time) {
        time *= 0.001;  // convert time to seconds
       
        //fix stretch
        if (resizeRendererToDisplaySize(renderer)) {//check if the display needs to be updated
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        

        shapes.forEach((shape, ndx) => {//rotate all the s
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            shape.rotation.x = rot;
            shape.rotation.y = rot;
        });

        //musicBox.rotation.x = time * 3;
        if (musicBox) {
            musicBox.rotation.y = time * 3;
        }
        
       
        renderer.render(scene, camera);//render the next frame
       
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render); // calls the render function and passes time since last render
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

//main();