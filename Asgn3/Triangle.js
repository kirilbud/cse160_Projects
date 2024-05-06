class Triangle{
        constructor(){
        //console.log("gamer")
        this.type = "Tri";
        this.position = [0.0,0.0,0.0];
        this.color = [1.0,0.0,0.0,1.0];
        this.size = 5.0;
        }
    
        render(){
        var xy = this.position
        var rgba = this.color
        var size = this.size
    
        //console.log(rgba)
        
        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
        //pass the size of the point
        gl.uniform1f(u_Size, size)
    
        // Draw
        //gl.drawArrays(gl.POINTS, 0, 1);
        var d = this.size /200
        drawTriangle([xy[0], xy[1]+ d/2 , xy[0]+ (d/2), xy[1]- (d/2),  xy[0] - d/2, xy[1] - d/2 ])

    }
  }

function drawTriangle(verts){
    //  console.log(verts)
    var n = 3;// num of verts

    //make buffer
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object for draw tri');
        return -1;
    }


    //bind buffer obkect to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // write data into buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);


    //Assighn the Buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);


    // enable the assighnment to a_position
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(verts){
    //  console.log(verts)
    var n = 3;// num of verts

    //make buffer
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object for draw tri');
        return -1;
    }


    //bind buffer obkect to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // write data into buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);


    //Assighn the Buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);


    // enable the assighnment to a_position
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}