class Circle{
    constructor(){
      //console.log("gamer")
      this.type = "circle";
      this.position = [0.0,0.0,0.0];
      this.color = [1.0,0.0,0.0,1.0];
      this.size = 5.0;
      this.segments = 10;
    }
  
    render(){
      var xy = this.position
      var rgba = this.color
      var size = this.size

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
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
  

    }
  }