import * as THREE from 'three';


export class ThirdPersonCamera {
    constructor(camera) {
        this.threeCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);

        //set camera pos
        this.threeCamera.position.z = 4;
        this.threeCamera.position.y = 4;
        this.threeCamera.position.x = 4;

        const controls = new OrbitControls(this.threeCamera, g_renderer.domElement);

    }

    Update() {
        //console.log("hi");
        //console.log(this.mixer);
        controls.update();
       
        //fix stretch
        if (resizeRendererToDisplaySize(renderer)) {//check if the display needs to be updated
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }


    }
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