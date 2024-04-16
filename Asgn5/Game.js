import * as THREE from 'three';
function main(){
    //set up Three.js
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    //create cammera
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    //create scene
    const scene = new THREE.Scene();

    //create box
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    //create material using css hex codes
    const material = new THREE.MeshBasicMaterial({color: 0x44aa88});

    //add the cube to the scene
    scene.add(cube);
}