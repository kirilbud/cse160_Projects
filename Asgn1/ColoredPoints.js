// ColoredPoint.js (c) 2012 matsuda
//now modified by Kiril Saltz
// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' + 
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';


//GLOBAL VARIALBLES -----------------------
//const for selection
const POINT = 0;
const TRI = 1;
const CIRCLE = 2;

let drawing = false;

let canvas;
let gl;
let a_Position;
let u_Size;
let u_FragColor;
var g_selected_color = [1,0,0,1];
var g_selected_back_color = [0,0,0,1];
let selected_size = 10.0;
var gl_shapelist = [];
var gl_undolist = [];
var undo_amount = 0;

let circle_seg = 10;

let g_selected_shape = POINT;

/*
class Point{
  constructor(){
    //console.log("gamer")
    this.type = "point";
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
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //pass the size of the point
    gl.uniform1f(u_Size, size)

    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
*/



function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true})
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
   a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  //get the storage of the size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
}

function addActions(){
  //clear button
  document.getElementById("clear").onclick = function() { g_colors = []; gl_shapelist = [];gl_undolist = []; gl.clear(gl.COLOR_BUFFER_BIT);}
  //undo
  document.getElementById("undo").onclick = function() {undo()};

  //draw pic
  document.getElementById("draw").onclick = function() {drawPic()};

  //shape select
  document.getElementById("point").onclick = function() { g_selected_shape = POINT}
  document.getElementById("tri").onclick = function() { g_selected_shape = TRI}
  document.getElementById("circle").onclick = function() { g_selected_shape = CIRCLE}

  //check change in sliders
  document.getElementById("redSlide").addEventListener('mouseup', function(){g_selected_color[0] = this.value/100})
  document.getElementById("greenSlide").addEventListener('mouseup', function(){g_selected_color[1] = this.value/100})
  document.getElementById("blueSlide").addEventListener('mouseup', function(){g_selected_color[2] = this.value/100})
  //document.getElementById("alphaSlide").addEventListener('mouseup', function(){g_selected_color[3] = this.value/100})

  //background color sliders
  document.getElementById("redBackSlide").addEventListener('mouseup', function(){g_selected_back_color[0] = this.value/100; changeBack()})
  document.getElementById("greenBackSlide").addEventListener('mouseup', function(){g_selected_back_color[1] = this.value/100; changeBack()})
  document.getElementById("blueBackSlide").addEventListener('mouseup', function(){g_selected_back_color[2] = this.value/100; changeBack()})

  //is this added?

  document.getElementById("sizeSlide").addEventListener('mouseup', function(){selected_size = this.value})
  document.getElementById("segSlide").addEventListener('mouseup', function(){circle_seg = this.value})
}

function changeBack(){
  gl.clearColor(g_selected_back_color[0], g_selected_back_color[1], g_selected_back_color[2], 1.0);
  renderAllShapes();
}

function main() {
  
  setupWebGL();

  connectVariablesToGLSL();

  //make the buttons do the thing they need to do
  addActions();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev); gl_undolist.push(1) };

  canvas.onmousemove = function(ev){ if (ev.buttons == 1) { click(ev); drawing = true; undo_amount++}else{if(drawing == true){drawing = false;gl_undolist.pop(); gl_undolist.push(undo_amount); undo_amount = 0} } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}




//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

function click(ev) {
  //get the cordinates of ev and convert to webgl space and then place into x,y
  let [x,y] = convertToGLSpace(ev);


  //make new point
  let point;

  /*
  if (g_selected_shape == POINT) {
    point = new Point()
  }else{
    point = new Triangle()
  }
  */

  switch (g_selected_shape) {
    case TRI:
      point = new Triangle()
      break;
    case POINT:
      point = new Point()
      break;
    case CIRCLE:
      point = new Circle()
      point.segments = circle_seg;
      break;
  }

  //set point values
  point.position = [x,y];
  point.color = [g_selected_color[0],g_selected_color[1],g_selected_color[2],g_selected_color[3]];
  point.size = selected_size;

  gl_shapelist.push(point)

  renderAllShapes();
}

function undo(){
  //console.log(gl_undolist)
  let x = gl_undolist.pop();
  if (x == 1) {
    gl_shapelist.pop()
  }else{
    gl_shapelist = gl_shapelist.slice(0,gl_shapelist.length - (x+1))
  }
  renderAllShapes()
}

function convertToGLSpace(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  //return both variables
  return ([x,y]);
}

function renderAllShapes(){
  //start timer for performance tracking
  var start_time = performance.now()

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = gl_shapelist.length;
  for(var i = 0; i < len; i++) {
    //call render function for each shape
    gl_shapelist[i].render()
  }

  //check end of performance and put on the page
  var duration = performance.now() - start_time;
  TextToHTML("number of shapes: " +len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "fps")
  
}

function TextToHTML(string, htmlID){
  
  let html = document.getElementById(htmlID);

  if (!html) {
    console.log("Failed to retrive" + htmlID + "from HTML page")
  }

  html.innerHTML = string;
}

function draw_tri(x1, y1, x2, y2, x3, y3){
  
  let cords = [0,0, 0,0, 0,0]
  cords = [x1, y1, x2, y2, x3, y3]
  //console.log(cords)
  cords = convertFromPic(cords);
  drawTriangle(cords);
}

function drawPic(){
  console.log("yeah")
  let verts = [0,0, 0,0, 0,0];
  //draw sky
  gl.uniform4f(u_FragColor, .60, .60, 1, 1);
  draw_tri(0,0, 25,0, 25,25)

  draw_tri(0,0, 0,25, 25,25)


  // draw clouds

  gl.uniform4f(u_FragColor, 1, 1, 1, 1);
  //cloud 1
  draw_tri(0,25, 3,25, 0,21)

  draw_tri(3,20, 3,25, 0,21)

  draw_tri(3,20, 3,25, 4,20)

  draw_tri(5,21, 3,25, 4,20)

  draw_tri(5,21, 3,25, 8,25)

  draw_tri(5,21, 7,20, 8,25)

  draw_tri(8,20, 7,20, 8,25)

  draw_tri(8,20, 10,21, 8,25)

  draw_tri(10,24, 10,21, 8,25)

  draw_tri(10,24, 10,21, 11,22)

  draw_tri(10,24, 11,23, 11,22)

  //cloud 2

  draw_tri(20,24, 17,23, 17,21)

  draw_tri(20,24, 19,20, 17,21)

  draw_tri(20,24, 19,20, 20,20)

  draw_tri(20,24, 22,21, 20,20)

  draw_tri(20,24, 22,21, 23,23)

  draw_tri(20,24, 22,24, 23,23)


  // draw grass
  gl.uniform4f(u_FragColor, .3, .7, .3, 1);
  draw_tri(0,0, 25,5, 0,5)

  draw_tri(0,0, 25,5, 25,0)

  //draw light grey raccoon
  gl.uniform4f(u_FragColor, .75, .75, .75, 1);

  draw_tri(0,7, 1,8, 0,11)

  draw_tri(1,12, 2,13, 2,9)

  draw_tri(3,10, 2,13, 2,9)

  draw_tri(3,10, 2,13, 4,16)

  draw_tri(3,10, 8,17, 4,16)

  draw_tri(3,10, 8,17, 9,10)

  draw_tri(9,17, 8,17, 9,10)

  draw_tri(9,17, 12,10, 9,10)

  draw_tri(9,17, 12,10, 13,16)

  draw_tri(17,12, 12,10, 13,16)

  draw_tri(17,12, 12,10, 17,10)

  draw_tri(17,12, 13,16, 16,15)

  draw_tri(17,12, 17,14, 16,15)

  draw_tri(18,16, 17,14, 16,15)

  draw_tri(18,16, 17,14, 18,15)

  draw_tri(18,16, 19,15, 18,15)

  draw_tri(18,16, 19,15, 20,15)

  draw_tri(20,14, 19,15, 20,15)

  draw_tri(20,14, 21,14, 20,15)

  //self note middle
  draw_tri(20,14, 21,14, 20,11)

  draw_tri(22,12, 21,14, 20,11)

  draw_tri(22,12, 21,14, 23,14)
  //end self note
  draw_tri(20,14, 18,12, 20,11)

  draw_tri(20,11, 18,12, 17,10)

  draw_tri(20,11, 18,12, 17,10)

  draw_tri(17,12, 18,12, 17,10)


  draw_tri(12,10, 15,10, 14,6)

  draw_tri(16,6, 15,10, 14,6)

  draw_tri(16,6, 16,5, 14,6)

  draw_tri(16,6, 16,5, 18,5)


  draw_tri(3,10, 9,10, 4,8)

  draw_tri(8,8, 9,10, 4,8)

  draw_tri(8,8, 7,7, 4,8)

  draw_tri(6,6, 7,7, 4,8)

  draw_tri(6,6, 7,7, 7,5)

  draw_tri(7,6, 7,5, 9,5)


  draw_tri(16,15, 16,16, 17,17)

  draw_tri(16,15, 18,16, 17,17)

  //draw dark grey raccon

  gl.uniform4f(u_FragColor, .25, .25, .25, 1);
  draw_tri(0,11, 1,8, 1,12)

  draw_tri(2,9, 1,8, 1,12)


  draw_tri(18,15, 17,14, 17,12)

  draw_tri(18,15, 18,12, 17,12)

  draw_tri(18,15, 18,12, 20,14)

  draw_tri(18,15, 19,15, 20,14)

  //draw eye

  let point = new Point()

  point.position = [((18.9 / 25)*2 - 1) ,((14.2 / 25)*2 - 1)];
  point.color = [0,0,0,1];
  point.size = 10;

  point.render()
}

function convertFromPic(verts){

  for (let index = 0; index < 6; index++) {
    verts[index] = (verts[index] / 25)*2 - 1 
  }

  return verts;
}