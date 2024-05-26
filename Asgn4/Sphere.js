class Sphere{
    constructor(){
      //console.log("gamer")
      this.type = "cube";
      //this.position = [0.0,0.0,0.0];
      this.color = [0.8,0.2,0.8,1.0];
      //this.size = 5.0;
      //this.segments = 10;
      this.matrix = new Matrix4();
      this.normalMatrix = new Matrix4();
      this.textureNum = 0;

      //1x1 cube origin in corner
      this.verts = [];
      this.UVs = [];
      this.Normals = [];


      this.vertBuffer = null;
      this.uvBuffer = null;

      this.normBuffer = null;

      this.genArrays();

      //print()

    }

    genArrays(){
      var d = Math.PI/25;
      var dd = Math.PI/25;
      for (let t = 0; t < Math.PI; t+=d) {
        for (let r = 0; r < (2*Math.PI); r +=d) {
          //calc points
          var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];

          var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
          var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
          var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];


          //calc uvs
          var uv1 = [t/Math.PI, r/(Math.PI)];
          var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
          var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
          var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];


          //add first triangle
          this.verts = this.verts.concat(p1); this.Normals = this.Normals.concat(p1); this.UVs = this.UVs.concat(uv1);
          this.verts = this.verts.concat(p2); this.Normals = this.Normals.concat(p2); this.UVs = this.UVs.concat(uv2);
          this.verts = this.verts.concat(p4); this.Normals = this.Normals.concat(p4); this.UVs = this.UVs.concat(uv4);

          //add second triangle
          this.verts = this.verts.concat(p1); this.Normals = this.Normals.concat(p1); this.UVs = this.UVs.concat(uv1);
          this.verts = this.verts.concat(p4); this.Normals = this.Normals.concat(p4); this.UVs = this.UVs.concat(uv4);
          this.verts = this.verts.concat(p3); this.Normals = this.Normals.concat(p3); this.UVs = this.UVs.concat(uv3);
          
        }
        
      }
    }
  
    render(){
      //console.log(this.textureNum)
      //var xy = this.position
      var rgba = this.color
      //var size = this.size

      //pass texture number
      if (g_norms) {
        gl.uniform1i(u_whichTexture, -3)
      }else{
        gl.uniform1i(u_whichTexture, -2)
      }
      

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // pass the model matrix
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements)

      this.normalMatrix.setInverseOf(this.matrix).transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements)

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

      if (this.normBuffer === null) {
        this.normBuffer = gl.createBuffer();
        if (!this.normBuffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }

      //position data

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);

      let vert_to_buffer = new Float32Array(this.verts);

      gl.bufferData(gl.ARRAY_BUFFER, vert_to_buffer, gl.DYNAMIC_DRAW);

      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(a_Position);


      //uv data
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);

      let uv_to_buffer = new Float32Array(this.UVs);

      gl.bufferData(gl.ARRAY_BUFFER, uv_to_buffer, gl.DYNAMIC_DRAW);

      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(a_UV);



      gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);

      let norm_to_buffer = new Float32Array(this.Normals);

      gl.bufferData(gl.ARRAY_BUFFER, norm_to_buffer, gl.DYNAMIC_DRAW);

      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(a_Normal);



      //draw triangles

      gl.drawArrays(gl.TRIANGLES, 0, this.verts.length/3);

      gl.disableVertexAttribArray(a_Normal);

    }
  }