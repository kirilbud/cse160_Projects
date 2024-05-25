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

      //all in one buffer of verts for 1x1 cube with origin at center
      /*
      this.verts = new Float32Array([
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
        0.5,-0.5,0.5,   -0.5,-0.5,-0.5,  0.5,-0.5,-0.5
      ]);
      */

      //1x1 cube origin in corner
      this.verts = new Float32Array([
        0,0,1,   1,0,1,  1,1,1, //back
        0,0,1,   1,1,1,  0,1,1,

        1,0,1,   1,0,0,  1,1,0, //right
        1,0,1,   1,1,0,  1,1,1,

        1,0,0,   0,0,0,  0,1,0, //front
        1,0,0,   0,1,0,  1,1,0,

        0,0,0,   0,0,1,  0,1,1, //left
        0,0,0,   0,1,1,  0,1,0,

        0,1,1,   1,1,1,  1,1,0, //top
        0,1,1,   1,1,0,  0,1,0,

        1,0,1,   0,0,1,  0,0,0, //bottom
        1,0,1,   0,0,0,  1,0,0
      ]);

      //reff
      /*
      this.UVs = new Float32Array([
        0,0,   1,0,   1,1, //back
        0,0,   1,1,   0,1,

        0,0,   1,0,   1,1, //right
        0,0,   1,1,   0,1,

        0,0,   1,0,   1,1, //front
        0,0,   1,1,   0,1,

        0,0,   1,0,   1,1, //left
        0,0,   1,1,   0,1,

        0,0,   1,0,   1,1, //top
        0,0,   1,1,   0,1,

        0,0,   1,0,   1,1, //bottom
        0,0,   1,1,   0,1,
      ]); */

      this.UVs = new Float32Array([
        0.75,0.25,   1.0,0.25,   1.0,0.50, //back
        0.75,0.25,   1.0,0.50,   0.75,0.50,

        0.50,0.25,   0.75,0.25,   0.75,0.50, //right
        0.50,0.25,   0.75,0.50,   0.50,0.50,

        0.25,0.25,   0.50,0.25,   0.50,0.50, //front
        0.25,0.25,   0.50,0.50,   .25,0.50,

        0.0,0.25,   0.25,0.25,   0.25,0.50, //left
        0.0,0.25,   0.25,0.50,   0.0,0.50,

        0.25,0.5,   0.50,0.50,   0.5,0.75, //top
        0.25,0.5,   0.5,0.75,   0.25,0.75,

        0.25,0.0,   0.5,0,   0.5,0.25, //bottom
        0.25,0.0,   0.5,.25,   0.25,0.25,
      ]);

      this.Normals = new Float32Array([
        0,0,1,   0,0,1,  0,0,1, //back
        0,0,1,   0,0,1,  0,0,1,

        -1,0,0,   -1,0,0,  -1,0,0, //right
        -1,0,0,   -1,0,0,  -1,0,0,

        0,0,-1,   0,0,-1,  0,0,-1, //front
        0,0,-1,   0,0,-1,  0,0,-1,

        1,0,0,   1,0,0,  1,0,0, //left
        1,0,0,   1,0,0,  1,0,0,

        0,1,0,   0,1,0,  0,1,0, //top
        0,1,0,   0,1,0,  0,1,0,

        0,-1,0,   0,-1,0,  0,-1,0, //bottom
        0,-1,0,   0,-1,0,  0,-1,0
      ]);


      this.vertBuffer = null;
      this.uvBuffer = null;

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

      //new render code

      if (this.vertBuffer === null) {
        this.vertBuffer = gl.createBuffer();
        if (!this.vertBuffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }

      if (this.uvBuffer === null) {
        this.uvBuffer = gl.createBuffer();
        if (!this.uvBuffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }

      //position data

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);

      gl.bufferData(gl.ARRAY_BUFFER, this.verts, gl.DYNAMIC_DRAW);

      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(a_Position);


      //uv data
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);

      gl.bufferData(gl.ARRAY_BUFFER, this.UVs, gl.DYNAMIC_DRAW);

      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(a_UV);



      //draw triangles

      gl.drawArrays(gl.TRIANGLES, 0, this.verts.length/3);

            
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

        //1x1 cube with origin in center using draw tri

        /*

        //back
        //gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3])
        drawTriangle3DUV([-0.5,-0.5,0.5,   0.5,-0.5,0.5,  0.5,0.5,0.5,], [1,0, 0,0, 0,1] );
        drawTriangle3DUV([-0.5,-0.5,0.5,   0.5,0.5,0.5,  -0.5,0.5,0.5,], [1,0, 0,1, 1,1]);

        //right
        //gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3])
        drawTriangle3DUV([0.5,-0.5,0.5,   0.5,-0.5,-0.5,  0.5,0.5,-0.5,], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0.5,-0.5,0.5,   0.5,0.5,-0.5,  0.5,0.5,0.5,], [1,0, 0,1, 1,1]);

        //front
        //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3])
        drawTriangle3DUV([0.5,-0.5,-0.5,   -0.5,-0.5,-0.5,  -0.5,0.5,-0.5,], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0.5,-0.5,-0.5,   -0.5,0.5,-0.5,  0.5,0.5,-0.5,], [1,0, 0,1, 1,1] );

        //left 
        //gl.uniform1i(u_whichTexture, -1)
        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3])
        drawTriangle3DUV([-0.5,-0.5,-0.5,   -0.5,-0.5,0.5,  -0.5,0.5,0.5,], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([-0.5,-0.5,-0.5,   -0.5,0.5,0.5,  -0.5,0.5,-0.5,], [1,0, 0,1, 1,1]);

        //top
        //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3])
        drawTriangle3DUV([-0.5,0.5,0.5,   0.5,0.5,0.5,  0.5,0.5,-0.5], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([-0.5,0.5,0.5,   0.5,0.5,-0.5,  -0.5,0.5,-0.5], [1,0, 0,1, 1,1]);

        //bottom
        //gl.uniform4f(u_FragColor, rgba[0]*.3, rgba[1]*.3, rgba[2]*.3, rgba[3])
        drawTriangle3DUV([0.5,-0.5,0.5,   -0.5,-0.5,0.5,  -0.5,-0.5,-0.5], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0.5,-0.5,0.5,   -0.5,-0.5,-0.5,  0.5,-0.5,-0.5], [1,0, 0,1, 1,1]);
        */
        
        
        
        
        

        //<-dont forget to to the rest
        /* to do
        - top
        - bottom
        - left
        - right
        - back
        */

    }
  }