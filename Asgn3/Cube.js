class Cube{
    constructor(){
      //console.log("gamer")
      this.type = "cube";
      //this.position = [0.0,0.0,0.0];
      this.color = [1.0,0.0,0.0,1.0];
      //this.size = 5.0;
      //this.segments = 10;
      this.matrix = new Matrix4();
      this.textureNum = 0;
    }
  
    render(){
      //console.log(this.textureNum)
        //var xy = this.position
        var rgba = this.color
        //var size = this.size

        //pass texture number
        gl.uniform1i(u_whichTexture, this.textureNum)

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // pass the model matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements)
            

        /*
    
        //pass the size of the point
        gl.uniform1f(u_Size, size)
        let angStep = 360/ this.segments
        let d = this.size/400
        for (let angle = 0; angle < 360; angle = angle + angStep) {

            let cent= [xy[0], xy[1]]
            let angle1 = angle;
            let angle2 = angStep + angle;
            let vect1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d]
            let vect2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d]
            let pt1 = [cent[0]+vect1[0],cent[1]+vect1[1]]
            let pt2 = [cent[0]+vect2[0],cent[1]+vect2[1]]

            drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]])

        }
        */
        // front of cube
        //drawTriangle3D([0.0,0.0,0.0,   1.0,1.0,0.0, 1.0,0.0,0.0]);
        //drawTriangle3D([0.0,0.0,0.0,   0.0,1.0,0.0, 1.0,1.0,0.0]);


        //back of cube
        //drawTriangle3D([0.0,0.0,1.0,   1.0,1.0,1.0, 1.0,0.0,1.0]);
        //drawTriangle3D([0.0,0.0,1.0,   0.0,1.0,1.0, 1.0,1.0,1.0]);



        //bottom of cube
        //drawTriangle3D([0.0,0.0,0.0,   0.0,0.0,1.0, 1.0,0.0,1.0]);
        //drawTriangle3D([0.0,0.0,0.0,   1.0,0.0,0.0, 1.0,0.0,1.0]);

        //drawTriangle3D([0.0,0.0,0.0,   0.0,1.0,0.0, 0.0,1.0,1.0]);

        //1x1 cube with origin in center

        //back
          gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3])
          drawTriangle3DUV([-0.5,-0.5,0.5,   0.5,-0.5,0.5,  0.5,0.5,0.5,], [1,0, 0,0, 0,1] );
          drawTriangle3DUV([-0.5,-0.5,0.5,   0.5,0.5,0.5,  -0.5,0.5,0.5,], [1,0, 0,1, 1,1]);

          //right
          gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3])
          drawTriangle3DUV([0.5,-0.5,0.5,   0.5,-0.5,-0.5,  0.5,0.5,-0.5,], [1,0, 0,0, 0,1]);
          drawTriangle3DUV([0.5,-0.5,0.5,   0.5,0.5,-0.5,  0.5,0.5,0.5,], [1,0, 0,1, 1,1]);

          //front
          gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3])
          drawTriangle3DUV([0.5,-0.5,-0.5,   -0.5,-0.5,-0.5,  -0.5,0.5,-0.5,], [1,0, 0,0, 0,1]);
          drawTriangle3DUV([0.5,-0.5,-0.5,   -0.5,0.5,-0.5,  0.5,0.5,-0.5,], [1,0, 0,1, 1,1] );

          //left 
          //gl.uniform1i(u_whichTexture, -1)
          gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3])
          drawTriangle3DUV([-0.5,-0.5,-0.5,   -0.5,-0.5,0.5,  -0.5,0.5,0.5,], [1,0, 0,0, 0,1]);
          drawTriangle3DUV([-0.5,-0.5,-0.5,   -0.5,0.5,0.5,  -0.5,0.5,-0.5,], [1,0, 0,1, 1,1]);

          //top
          gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3])
          drawTriangle3DUV([-0.5,0.5,0.5,   0.5,0.5,0.5,  0.5,0.5,-0.5], [1,0, 0,0, 0,1]);
          drawTriangle3DUV([-0.5,0.5,0.5,   0.5,0.5,-0.5,  -0.5,0.5,-0.5], [1,0, 0,1, 1,1]);

          //bottom
          gl.uniform4f(u_FragColor, rgba[0]*.3, rgba[1]*.3, rgba[2]*.3, rgba[3])
          drawTriangle3DUV([0.5,-0.5,0.5,   -0.5,-0.5,0.5,  -0.5,-0.5,-0.5], [1,0, 0,0, 0,1]);
          drawTriangle3DUV([0.5,-0.5,0.5,   -0.5,-0.5,-0.5,  0.5,-0.5,-0.5], [1,0, 0,1, 1,1]);

        //all in one buffer of verts for 1x1 cube with origin at center
        /*
        let verts = new Float32Array([
          -0.5,-0.5,0.5,   0.5,-0.5,0.5,  0.5,0.5,0.5, //back
          -0.5,-0.5,0.5,   0.5,0.5,0.5,  -0.5,0.5,0.5,

          0.5,-0.5,0.5,   0.5,-0.5,-0.5,  0.5,0.5,-0.5, //right
          0.5,-0.5,0.5,   0.5,0.5,-0.5,  0.5,0.5,0.5,

          0.5,-0.5,-0.5,   -0.5,-0.5,-0.5,  -0.5,0.5,-0.5, //front
          0.5,-0.5,-0.5,   -0.5,0.5,-0.5,  0.5,0.5,-0.5,

          -0.5,-0.5,-0.5,   -0.5,-0.5,0.5,  -0.5,0.5,0.5, //left
          -0.5,-0.5,-0.5,   -0.5,0.5,0.5,  -0.5,0.5,-0.5,

          -0.5,0.5,0.5,   0.5,0.5,0.5,  0.5,0.5,-0.5, //top
          -0.5,0.5,0.5,   0.5,0.5,-0.5,  -0.5,0.5,-0.5,

          0.5,-0.5,0.5,   -0.5,-0.5,0.5,  -0.5,-0.5,-0.5, //bottom
          0.5,-0.5,0.5,   -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,
        ]);
        */


        //<-dont forget to to the rest
        /* to do
        - top
        - bottom
        - left
        - right
        //- back
        */

    }
  }