class Camera {
    constructor() {
        // x = left right
        // y = up down
        // z = left right
        this.eye = new Vector3([16, 4, 10]);
        this.at = new Vector3([16, 4, 11]);
        this.up = new Vector3([0, 1, 0]);

        this.angle_x = 0;
        this.angle_y = 0;

        this.speed = 7.0;

        this.select_dist = 15;

        this.placeCube = null;
        this.RemoveCube = null;


        this.selectObj = new Custom("./select/select.obj", "./select/select.mtl");
    }


    rotateX(angle) {
        let delta_ang = angle - this.angle_x;
        this.angle_x = angle;
        this.at.sub(this.eye)
        var matrix = new Matrix4().setRotate(delta_ang, 1, 0, 0);
        this.at = matrix.multiplyVector3(this.at);
        this.at.add(this.eye)
    }

    rotateY(angle) {
        let delta_ang = angle - this.angle_y;
        this.angle_y = angle;
        this.at.sub(this.eye)
        var matrix = new Matrix4().setRotate(delta_ang, 0, 1, 0);
        this.at = matrix.multiplyVector3(this.at);
        this.at.add(this.eye)
    }


    rotate(xAng, yAng) { //todo only turn x if between -90 and 90
        let delta_ang_y = yAng - this.angle_y;
        this.angle_y = yAng;
        let delta_ang_x = xAng - this.angle_x;
        this.angle_x = xAng;
        this.at.sub(this.eye) //get local space

        var x_vector = Vector3.cross(this.at, this.up).normalize();


        //this.up = matrix.multiplyVector3(this.up);

        //console.log(this.angle_x)
        matrix = new Matrix4().rotate(delta_ang_y, 0, 1, 0);
        this.at = matrix.multiplyVector3(this.at);

        var matrix = new Matrix4().rotate(delta_ang_x, x_vector.elements[0], x_vector.elements[1], x_vector.elements[2]);
        this.at = matrix.multiplyVector3(this.at);


        this.at = matrix.multiplyVector3(this.at);
        this.at.add(this.eye)// add it back
    }

    handle_movement(forward, back, right, left, up, down, delta_time) {

        if (!forward && !back && !right && !left && !up && !down) { //check if a button is even pressed
            //todo add momentum
            return;
        }

        var wanted_vector = new Vector3(); //store the 

        //get local eye position and make it the forward vector
        var forward_vect = new Vector3();

        forward_vect = forward_vect.set(this.at)
        forward_vect.sub(this.eye)
        //console.log(forward_vect);

        var LR_vector = Vector3.cross(forward_vect, this.up).normalize();

        //handel forward back movement
        if (forward) {
            wanted_vector.add(forward_vect);
        }

        if (back) {
            wanted_vector.sub(forward_vect);
        }



        //handel left right movement

        if (right) {
            wanted_vector.add(LR_vector);
        }

        if (left) {
            wanted_vector.sub(LR_vector);
        }



        //handel up down

        if (up) {
            wanted_vector.add(this.up);
        }

        if (down) {
            wanted_vector.sub(this.up);
        }

        if (wanted_vector.magnitude() == 0) {
            return
        }
        wanted_vector.normalize();
        wanted_vector.mul(delta_time * this.speed);

        this.eye.add(wanted_vector);
        this.at.add(wanted_vector);

        

        //console.log(this.eye)

        //TODO check collision
        if ( // check if within the map to start for collision checks
            !(this.eye.elements[0] < 0 || this.eye.elements[0] > 32 ||
            this.eye.elements[1] < 0 || this.eye.elements[1] > 32 ||
            this.eye.elements[2] < 0 || this.eye.elements[2] > 32)
        ) {
            //get map location
            let mapX = Math.floor(this.eye.elements[0]);
            let mapY = Math.floor(this.eye.elements[1]);
            let mapZ = Math.floor(this.eye.elements[2]);

            //get sub block position
            let subX = this.eye.elements[0] % 1;
            let subY = this.eye.elements[1] % 1;
            let subZ = this.eye.elements[2] % 1;

            //check if within .2 of possible block
            if (mapX > 0 && subX < .2) {
                if (g_map.cubes[mapX-1][mapZ][mapY] !== null) {
                    this.eye.elements[0] = this.eye.elements[0] + (.2 - subX);
                    this.at.elements[0] = this.at.elements[0] + (.2 - subX);
                }
            }else if (mapX < 31 && subX > .8) {
                if (g_map.cubes[mapX+1][mapZ][mapY] !== null) {
                    this.eye.elements[0] = this.eye.elements[0] + (.8 - subX);
                    this.at.elements[0] = this.at.elements[0] + (.8 - subX);
                }
            }

            if (mapY > 0 && subY < .2) {
                if (g_map.cubes[mapX][mapZ][mapY-1] !== null) {
                    this.eye.elements[1] = this.eye.elements[1] + (.2 - subY);
                    this.at.elements[1] = this.at.elements[1] + (.2 - subY);
                }
            }else if (mapY < 31 && subY > .8) {
                if (g_map.cubes[mapX][mapZ][mapY+1] !== null) {
                    this.eye.elements[1] = this.eye.elements[1] + (.8 - subY);
                    this.at.elements[1] = this.at.elements[1] + (.8 - subY);
                }
            }

            if (mapZ > 0 && subZ < .2) {
                if (g_map.cubes[mapX][mapZ-1][mapY] !== null) {
                    this.eye.elements[2] = this.eye.elements[2] + (.2 - subZ);
                    this.at.elements[2] = this.at.elements[2] + (.2 - subZ);
                }
            }else if (mapZ < 31 && subZ > .8) {
                if (g_map.cubes[mapX][mapZ+1][mapY] !== null) {
                    this.eye.elements[2] = this.eye.elements[2] + (.8 - subZ);
                    this.at.elements[2] = this.at.elements[2] + (.8 - subZ);
                }
            }

        }


        //idea check if within .2 of a block and then move up to where player is ment ot be
    }


    //using DDA also know as Digital Differential Analyzer
    castRay() {// guide found on https://lodev.org/cgtutor/raycasting.html
        //the guide was for C and also only in 3D so I had to addapt it alot to fit my program
        //Still really usefull and interesting so if you are reading this please check it out

        if ( // check if within the map to even start if not return without casting ray. there is a better way to do this
            this.eye.elements[0] < 0 || this.eye.elements[0] > 32 ||
            this.eye.elements[1] < 0 || this.eye.elements[1] > 32 ||
            this.eye.elements[2] < 0 || this.eye.elements[2] > 32
        ) {
            console.log("out of bounds for raycast")
            this.placeCube = null;
            this.RemoveCube = null;
            return;
        }
        //console.log(this.eye)

        let direction_vect = new Vector3();
        direction_vect.set(this.at);
        direction_vect.sub(this.eye);
        direction_vect.normalize();

        //map position of the ray to be used in checks
        let mapX = Math.floor(this.eye.elements[0]);
        let mapY = Math.floor(this.eye.elements[1]);
        let mapZ = Math.floor(this.eye.elements[2]);

        let deltDistX;
        let deltDistY;
        let deltDistZ;

        if (direction_vect.elements[0] == 0) { //make sure we arnt dividing by 0
            deltDistX = Infinity;
        } else {
            deltDistX = Math.abs(1 / direction_vect.elements[0])
        }

        //do the same for the next 2

        if (direction_vect.elements[1] == 0) {
            deltDistY = Infinity;
        } else {
            deltDistY = Math.abs(1 / direction_vect.elements[1])
        }

        if (direction_vect.elements[2] == 0) {
            deltDistZ = Infinity;
        } else {
            deltDistZ = Math.abs(1 / direction_vect.elements[2])
        }


        //calculate the initial side distance as well as the step amount

        let stepX;
        let stepY;
        let stepZ;

        let sideDistX;
        let sideDistY;
        let sideDistZ;

        if (direction_vect.elements[0] < 0) { //check if the direction is negative for x
            stepX = -1;
            sideDistX = (this.eye.elements[0] - mapX) * deltDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - this.eye.elements[0]) * deltDistX;
        }

        //do the same for the rest of the 3 variables
        if (direction_vect.elements[1] < 0) { //check if the direction is negative for y
            stepY = -1;
            sideDistY = (this.eye.elements[1] - mapY) * deltDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - this.eye.elements[1]) * deltDistY;
        }

        if (direction_vect.elements[2] < 0) { //check if the direction is negative for Z
            stepZ = -1;
            sideDistZ = (this.eye.elements[2] - mapZ) * deltDistZ;
        } else {
            stepZ = 1;
            sideDistZ = (mapZ + 1.0 - this.eye.elements[2]) * deltDistZ;
        }


        let hit = 0; // I can probobly change this to a pointer to what it hit next
        let side = 0; // this will be used to place blocks
        //when exiting the loop sides value means
        //0 = x side was hit
        //1 = y side was hit
        //2 = z side was hit

        //loop untill hitsomething or 
        let looking_at_npc = false;
        while (hit == 0) { //todo limit to distance somehow

            //increment ray for what the next closes distance is
            if (sideDistX < sideDistY && sideDistX < sideDistZ) { //distx is the smallest
                sideDistX = sideDistX + deltDistX;
                mapX = mapX + stepX;
                side = 0;
            } else {//disty or distz is the smallest
                if (sideDistY < sideDistZ) { // disty is smallest
                    sideDistY = sideDistY + deltDistY;
                    mapY = mapY + stepY;
                    side = 1;
                } else { // distZ is the smallest
                    sideDistZ = sideDistZ + deltDistZ;
                    mapZ = mapZ + stepZ
                    side = 2;
                }
            }


            //make sure we are in the right bounds still if not just exit

            if ( // check if within the map to even start if not return without casting ray. there is a better way to do this
                mapX < 0 || mapX > 31 ||
                mapZ < 0 || mapZ > 31 ||
                mapY < 0 || mapY > 31
            ) {
                console.log("Target out of bounds for raycast")
                this.placeCube = null;
                this.RemoveCube = null;
                return;
            }
            //console.log("mapX = " + mapX);
            //console.log("mapY = " + mapY);
            //console.log("mapZ = " + mapZ);

            //check for collision
            //yes its x z y not x y z
            //look in map.js for apology

            if (g_map.cubes[mapX][mapZ][mapY] !== null) {
                //g_map.cubes[mapX][mapZ][mapY] = null;
                hit = 1;
            }

            if (//check if looking at npc
                Math.floor(npc.position.elements[0]) == mapX &&
                (Math.floor(npc.position.elements[1])+1 == mapY || Math.floor(npc.position.elements[1]) == mapY) &&
                Math.floor(npc.position.elements[2]) == mapZ 
            ) {
                looking_at_npc = true;
            }
            //let npc_current_ani = npc.animation;
            if (looking_at_npc) {
                npc.lookingAtNpc = true;
                //console.log("looking at npc")
            }else{
                npc.lookingAtNpc = false;
                //console.log("Not looking at npc")
            }

        }

        if (hit == 0) {
            console.log(sideDistY)
            debugger;
        }

        //console.log("placing cube at "+ mapX +", " + mapY +", " + mapZ + "side side is" + side + "hit is "+ hit)

        switch (side) {
            case 0://hit on x
                this.placeCube = [mapX - stepX, mapY, mapZ];
                this.selectObj.matrix.setTranslate(mapX - stepX +.5, mapY+.5, mapZ+.5);
                this.selectObj.matrix.translate((.5-0.0625)* stepX, 0, 0);
                this.selectObj.matrix.rotate(90, 0, 0, 1);
                break;
            case 1://hit on y
                this.placeCube = [mapX, mapY - stepY, mapZ];
                this.selectObj.matrix.setTranslate(mapX+.5, mapY - stepY+.5, mapZ+.5);
                this.selectObj.matrix.translate(0, (.5-0.0625)* stepY, 0);
                this.selectObj.matrix.rotate(90, 0, 1, 0);
                break;
            case 2:// hit on z
                this.placeCube = [mapX, mapY, mapZ - stepZ];
                this.selectObj.matrix.setTranslate(mapX+.5, mapY+.5, mapZ - stepZ+.5);
                this.selectObj.matrix.translate(0, 0, (.5-0.0625)* stepZ);
                this.selectObj.matrix.rotate(90, 1, 0, 0);
                break;

            default:
                this.placeCube = null;
                break;
        }

        this.RemoveCube = [mapX, mapY, mapZ];

        //let test = new Cube();
        //test.matrix.setTranslate(this.placeCube[0], this.placeCube[1], this.placeCube[2]);
        //test.matrix.scale(2,2,2)
        //test.render()

        if (this.selectObj.finished_making_objs) {
            this.selectObj.render();
        }

        //todo spawn a little pointer
        //console.log(deltDistX)
    }
}