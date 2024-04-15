// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('cnv1');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color
}


function drawVector(v, color){
  ctx.strokeStyle = color;
  let x = canvas.width/2 + v.elements[0]*20
  let y = canvas.height/2 + -v.elements[1]*20
  ctx.beginPath()
  ctx.moveTo(canvas.width/2, canvas.height/2)
  ctx.lineTo(x, y)
  //console.log("drawing vector (", v.elements[0], ", ", v.elements[1])
  ctx.stroke()
}

function clearCanvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function areaTriangle(v1, v2){
  let area = Vector3.cross(v1, v2)
  console.log(v1.elements)
  console.log(v2.elements)
  console.log(area.elements)
  area = area.magnitude()
  area = area/2
  area = Math.abs(area)
  console.log(area)
}

function angleBetween(v1, v2){
  let dot = Vector3.dot(v1, v2)
  let mag1 = v1.magnitude()
  let mag2 = v2.magnitude()
  let angle = dot / (mag1 * mag2)
  angle = Math.acos(angle)
  angle =angle * (180 / Math.PI)
  console.log(angle)
}

function handleDrawEvent(){
  clearCanvas()

  let x1 = document.getElementById("V1x").value;
  let y1 = document.getElementById("V1y").value;
  let v1 = new Vector3([x1, y1, 0])

  drawVector(v1, "red")

  let x2 = document.getElementById("V2x").value;
  let y2 = document.getElementById("V2y").value;
  let v2 = new Vector3([x2, y2, 0])

  drawVector(v2, "blue")

  let op = document.getElementById("operation-select").value;
  let scalar = document.getElementById("Scalar").value;
  let v3;
  let v4;
  let val;
  switch(op){
    case "add":
      v3 = v1.add(v2)
      drawVector(v3, "green")
      break;

    case "sub":
      v3 = v1.sub(v2)
      drawVector(v3, "green")
      break;

    case "div":
      v3 = v1.div(scalar)
      v4 = v2.div(scalar)
      drawVector(v3, "green")
      drawVector(v4, "green")
      break;

    case "mul":
      v3 = v1.mul(scalar)
      v4 = v2.mul(scalar)
      drawVector(v3, "green")
      drawVector(v4, "green")
      break;
    case "mag":
      val = v1.magnitude()
      console.log("Magnitude v1:",val)
      val = v2.magnitude()
      console.log("Magnitude v2:",val)
      break;
    case "nor":
      v3 = v1.normalize()
      v4 = v2.normalize()
      drawVector(v3, "green")
      drawVector(v4, "green")
      break;
    case "ang":
      angleBetween(v1, v2)
      break;
    case "are":
      areaTriangle(v1, v2)
      break;
  }


}
