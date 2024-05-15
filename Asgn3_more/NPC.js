class NPC {
    constructor() {
        this.head;
        this.body;
        this.armLeft;
        this.armRight;
        this.legLeft;
        this.legRight;
        this.tail1;
        this.tail2;
        this.npcMatrix = new Matrix4();
        this.position = new Vector3([16.5, 2, 16.5]);//this is the correct space but will need to fix when adding collisions
        this.forwardVect = new Vector3([0, 0, -1]);
        this.animation = 2;
        this.rotation = Math.random() * 359;
        this.delta_rotation = (Math.random() * 30) - 15;

        let animal = ["Rac", "Gat", "owl"];
        animal = animal[Math.floor(Math.random() * animal.length )]

        this.changeCharacter(animal);
        this.timer = g_startTime + (Math.random() * 15) + 3;//time till switching states

        this.lookingAtNpc = false;


    }

    changeCharacter(animal) {
        switch (animal) {
            case "Rac":// raccoon ====================================================================================
                this.head = new Custom("./Objs/low_poly_raccoon.obj", "./Objs/low_poly_raccoon.mtl");

                this.body = new Custom("./Objs/low_poly_raccoon_body.obj", "./Objs/low_poly_raccoon_body.mtl");


                this.legLeft = new Custom("./Objs/low_poly_raccoon_legLeft.obj", "./Objs/low_poly_raccoon_legLeft.mtl");
                this.legRight = new Custom("./Objs/low_poly_raccoon_legRight.obj", "./Objs/low_poly_raccoon_legRight.mtl");

                this.armLeft = new Custom("./Objs/low_poly_raccoon_armLeft.obj", "./Objs/low_poly_raccoon_armLeft.mtl");
                this.armRight = new Custom("./Objs/low_poly_raccoon_armRight.obj", "./Objs/low_poly_raccoon_armRight.mtl");

                this.tail1 = new Custom("./Objs/low_poly_raccoon_tail_1.obj", "./Objs/low_poly_raccoon_tail_1.mtl");
                this.tail2 = new Custom("./Objs/low_poly_raccoon_tail_2.obj", "./Objs/low_poly_raccoon_tail_2.mtl");
                break;
            case "Gat": //gator========================================================================================
                this.head = new Custom("./Gator/gator_head.obj", "./Gator/gator_head.mtl");

                this.body = new Custom("./Gator/gator_body.obj", "./Gator/gator_body.mtl");


                this.legLeft = new Custom("./Gator/gator_left_leg.obj", "./Gator/gator_left_leg.mtl");
                this.legRight = new Custom("./Gator/gator_right_leg.obj", "./Gator/gator_right_leg.mtl");

                this.armLeft = new Custom("./Gator/gator_left_arm.obj", "./Gator/gator_left_arm.mtl");
                this.armRight = new Custom("./Gator/gator_right_arm.obj", "./Gator/gator_right_arm.mtl");

                this.tail1 = new Custom("./Gator/gator_tail1.obj", "./Gator/gator_tail1.mtl");
                this.tail2 = new Custom("./Gator/gator_tail2.obj", "./Gator/gator_tail2.mtl");
                break;
            case "owl": //owl========================================================================================
                this.head = new Custom("./owl/owl_head.obj", "./owl/owl_head.mtl");

                this.body = new Custom("./owl/owl_body.obj", "./owl/owl_body.mtl");


                this.legLeft = new Custom("./owl/owl_left_leg.obj", "./owl/owl_left_leg.mtl");
                this.legRight = new Custom("./owl/owl_right_leg.obj", "./owl/owl_right_leg.mtl");

                this.armLeft = new Custom("./owl/owl_left_arm.obj", "./owl/owl_left_arm.mtl");
                this.armRight = new Custom("./owl/owl_right_arm.obj", "./owl/owl_right_arm.mtl");

                this.tail1 = new Custom("./owl/owl_tail1.obj", "./owl/owl_tail1.mtl");
                this.tail2 = new Custom("./owl/owl_tail2.obj", "./owl/owl_tail2.mtl");
                break;
            default://set defualt to raccoon===========================================================================
                this.head = new Custom("./Objs/low_poly_raccoon.obj", "./Objs/low_poly_raccoon.mtl");

                this.body = new Custom("./Objs/low_poly_raccoon_body.obj", "./Objs/low_poly_raccoon_body.mtl");


                this.legLeft = new Custom("./Objs/low_poly_raccoon_legLeft.obj", "./Objs/low_poly_raccoon_legLeft.mtl");
                this.legRight = new Custom("./Objs/low_poly_raccoon_legRight.obj", "./Objs/low_poly_raccoon_legRight.mtl");

                this.armLeft = new Custom("./Objs/low_poly_raccoon_armLeft.obj", "./Objs/low_poly_raccoon_armLeft.mtl");
                this.armRight = new Custom("./Objs/low_poly_raccoon_armRight.obj", "./Objs/low_poly_raccoon_armRight.mtl");

                this.tail1 = new Custom("./Objs/low_poly_raccoon_tail_1.obj", "./Objs/low_poly_raccoon_tail_1.mtl");
                this.tail2 = new Custom("./Objs/low_poly_raccoon_tail_2.obj", "./Objs/low_poly_raccoon_tail_2.mtl");

                break;
        }
    }

    wave() {
        //body
        let bodyCords;
        if (this.body.finished_making_objs) {
            this.body.matrix.setTranslate(0, -.5, 0.0)
            this.body.matrix.rotate(90, 0, 1.0, 0)
            this.body.matrix.rotate(10 * Math.sin(g_seconds * 4) - 15, 1, 0, 0);
            //body.matrix.translate(0,.02*Math.cos(g_seconds*8-.3),0.0)
            bodyCords = new Matrix4(this.body.matrix);
            //body.render();
            //console.log(body)
        }



        //head
        let headSpace;
        if (this.head.finished_making_objs) {
            this.head.matrix = new Matrix4(bodyCords)
            this.head.matrix.translate(0, +.4, 0.0)
            //head.matrix.translate(0,.2*Math.sin(g_seconds*3),0.0)
            //head.matrix.rotate(-10*Math.sin(g_seconds*5),0,1,0);
            this.head.matrix.rotate(10 * Math.sin(g_seconds * 4) - 20, 1, 0, 0);
            headSpace = new Matrix4(this.head.matrix)
            //head.render();
        }

        //console.log(g_magenta_ang)

        //legs
        if (this.legLeft.finished_making_objs) {
            this.legLeft.matrix = new Matrix4()
            this.legLeft.matrix.setRotate(90, 0, 1, 0)
            this.legLeft.matrix.translate(0, -.5, -.06)
            //legLeft.matrix.rotate(45*Math.sin(g_seconds*4),0,0,1);
            //legLeft.render();
        }

        if (this.legRight.finished_making_objs) {
            this.legRight.matrix = new Matrix4()
            this.legRight.matrix.setRotate(90, 0, 1, 0)
            this.legRight.matrix.translate(0, -.5, +.06)
            //legRight.matrix.rotate(-45*Math.sin(g_seconds*4),0,0,1);
            //legRight.render();
        }

        //arms
        if (this.armLeft.finished_making_objs) {
            this.armLeft.matrix = new Matrix4(bodyCords)
            this.armLeft.matrix.translate(0, +.31, +.15)
            this.armLeft.matrix.rotate(25 * Math.sin(g_seconds * 4) - 85, 1, 0, 0);
            //armLeft.render();
        }

        if (this.armRight.finished_making_objs) {
            this.armRight.matrix = new Matrix4(bodyCords)
            this.armRight.matrix.translate(0, +.31, -.15)
            this.armRight.matrix.rotate(-3 * Math.sin(g_seconds * 4), 1, 0, 0);
            //armRight.render();
        }

        //tails
        let tailspace;
        if (this.tail1.finished_making_objs) {
            this.tail1.matrix = new Matrix4(bodyCords)
            this.tail1.matrix.translate(-.15, +.05, 0)
            this.tail1.matrix.rotate(-45 * Math.sin(g_seconds * 7), 0, 1, 0);
            tailspace = new Matrix4(this.tail1.matrix)
            //tail1.render();
        }

        if (this.tail2.finished_making_objs) {
            this.tail2.matrix = new Matrix4(tailspace)
            this.tail2.matrix.translate(-.2, 0, 0)
            //tail2.matrix.rotate(45,0,1,0)
            this.tail2.matrix.rotate(-45 * Math.sin(g_seconds * 7), 0, 1, 0);
            //tail2.render();
        }
    }

    walk() {
        //body
        let bodyCords;
        if (this.body.finished_making_objs) {
            this.body.matrix = new Matrix4()
            this.body.matrix.translate(0, -.5, 0.0)
            this.body.matrix.rotate(90, 0, 1.0, 0)
            this.body.matrix.rotate(10 * Math.sin(g_seconds * 4), 0, 1, 0);
            this.body.matrix.translate(0, .02 * Math.cos(g_seconds * 8 - .3), 0.0)
            bodyCords = new Matrix4(this.body.matrix);
            //body.render();
            //console.log(body)
        }



        //head
        let headSpace;
        if (this.head.finished_making_objs) {
            this.head.matrix = new Matrix4(bodyCords)
            this.head.matrix.translate(0, +.4, 0.0)
            //head.matrix.translate(0,.2*Math.sin(g_seconds*3),0.0)
            //head.matrix.rotate(-10*Math.sin(g_seconds*5),0,1,0);
            this.head.matrix.rotate(-10 * Math.sin(g_seconds * 3), 1, 0, 0);
            headSpace = new Matrix4(this.head.matrix)
            //head.render();
        }

        //console.log(g_magenta_ang)

        //legs
        if (this.legLeft.finished_making_objs) {
            this.legLeft.matrix = new Matrix4(bodyCords)
            this.legLeft.matrix.translate(0, -.03, -.06)
            this.legLeft.matrix.rotate(45 * Math.sin(g_seconds * 4), 0, 0, 1);
            //legLeft.render();
        }

        if (this.legRight.finished_making_objs) {
            this.legRight.matrix = new Matrix4(bodyCords)
            this.legRight.matrix.translate(0, -.03, +.06)
            this.legRight.matrix.rotate(-45 * Math.sin(g_seconds * 4), 0, 0, 1);
            //legRight.render();
        }

        //arms
        if (this.armLeft.finished_making_objs) {
            this.armLeft.matrix = new Matrix4(bodyCords)
            this.armLeft.matrix.translate(0, +.31, +.15)
            this.armLeft.matrix.rotate(10 * Math.sin(g_seconds * 4), 0, 0, 1);
            //armLeft.render();
        }

        if (this.armRight.finished_making_objs) {
            this.armRight.matrix = new Matrix4(bodyCords)
            this.armRight.matrix.translate(0, +.31, -.15)
            this.armRight.matrix.rotate(-10 * Math.sin(g_seconds * 4), 0, 0, 1);
            //armRight.render();
        }

        //tails
        let tailspace;
        if (this.tail1.finished_making_objs) {
            this.tail1.matrix = new Matrix4(bodyCords)
            this.tail1.matrix.translate(-.15, +.05, 0)
            this.tail1.matrix.rotate(-30 * Math.sin(g_seconds * 5), 0, 1, 0);
            tailspace = new Matrix4(this.tail1.matrix)
            //tail1.render();
        }

        if (this.tail2.finished_making_objs) {
            this.tail2.matrix = new Matrix4(tailspace)
            this.tail2.matrix.translate(-.2, 0, 0)
            //tail2.matrix.rotate(45,0,1,0)
            this.tail2.matrix.rotate(-30 * Math.sin(g_seconds * 5), 0, 1, 0);
            //tail2.render();
        }

        //move function goes here
        this.move()

    }

    move() { 

        //update rotation
        this.rotation = this.rotation + (this.delta_rotation * delta_time * 2)

        //rotate the forward vector to match npc orientation
        let matrix = new Matrix4().setRotate(this.rotation, 0, 1, 0);
        let target_vect = matrix.multiplyVector3(this.forwardVect);

        //scale it to delta time * speed
        target_vect.mul(delta_time * 1);


        //get new map location
        let new_vect = new Vector3().set(this.position);
        new_vect.add(target_vect);

        let mapX = Math.floor(new_vect.elements[0]);
        let mapY = Math.floor(new_vect.elements[1]);
        let mapZ = Math.floor(new_vect.elements[2]);

        //check if in bounds

        if ( // check being within map
            mapX < 0 || mapX > 31 ||
            mapZ < 0 || mapZ > 31 ||
            mapY < 0 || mapY > 31
        ) {
            this.rotation = this.rotation + 180; //bump / turn around
            return;
        }


        //check if there is a block head level
        if (g_map.cubes[mapX][mapZ][mapY+1] !== null) {
            this.rotation = this.rotation + 180;//bump and turn around
            return;
        }

        //check if there is a block they are walking on
        if (g_map.cubes[mapX][mapZ][mapY] !== null) {
            //make sure they arnt gonna bump something on the way up
            if (g_map.cubes[mapX][mapZ][mapY+2] !== null) {
                this.rotation = this.rotation + 180;//bump and turn around
                return;
            }else{//otherwise step up one
                this.position.set(new_vect);
                this.position.elements[1] = this.position.elements[1] + 1;//move up one
            }
        }else if (g_map.cubes[mapX][mapZ][mapY-1] === null) {//is there a block underthem?
            this.position.set(new_vect);
            this.position.elements[1] = this.position.elements[1] - 1;//move down one
        }else{//just go forward
            this.position.set(new_vect);
        }

    }

    idle() {// todo implement
        //body
        let bodyCords;
        if (this.body.finished_making_objs) {
            this.body.matrix.setTranslate(0, -.5, 0.0)
            this.body.matrix.rotate(90, 0, 1.0, 0)
            this.body.matrix.rotate(10 * Math.sin(g_seconds * 3), 0, 1, 0);
            //body.matrix.translate(0,.01*Math.cos(g_seconds*8-.3),0.0)
            bodyCords = new Matrix4(this.body.matrix);
            //body.render();
            //console.log(body)
        }



        //head
        let headSpace;
        if (this.head.finished_making_objs) {
            this.head.matrix = new Matrix4(bodyCords)
            this.head.matrix.translate(0, +.4, 0.0)
            //head.matrix.translate(0,.2*Math.sin(g_seconds*3),0.0)
            //head.matrix.rotate(-10*Math.sin(g_seconds*5),0,1,0);
            this.head.matrix.rotate(7 * Math.sin(g_seconds * 3) , 0, 1, 0);
            headSpace = new Matrix4(this.head.matrix)
            //head.render();
        }

        //console.log(g_magenta_ang)

        //legs
        if (this.legLeft.finished_making_objs) {
            this.legLeft.matrix = new Matrix4()
            this.legLeft.matrix.setRotate(90, 0, 1, 0)
            this.legLeft.matrix.translate(0, -.5, -.06)
            //legLeft.matrix.rotate(45*Math.sin(g_seconds*4),0,0,1);
            //legLeft.render();
        }

        if (this.legRight.finished_making_objs) {
            this.legRight.matrix = new Matrix4()
            this.legRight.matrix.setRotate(90, 0, 1, 0)
            this.legRight.matrix.translate(0, -.5, +.06)
            //legRight.matrix.rotate(-45*Math.sin(g_seconds*4),0,0,1);
            //legRight.render();
        }

        //arms
        if (this.armLeft.finished_making_objs) {
            this.armLeft.matrix = new Matrix4(bodyCords)
            this.armLeft.matrix.translate(0, +.31, +.15)
            this.armLeft.matrix.rotate(3 * Math.sin(g_seconds * 6), 1, 0, 0);
            this.armLeft.matrix.rotate(3 * Math.cos(g_seconds * 6), 0, 1, 0);
            //armLeft.render();
        }

        if (this.armRight.finished_making_objs) {
            this.armRight.matrix = new Matrix4(bodyCords)
            this.armRight.matrix.translate(0, +.31, -.15)
            this.armRight.matrix.rotate(-3 * Math.sin(g_seconds * 6), 1, 0, 0);
            this.armRight.matrix.rotate(-3 * Math.cos(g_seconds * 6), 0, 1, 0);
            //armRight.render();
        }

        //tails
        let tailspace;
        if (this.tail1.finished_making_objs) {
            this.tail1.matrix = new Matrix4(bodyCords)
            this.tail1.matrix.translate(-.15, +.05, 0)
            this.tail1.matrix.rotate(-45 * Math.sin(g_seconds * 8), 0, 1, 0);
            tailspace = new Matrix4(this.tail1.matrix)
            //tail1.render();
        }

        if (this.tail2.finished_making_objs) {
            this.tail2.matrix = new Matrix4(tailspace)
            this.tail2.matrix.translate(-.2, 0, 0)
            //tail2.matrix.rotate(45,0,1,0)
            this.tail2.matrix.rotate(-45 * Math.sin(g_seconds * 8), 0, 1, 0);
            //tail2.render();
        }
    }

    render() {
        //check if everything has been loaded properly
        if (
            !this.body.finished_making_objs &&
            !this.head.finished_making_objs &&
            !this.armLeft.finished_making_objs &&
            !this.armRight.finished_making_objs &&
            !this.legLeft.finished_making_objs &&
            !this.legRight.finished_making_objs &&
            !this.tail1.finished_making_objs &&
            !this.tail2.finished_making_objs
        ) {
            console.log("exit")
            return;// return if anything hasnt loaded yet
        }

        //console.log("hii?")
        //com
        //console.log(!this.lookingAtNpc)
        if (!this.lookingAtNpc) {
            switch (this.animation) { //apply correct animation for current state
                //todo add more animations
                case 0:
                    this.idle();
                    break;
                case 1:
                    this.wave();
                    break;
                case 2:
                    this.walk();
                    break;
                default:
                    this.wave();
                    break;
            }
        }else{
            this.wave();
        }
        

        //swich around the state
        //console.log("seconds "+g_seconds)
        //console.log("timer "+this.timer)
        if (g_seconds > this.timer) {
            //console.log(this.animation)
            if (this.animation == 0) {//if walking set to idle
                this.animation = 2;
                //console.log("set to walking")
            }else if (this.animation == 2) {//else if idle then switch to walking
                this.animation = 0;
            }
            //console.log("switching states")
            this.delta_rotation = (Math.random() * 30) - 15;
            this.timer = g_seconds + (Math.random() * 15) + 3;
        }

        this.npcMatrix.setIdentity();

        //global transform
        this.npcMatrix.translate(this.position.elements[0], this.position.elements[1] + 1.5, this.position.elements[2]);
        this.npcMatrix.rotate(this.rotation, 0, 1, 0);
        this.npcMatrix.scale(2, 2, 2);


        //apply all transforms 
        this.body.matrix.multiply2(this.npcMatrix);
        this.head.matrix.multiply2(this.npcMatrix);
        //this.body.matrix.multiply2(this.npcMatrix);
        this.armLeft.matrix.multiply2(this.npcMatrix);
        this.armRight.matrix.multiply2(this.npcMatrix);
        this.legLeft.matrix.multiply2(this.npcMatrix);
        this.legRight.matrix.multiply2(this.npcMatrix);
        this.tail1.matrix.multiply2(this.npcMatrix);
        this.tail2.matrix.multiply2(this.npcMatrix);



        //this.body.matrix = this.npcMatrix.multiply(this.body.matrix);
        //this.head.matrix = multiply(this.npcMatrix);
        //this.body.matrix = multiply(this.npcMatrix);
        //this.armLeft.matrix = multiply(this.npcMatrix);
        //this.armRight.matrix = multiply(this.npcMatrix);
        //this.legLeft.matrix = multiply(this.npcMatrix);
        //this.legRight.matrix = multiply(this.npcMatrix);
        //this.tail1.matrix = multiply(this.npcMatrix);
        //this.tail2.matrix = multiply(this.npcMatrix);


        this.body.render();
        this.head.render();
        this.body.render();
        this.armLeft.render();
        this.armRight.render();
        this.legLeft.render();
        this.legRight.render();
        this.tail1.render();
        this.tail2.render();

        //render everything

    }


    //todo collision checks?
}