class FloorObj{
    constructor(){
        this.type = "FloorObj"
        this.xPos = Math.random() - 0.5; //set ot random position  // this will go from + to -
        this.zPos = Math.random() - 0.5; // should be from -.5 to .5 excluding .5 //will be re generated
        this.rotation = Math.random() *360; // should be from 0 to 360 excluding 360
        this.size = Math.random() * (.2 + .9) + .2; //should generate a verity of sizes
        this.obj;
        
        let rand_mesh_num = Math.random() * 11;

        if (rand_mesh_num < 8) { //determine the mesh to be used
            this.obj = new Custom("./floor/grass.obj", "./floor/grass.mtl");
        }else if(rand_mesh_num < 9){
            this.obj = new Custom("./floor/mushroom.obj", "./floor/mushroom.mtl");
        }else if(rand_mesh_num < 10){
            this.obj = new Custom("./floor/rock.obj", "./floor/rock.mtl");
        }else{
            this.obj = new Custom("./floor/dandi.obj", "./floor/dandi.mtl");
        }

    
    }

    render(time){

        if (this.obj.finished_making_objs) {
            this.obj.matrix = new Matrix4();

            this.obj.matrix.setTranslate(this.xPos,-.74,-this.zPos);    

            this.obj.matrix.rotate(this.rotation,0,1.0,0);

            this.obj.matrix.scale(this.size,this.size, this.size)

            
            this.zPos = this.zPos - .62*(time);
            //console.log(this.zPos)

            //console.log()

            if (this.zPos < -.5) {//check if off the platform
                this.zPos = .5 + ( this.zPos - .5) % 1; //wrapping numbers i found on stack overflow
                this.xPos = Math.random() - 0.5;
                this.rotation = Math.random() *360;
                this.size = Math.random() * (.2 + .9) + .2;
                //console.log("yeah")
                
            }
            
            //console.log(this.steps)

            
            
            this.obj.render();
        }

    }
}