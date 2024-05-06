// ColoredPoint.js (c) 2012 matsuda
//now modified by Kiril Saltz
// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
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
//const POINT = 0;
//const TRI = 1;
//const CIRCLE = 2;

let drawing = false;

let canvas;
let gl;


let a_Position;
//let u_Size;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let global_angle_x = 0;
let global_angle_y = 0;

let g_yellow_ang = 0;
let g_magenta_ang = 0;


var g_selected_color = [1,0,0,1];
var g_selected_back_color = [0,0,0,1];
//let selected_size = 10.0;
//var gl_shapelist = [];
//var gl_undolist = [];
//var undo_amount = 0;

//let circle_seg = 10;

//let g_selected_shape = POINT;

let g_animating = true;

let g_walking = true;



function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true})
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
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

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  var identity = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements)

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identity.elements)

}

var hat1 = null;
var hat2 = null;

var hat2_offset = 0;

function sethat1(val){//selects hat one yes i know there is a better way but im lazy
  switch (val) {
    case "":
      hat1 = null;
      hat2_offset = 0;
      break;
    case "cap":
      hat1 = new Custom("./Hats/cap.obj", "./Hats/cap.mtl");
      hat2_offset = .10;
      break;
    case "sun":
      hat1 = new Custom("./Hats/sun_hat.obj", "./Hats/sun_hat.mtl");
      hat2_offset = .15;
      break;
    case "old":
      hat1 = new Custom("./Hats/old_hat.obj", "./Hats/old_hat.mtl");
      hat2_offset = .15;
      break;
    case "top":
      hat1 = new Custom("./Hats/top_hat.obj", "./Hats/top_hat.mtl");
      hat2_offset = .38;
      break;
    case "tea":
      hat1 = new Custom("./Hats/teapot.obj", "./Hats/teapot.mtl");
      hat2_offset = .31;
      break;
    default:
      hat1 = null;
      hat2_offset = 0;
      break;
  }
}

function sethat2(val){//is this basically the last function? yes, am I going to do something about it? no
  switch (val) {
    case "":
      hat2 = null;
      break;
    case "cap":
      hat2 = new Custom("./Hats/cap.obj", "./Hats/cap.mtl");
      break;
    case "sun":
      hat2 = new Custom("./Hats/sun_hat.obj", "./Hats/sun_hat.mtl");
      break;
    case "old":
      hat2 = new Custom("./Hats/old_hat.obj", "./Hats/old_hat.mtl");
      break;
    case "top":
      hat2 = new Custom("./Hats/top_hat.obj", "./Hats/top_hat.mtl");
      break;
    case "tea":
      hat2 = new Custom("./Hats/teapot.obj", "./Hats/teapot.mtl");
      break;
    default:
      hat2 = null;
      break;
  }
}

function setAnimal(val){//is this basically the last function? yes, am I going to do something about it? no
  switch (val) {
    case "Rac":// raccoon ====================================================================================
      head = new Custom("./Objs/low_poly_raccoon.obj", "./Objs/low_poly_raccoon.mtl");

      body = new Custom("./Objs/low_poly_raccoon_body.obj", "./Objs/low_poly_raccoon_body.mtl");
      

      legLeft =  new Custom("./Objs/low_poly_raccoon_legLeft.obj", "./Objs/low_poly_raccoon_legLeft.mtl");
      legRight =  new Custom("./Objs/low_poly_raccoon_legRight.obj", "./Objs/low_poly_raccoon_legRight.mtl");

      armLeft =  new Custom("./Objs/low_poly_raccoon_armLeft.obj", "./Objs/low_poly_raccoon_armLeft.mtl");
      armRight =  new Custom("./Objs/low_poly_raccoon_armRight.obj", "./Objs/low_poly_raccoon_armRight.mtl");

      tail1 =  new Custom("./Objs/low_poly_raccoon_tail_1.obj", "./Objs/low_poly_raccoon_tail_1.mtl");
      tail2 =  new Custom("./Objs/low_poly_raccoon_tail_2.obj", "./Objs/low_poly_raccoon_tail_2.mtl");
      break;
    case "Gat": //gator========================================================================================
      head = new Custom("./Gator/gator_head.obj", "./Gator/gator_head.mtl");

      body = new Custom("./Gator/gator_body.obj", "./Gator/gator_body.mtl");
      

      legLeft =  new Custom("./Gator/gator_left_leg.obj", "./Gator/gator_left_leg.mtl");
      legRight =  new Custom("./Gator/gator_right_leg.obj", "./Gator/gator_right_leg.mtl");

      armLeft =  new Custom("./Gator/gator_left_arm.obj", "./Gator/gator_left_arm.mtl");
      armRight =  new Custom("./Gator/gator_right_arm.obj", "./Gator/gator_right_arm.mtl");

      tail1 =  new Custom("./Gator/gator_tail1.obj", "./Gator/gator_tail1.mtl");
      tail2 =  new Custom("./Gator/gator_tail2.obj", "./Gator/gator_tail2.mtl");
      break;
    case "owl": //owl========================================================================================
      head = new Custom("./owl/owl_head.obj", "./owl/owl_head.mtl");

      body = new Custom("./owl/owl_body.obj", "./owl/owl_body.mtl");
      

      legLeft =  new Custom("./owl/owl_left_leg.obj", "./owl/owl_left_leg.mtl");
      legRight =  new Custom("./owl/owl_right_leg.obj", "./owl/owl_right_leg.mtl");

      armLeft =  new Custom("./owl/owl_left_arm.obj", "./owl/owl_left_arm.mtl");
      armRight =  new Custom("./owl/owl_right_arm.obj", "./owl/owl_right_arm.mtl");

      tail1 =  new Custom("./owl/owl_tail1.obj", "./owl/owl_tail1.mtl");
      tail2 =  new Custom("./owl/owl_tail2.obj", "./owl/owl_tail2.mtl");
      break;
    default://set defualt to raccoon===========================================================================
      head = new Custom("./Objs/low_poly_raccoon.obj", "./Objs/low_poly_raccoon.mtl");

      body = new Custom("./Objs/low_poly_raccoon_body.obj", "./Objs/low_poly_raccoon_body.mtl");
      

      legLeft =  new Custom("./Objs/low_poly_raccoon_legLeft.obj", "./Objs/low_poly_raccoon_legLeft.mtl");
      legRight =  new Custom("./Objs/low_poly_raccoon_legRight.obj", "./Objs/low_poly_raccoon_legRight.mtl");

      armLeft =  new Custom("./Objs/low_poly_raccoon_armLeft.obj", "./Objs/low_poly_raccoon_armLeft.mtl");
      armRight =  new Custom("./Objs/low_poly_raccoon_armRight.obj", "./Objs/low_poly_raccoon_armRight.mtl");

      tail1 =  new Custom("./Objs/low_poly_raccoon_tail_1.obj", "./Objs/low_poly_raccoon_tail_1.mtl");
      tail2 =  new Custom("./Objs/low_poly_raccoon_tail_2.obj", "./Objs/low_poly_raccoon_tail_2.mtl");

      break;
  }
}


function addActions(){

  //on off switch
  document.getElementById("on").onclick = function() {g_animating = !g_animating}
  //document.getElementById("off").onclick = function() {g_animating = false}

  //hat select
  document.getElementById("hat1").addEventListener('click',function(){ sethat1(this.value)})
  
  document.getElementById("hat2").addEventListener('click',function(){ sethat2(this.value)})

  document.getElementById("Animals").addEventListener('click',function(){ setAnimal(this.value)})


  //check change in sliders
  document.getElementById("camera_slide").addEventListener('mousemove',function(){ global_angle_x = this.valueAsNumber; })
  document.getElementById("yellow_slide").addEventListener('mousemove',function(){ g_yellow_ang = this.valueAsNumber; })
  document.getElementById("magenta_slide").addEventListener('mousemove',function(){ g_magenta_ang = this.valueAsNumber; })

  //foilage generation
  document.getElementById("foilage").addEventListener('mousemove',function(){ foilage_amount = this.valueAsNumber; })
  document.getElementById("create").onclick = function() {gen_foil()}


  //background color sliders
  document.getElementById("redBackSlide").addEventListener('mouseup', function(){g_selected_back_color[0] = this.value/100; changeBack()})
  document.getElementById("greenBackSlide").addEventListener('mouseup', function(){g_selected_back_color[1] = this.value/100; changeBack()})
  document.getElementById("blueBackSlide").addEventListener('mouseup', function(){g_selected_back_color[2] = this.value/100; changeBack()})

  //is this added?

  //document.getElementById("sizeSlide").addEventListener('mouseup', function(){selected_size = this.value})
  //document.getElementById("segSlide").addEventListener('mouseup', function(){circle_seg = this.value})
}

function gen_foil(){
  foilage = [];
  for (let i = 0; i < foilage_amount; i++) {
    foilage.push(new FloorObj())
  }
}

function changeBack(){
  gl.clearColor(g_selected_back_color[0], g_selected_back_color[1], g_selected_back_color[2], 1.0);
  //renderAllShapes();
}

function main() {

  
  
  setupWebGL();

  connectVariablesToGLSL();

  //make the buttons do the thing they need to do
  addActions();

  // Register function (event handler) to be called on a mouse press
  canvas.onclick = function(ev){ if (ev.shiftKey){g_walking = !g_walking} };

  canvas.onmousemove = function(ev){ if (ev.buttons == 1) { click(ev); }else{pre_mouse_pos = null} };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //renderAllShapes();

  requestAnimationFrame(tick)
}




//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

var pre_mouse_pos;

function click(ev) {
  //get the cordinates of ev and convert to webgl space and then place into x,y
  let [x,y] = convertToGLSpace(ev);

  let x_sens = 10;
  let y_sense = 10;

  let curent_mouse_pos = [ev.clientX ,ev.clientY]

  

  if (pre_mouse_pos != null) {
    //console.log("current = "+ curent_mouse_pos)
    //console.log("pre = "+ pre_mouse_pos)
    //console.log("movement = "+ (curent_mouse_pos[0] - pre_mouse_pos[0]))

    let movement_x = (curent_mouse_pos[0] - pre_mouse_pos[0])
    let movement_y = (curent_mouse_pos[1] - pre_mouse_pos[1])/2
    
    global_angle_y -= movement_y;

    global_angle_x -= movement_x;


    //console.log("movement = "+movement_x)
    //console.log("global_angle_x = "+global_angle_x)
    

  }

  if (ev.buttons == 1) {
    pre_mouse_pos = curent_mouse_pos;
  }
  else{
    pre_mouse_pos = null;
  }

  //renderAllShapes();

  
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


var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
var g_pauseTime = 0;

var delta_update = performance.now()/1000.0;
var delta_time = 0;

function tick(){
  //console.log("performance.now = " + performance.now())

  renderAllShapes()
  //console.log("delta = " + delta);

  //console.log(delta_time)

  delta_time = performance.now()/1000.0 - delta_update;
  delta_update = performance.now()/1000.0;
  
  if (g_animating) {
    g_seconds = (performance.now()/1000.0-g_startTime) - g_pauseTime ;
  }else{
    g_pauseTime = (performance.now()/1000.0-g_startTime) -g_seconds ;
    //delta_time = 0;//specific for grass
  }

  if (!g_walking || !g_animating) {
    delta_time = 0;//specific for grass
  }

  //console.log(delta_time);




  requestAnimationFrame(tick);

}

let head = new Custom("./Objs/low_poly_raccoon.obj", "./Objs/low_poly_raccoon.mtl");

let body = new Custom("./Objs/low_poly_raccoon_body.obj", "./Objs/low_poly_raccoon_body.mtl");
//let body = new Custom("./Gator/gator_body.obj", "./Gator/gator_body.mtl");

let legLeft =  new Custom("./Objs/low_poly_raccoon_legLeft.obj", "./Objs/low_poly_raccoon_legLeft.mtl");
let legRight =  new Custom("./Objs/low_poly_raccoon_legRight.obj", "./Objs/low_poly_raccoon_legRight.mtl");

let armLeft =  new Custom("./Objs/low_poly_raccoon_armLeft.obj", "./Objs/low_poly_raccoon_armLeft.mtl");
let armRight =  new Custom("./Objs/low_poly_raccoon_armRight.obj", "./Objs/low_poly_raccoon_armRight.mtl");

let tail1 =  new Custom("./Objs/low_poly_raccoon_tail_1.obj", "./Objs/low_poly_raccoon_tail_1.mtl");
let tail2 =  new Custom("./Objs/low_poly_raccoon_tail_2.obj", "./Objs/low_poly_raccoon_tail_2.mtl");

let floorObs = new FloorObj();

let foilage = [];
let foilage_amount = 0;


function renderAllShapes(){
  //console.log("Hello!!")
  //start timer for performance tracking
  var start_time = performance.now()

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /* keep this for later ------- draws all the shapes
  var len = gl_shapelist.length;
  for(var i = 0; i < len; i++) {
    //call render function for each shape
    gl_shapelist[i].render()
  }
  */

  //draw test tri
  //let matrix = new Matrix4()
  //gl.uniformMatrix4fv(u_ModelMatrix, false, matrix)
  //drawTriangle3D([-1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0,0])
  var globalRotMax = new Matrix4()
  globalRotMax.rotate(-10 + global_angle_y, 1, 0, 0);
  globalRotMax.rotate(global_angle_x, 0, 1, 0);
    
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMax.elements)

  if (!g_walking) {//waving animation ++++++++++++++++++++++++++++++++++++++++++++++ waving animation ++++++++++++++++++++++++++
    //body
    let bodyCords;
    if (body.finished_making_objs) {
      body.matrix.setTranslate(0,-.5,0.0)
      body.matrix.rotate(90,0,1.0,0)
      body.matrix.rotate(10*Math.sin(g_seconds*4)-15,1,0,0);
      //body.matrix.translate(0,.02*Math.cos(g_seconds*8-.3),0.0)
      bodyCords = new Matrix4(body.matrix);
      body.render();
      //console.log(body)
    }
    

    
    //head
    let headSpace;
    if (head.finished_making_objs) {
      head.matrix = new Matrix4(bodyCords)
      head.matrix.translate(0,+.4,0.0)
      //head.matrix.translate(0,.2*Math.sin(g_seconds*3),0.0)
      //head.matrix.rotate(-10*Math.sin(g_seconds*5),0,1,0);
      head.matrix.rotate(10*Math.sin(g_seconds*4)-20,1,0,0);
      headSpace = new Matrix4(head.matrix)
      head.render();
    }

    //console.log(g_magenta_ang)

    //legs
    if (legLeft.finished_making_objs) {
      legLeft.matrix = new Matrix4()
      legLeft.matrix.setRotate(90,0,1,0)
      legLeft.matrix.translate(0,-.5,-.06)
      //legLeft.matrix.rotate(45*Math.sin(g_seconds*4),0,0,1);
      legLeft.render();
    }

    if (legRight.finished_making_objs) {
      legRight.matrix = new Matrix4()
      legRight.matrix.setRotate(90,0,1,0)
      legRight.matrix.translate(0,-.5,+.06)
      //legRight.matrix.rotate(-45*Math.sin(g_seconds*4),0,0,1);
      legRight.render();
    }

    //arms
    if (armLeft.finished_making_objs) {
      armLeft.matrix = new Matrix4(bodyCords)
      armLeft.matrix.translate(0,+.31,+.15)
      armLeft.matrix.rotate(25*Math.sin(g_seconds*4)-85,1,0,0);
      armLeft.render();
    }

    if (armRight.finished_making_objs) {
      armRight.matrix = new Matrix4(bodyCords)
      armRight.matrix.translate(0,+.31,-.15)
      armRight.matrix.rotate(-3*Math.sin(g_seconds*4),1,0,0);
      armRight.render();
    }

    //tails
    let tailspace;
    if (tail1.finished_making_objs) {
      tail1.matrix = new Matrix4(bodyCords)
      tail1.matrix.translate(-.15 ,+.05,0)
      tail1.matrix.rotate(-45*Math.sin(g_seconds*7),0,1,0);
      tailspace = new Matrix4(tail1.matrix)
      tail1.render();
    }

    if (tail2.finished_making_objs) {
      tail2.matrix = new Matrix4(tailspace)
      tail2.matrix.translate(-.2,0,0)
      //tail2.matrix.rotate(45,0,1,0)
      tail2.matrix.rotate(-45*Math.sin(g_seconds*7),0,1,0);
      tail2.render();
    }

    //hats
    let hatSpace;
    if (!(hat1 === null) && hat1.finished_making_objs ) {
      hat1.matrix = new Matrix4(headSpace)
      hat1.matrix.translate(0,+.44,0)
      //tail2.matrix.rotate(45,0,1,0)
      hat1.matrix.rotate(g_yellow_ang,0,1,0);
      hatSpace = new Matrix4(hat1.matrix)
      hat1.render();
    }

    if (!(hat1 === null) && !(hat2 === null) && hat2.finished_making_objs ) {
      hat2.matrix = new Matrix4(hatSpace)
      hat2.matrix.translate(0,hat2_offset,0)
      //tail2.matrix.rotate(45,0,1,0)
      hat2.matrix.rotate(g_magenta_ang,0,1,0);
      
      hat2.render();
    }

    //end waving animation ++++++++++++++++++++++++++++++++++++++++++++++ end waving animation ++++++++++++++++++++++++++
  
  }else{ //walking animation ++++++++++++++++++++++++++++++++++++++++++++++ walking animation ++++++++++++++++++++++++++
    //test cube for obj loader
    //var cube = new Custom("./Objs/cube.obj", "./Objs/cube.mtl")

    //body
    let bodyCords;
    if (body.finished_making_objs) {
      body.matrix.setTranslate(0,-.5,0.0)
      body.matrix.rotate(90,0,1.0,0)
      body.matrix.rotate(10*Math.sin(g_seconds*4),0,1,0);
      body.matrix.translate(0,.02*Math.cos(g_seconds*8-.3),0.0)
      bodyCords = new Matrix4(body.matrix);
      body.render();
      //console.log(body)
    }
    

    
    //head
    let headSpace;
    if (head.finished_making_objs) {
      head.matrix = new Matrix4(bodyCords)
      head.matrix.translate(0,+.4,0.0)
      //head.matrix.translate(0,.2*Math.sin(g_seconds*3),0.0)
      //head.matrix.rotate(-10*Math.sin(g_seconds*5),0,1,0);
      head.matrix.rotate(-10*Math.sin(g_seconds*3),1,0,0);
      headSpace = new Matrix4(head.matrix)
      head.render();
    }

    //console.log(g_magenta_ang)

    //legs
    if (legLeft.finished_making_objs) {
      legLeft.matrix = new Matrix4(bodyCords)
      legLeft.matrix.translate(0,-.03,-.06)
      legLeft.matrix.rotate(45*Math.sin(g_seconds*4),0,0,1);
      legLeft.render();
    }

    if (legRight.finished_making_objs) {
      legRight.matrix = new Matrix4(bodyCords)
      legRight.matrix.translate(0,-.03,+.06)
      legRight.matrix.rotate(-45*Math.sin(g_seconds*4),0,0,1);
      legRight.render();
    }

    //arms
    if (armLeft.finished_making_objs) {
      armLeft.matrix = new Matrix4(bodyCords)
      armLeft.matrix.translate(0,+.31,+.15)
      armLeft.matrix.rotate(10*Math.sin(g_seconds*4),0,0,1);
      armLeft.render();
    }

    if (armRight.finished_making_objs) {
      armRight.matrix = new Matrix4(bodyCords)
      armRight.matrix.translate(0,+.31,-.15)
      armRight.matrix.rotate(-10*Math.sin(g_seconds*4),0,0,1);
      armRight.render();
    }

    //tails
    let tailspace;
    if (tail1.finished_making_objs) {
      tail1.matrix = new Matrix4(bodyCords)
      tail1.matrix.translate(-.15 ,+.05,0)
      tail1.matrix.rotate(-30*Math.sin(g_seconds*5),0,1,0);
      tailspace = new Matrix4(tail1.matrix)
      tail1.render();
    }

    if (tail2.finished_making_objs) {
      tail2.matrix = new Matrix4(tailspace)
      tail2.matrix.translate(-.2,0,0)
      //tail2.matrix.rotate(45,0,1,0)
      tail2.matrix.rotate(-30*Math.sin(g_seconds*5),0,1,0);
      tail2.render();
    }

    //hats
    let hatSpace;
    if (!(hat1 === null) && hat1.finished_making_objs ) {
      hat1.matrix = new Matrix4(headSpace)
      hat1.matrix.translate(0,+.44,0)
      //tail2.matrix.rotate(45,0,1,0)
      hat1.matrix.rotate(g_yellow_ang,0,1,0);
      hatSpace = new Matrix4(hat1.matrix)
      hat1.render();
    }

    if (!(hat1 === null) && !(hat2 === null) && hat2.finished_making_objs ) {
      hat2.matrix = new Matrix4(hatSpace)
      hat2.matrix.translate(0,hat2_offset,0)
      //tail2.matrix.rotate(45,0,1,0)
      hat2.matrix.rotate(g_magenta_ang,0,1,0);
      
      hat2.render();
    }
    //end walking animation ++++++++++++++++++++++++++++++++++++++++++++++ end walking animation ++++++++++++++++++++++++++
  }

  
  //floor stuff
  for (let i = 0; i < foilage.length; i++) {
    const element = foilage[i].render(delta_time);
    
  }

  //floorObs.render(delta_time);
  



  //console.log(body)


  

  //draw grass floor
  var grass = new Cube();
  grass.color = [0.1,0.6,0.1,1.0]
  grass.matrix.translate(0,-.8, 0.0)
  grass.matrix.scale(1,.1, 1)
  grass.render();


  /*
  //drawing body also replace this
  var something = new Cube();
  something.color = [1.0,0.0,0.0,1.0]
  something.matrix.translate(0.0,-.75, 0.0)
  something.matrix.rotate(-5,1,0,0)
  //body.matrix.scale(0.5, 1, .5)
  something.matrix.scale(0.5, .3, .5)
  something.render();

  // draw left arm I guess replace later
  var leftarm = new Cube();
  leftarm.color = [1,1,0,1]
  leftarm.matrix.translate(0,-.7,0.0);
  leftarm.matrix.rotate(-5,1,0,1);
  leftarm.matrix.rotate(-g_yellow_ang,0,0,1);
  var yellow_cords = new Matrix4( leftarm.matrix);
  leftarm.matrix.scale(0.25,.7,.5);
  leftarm.matrix.translate(0, .50 ,0);
  leftarm.render();

  //testbox
  var box = new Cube();
  box.color = [1,0,1,1];
  box.matrix = yellow_cords;
  box.matrix.translate(0,0.8,0)
  box.matrix.rotate(g_magenta_ang,0,0)
  //box.matrix
  //box.matrix.translate(-.1,.1,0,0);
  //box.matrix.rotate(-30,1,0,0)
  box.matrix.scale(.2,.4,.2)
  box.render()

  */



  var identity = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements)
  

  //check end of performance and put on the page
  var duration = performance.now() - start_time;
  TextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "fps")
  
}

function TextToHTML(string, htmlID){
  
  let html = document.getElementById(htmlID);

  if (!html) {
    console.log("Failed to retrive" + htmlID + "from HTML page")
  }

  html.innerHTML = string;
}

