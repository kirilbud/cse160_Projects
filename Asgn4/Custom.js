class Mesh{
  constructor(){
    this.type = "Mesh"
    this.matName = ""
    this.color = [1.0,0.0,0.0,1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();


    this.verts = [];
    this.norms = null;
    this.buffer = null;
    this.normBuffer = null;
  }

  generateNorms(){
    this.norms = [];

    for (let i = 0; i < this.verts.length; i = i + 9) {
      let vec1 = new Vector3([
        this.verts[i+3] - this.verts[i],
        this.verts[i+4] - this.verts[i+1],
        this.verts[i+5] - this.verts[i+2],
      ]);
      let vec2 = new Vector3([
        this.verts[i+6] - this.verts[i],
        this.verts[i+7] - this.verts[i+1],
        this.verts[i+8] - this.verts[i+2],
      ]);  
      
      let cross = Vector3.cross(vec1, vec2);
      cross.normalize();
      this.norms.push(cross.elements[0]);
      this.norms.push(cross.elements[1]);
      this.norms.push(cross.elements[2]);

      this.norms.push(cross.elements[0]);
      this.norms.push(cross.elements[1]);
      this.norms.push(cross.elements[2]);

      this.norms.push(cross.elements[0]);
      this.norms.push(cross.elements[1]);
      this.norms.push(cross.elements[2]);
    }

  }

  render(){
    //how was the fall??????

    //console.log("Norms ="+this.norms.length +"verts ="+this.verts.length);
    

    var rgba = this.color;
    //console.log(this.verts)

    //make this just a base material for now
    if (g_norms) {
      gl.uniform1i(u_whichTexture, -3)
    }else{
      gl.uniform1i(u_whichTexture, -2)
    }

    

    gl.disableVertexAttribArray(a_UV);

    gl.uniform4f(u_FragColor, rgba[0]*4, rgba[1]*4, rgba[2]*4, rgba[3]);

    if (this.buffer === null) {
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    if (this.normBuffer === null) {
      this.normBuffer = gl.createBuffer();
      if (!this.normBuffer) {
        console.log("Failed to create the normBuffer object");
        return -1;
      }
    }

    //the following method is from lab2 but to work with the full mesh
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements)

    this.normalMatrix.setInverseOf(this.matrix).transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    let vert_to_buffer = new Float32Array(this.verts)

    gl.bufferData(gl.ARRAY_BUFFER, vert_to_buffer, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_Position);

    



    //gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);

    let norm_to_buffer = new Float32Array(this.norms)

    gl.bufferData(gl.ARRAY_BUFFER, norm_to_buffer, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_Normal);



    gl.drawArrays(gl.TRIANGLES, 0, vert_to_buffer.length/3);
    //gl.drawArrays(gl.TRIANGLES, 0, 6);
    //console.log(vert_to_buffer.length/3)

  }

}



class Custom{
    constructor(OBJ_file_path, MTL_file_path){
      this.type = "Custom";
      //this.color = [1.0,0.0,0.0,1.0];
      this.matrix = new Matrix4();
      

      this.finished_parsing_obj = false;
      this.finished_parsing_mtl = false;
      this.finished_making_objs = false;

      this.verts = [];
      this.mats = {};
      this.faces = {};

      this.meshs = [];

      this.vertexBuffer;
      this.elemntBuffer;

      //this.objFile = getFile(OBJ_file_path);
      //this.mFile = getFile(MTL_file_path);

      //[each_material [each_vert[x,y,z]]]
      //let mesh = []

      //[mat[r,g,b]]
      //let mats = []
        
      //push this to mesh after hitting a new material
      // [vert[x,y,z]]
      //let verts = []

      //make file reader object
      //var file_reader = new FileReader();

      //read files

      fetch(OBJ_file_path)//grab file
      .then(file => file.text())//convert to text
      .then(content => { this.generate_mesh(content.split('\n')) })//split it by lines and generate mesh
      .catch(error => {console.log("Could not retrieve obj due to: " + error)})//something really failed

      //same thing for this bit but with the mtl file and generat
      fetch(MTL_file_path)
      .then(file => file.text())
      .then(content => { this.generate_mats(content.split('\n')) })
      .catch(error => {console.log("Could not retrieve obj due to: " + error)})

      //console.log("is this waiting for the above to finish??") // it was not



    }

    generate_mesh(lines) { //parse the obj file into usable data
      //console.log(lines);
      let current_mat = null;

      for (let i = 0; i < lines.length; i++) {
        let element = lines[i];
        element = element.split(' ');
        //console.log(element)
        
        switch (element[0]) {
          case "v":
            this.verts.push(parseFloat(element[1]));
            this.verts.push(parseFloat(element[2]));
            this.verts.push(parseFloat(element[3]));
            break;
          case "usemtl":
            current_mat = element[1];
            this.faces[current_mat] = [];
            break;
          case "f": //push faces to 
            this.faces[current_mat].push(parseFloat(element[1])-1);
            this.faces[current_mat].push(parseFloat(element[2])-1);
            this.faces[current_mat].push(parseFloat(element[3])-1);
            break;

          default://if something else just ignore it we dont need it
            break;
        }
      }
      if (this.finished_parsing_mtl) {
        this.makeObjs();
      }
      this.finished_parsing_obj = true;
      //console.log(this.verts)
      //console.log(this.faces) 
    }

    generate_mats(lines) {// parse the mtl file into usable data
      //console.log(lines);
      let current_mat = null;

      for (let i = 0; i < lines.length; i++) {
        let element = lines[i];
        element = element.split(' ');
        //console.log(element)
        
        switch (element[0]) {
          case "newmtl":// check for new material line
            current_mat = element[1];
            break;
          case "Kd": //get color values and pass into dictionary
            this.mats[current_mat] = [parseFloat(element[1]),parseFloat(element[2]),parseFloat(element[3])] //get rgb values
            break;
          default:
            break;
        }
      }
      if (this.finished_parsing_obj) {
        this.makeObjs();
      }
      this.finished_parsing_mtl = true;
      //console.log(this.mats)
    }

    makeObjs(){
      for(const [mat, indexs] of Object.entries(this.faces)){

        //console.log("indexes : "+indexs)

        let mesh = new Mesh();
        mesh.matName = mat;
        mesh.color = [this.mats[mat][0], this.mats[mat][1], this.mats[mat][2], 1]

        for (let i = 0; i < indexs.length; i++) {
          const element = indexs[i];
          //console.log();
          mesh.verts.push(this.verts[element*3])
          mesh.verts.push(this.verts[element*3+1])
          mesh.verts.push(this.verts[element*3+2])
        }
        mesh.generateNorms();

        this.meshs.push(mesh)

      }
      this.finished_making_objs = true;
      //console.log(this)
    }
  
    render(){

      //make sure the objs has fully loaded
      if (!this.finished_parsing_mtl || !this.finished_parsing_obj) {
        console.log("called render function before finishing loading obj: " + this.finished_parsing_obj + " or possible the mtl: " + this.finished_parsing_mtl)
        return;
      }

      var xy = this.position
      var rgba = this.color

      //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // pass the model matrix
      //gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements)


      
      for (let i = 0; i < this.meshs.length; i++) {
        var element = this.meshs[i];
        //console.log(element);
        element.matrix = new Matrix4(this.matrix)
        element.render();
      }
      
      
  

    }
}