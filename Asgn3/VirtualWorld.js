//by Kiril Saltz

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_UV;\n' +
  'varying vec2 v_UV;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjectionMatrix;\n' +
  'void main() {\n' +
  '  gl_Position =  u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_UV = a_UV;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec2 v_UV;\n' +
  'uniform vec4 u_FragColor;\n' +
  'uniform sampler2D u_Sampler0;\n' +
  'uniform sampler2D u_Sampler1;\n' +
  'uniform int u_whichTexture;\n' +
  'void main() {\n' +
  '  if(u_whichTexture == -2) {\n' +
  '     gl_FragColor = u_FragColor;\n' +
  '  } else if (u_whichTexture == -1) {\n' +
  '     gl_FragColor = vec4(v_UV,1.0,1.0);\n' +
  '  } else if (u_whichTexture == 0) {\n' +
  '     gl_FragColor = texture2D(u_Sampler0, v_UV);\n' +
  '  } else if (u_whichTexture == 1) {\n' +
  '     gl_FragColor = texture2D(u_Sampler1, v_UV);\n' +
  '  } else {\n' +
  '     gl_FragColor = vec4(1,.2,.2,1);\n' +
  '  }\n' +
  '}\n';


//GLOBAL VARIALBLES -----------------------
//const for selection
//const POINT = 0;
//const TRI = 1;
//const CIRCLE = 2;

let drawing = false;

let canvas;
let gl;

let g_fov = 90;
let g_camera = new Camera();

let a_Position;
//let u_Size;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let u_ViewMatrix;
let u_ProjectionMatrix;

let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let a_UV;

let global_angle_x = 0;
let global_angle_y = 0;

let g_yellow_ang = 0;
let g_magenta_ang = 0;


var g_selected_color = [1, 0, 0, 1];
var g_selected_back_color = [0, 0, 0, 1];


let g_animating = true;

let g_walking = true;

let g_map = new Map();



function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true })
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
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


  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_ViewMatrix, false, identity.elements)


  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, identity.elements)


}

var hat1 = null;
var hat2 = null;

var hat2_offset = 0;

function sethat1(val) {//selects hat one yes i know there is a better way but im lazy
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

function sethat2(val) {//is this basically the last function? yes, am I going to do something about it? no
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

function setAnimal(val) {//is this basically the last function? yes, am I going to do something about it? no
  switch (val) {
    case "Rac":// raccoon ====================================================================================
      head = new Custom("./Objs/low_poly_raccoon.obj", "./Objs/low_poly_raccoon.mtl");

      body = new Custom("./Objs/low_poly_raccoon_body.obj", "./Objs/low_poly_raccoon_body.mtl");


      legLeft = new Custom("./Objs/low_poly_raccoon_legLeft.obj", "./Objs/low_poly_raccoon_legLeft.mtl");
      legRight = new Custom("./Objs/low_poly_raccoon_legRight.obj", "./Objs/low_poly_raccoon_legRight.mtl");

      armLeft = new Custom("./Objs/low_poly_raccoon_armLeft.obj", "./Objs/low_poly_raccoon_armLeft.mtl");
      armRight = new Custom("./Objs/low_poly_raccoon_armRight.obj", "./Objs/low_poly_raccoon_armRight.mtl");

      tail1 = new Custom("./Objs/low_poly_raccoon_tail_1.obj", "./Objs/low_poly_raccoon_tail_1.mtl");
      tail2 = new Custom("./Objs/low_poly_raccoon_tail_2.obj", "./Objs/low_poly_raccoon_tail_2.mtl");
      break;
    case "Gat": //gator========================================================================================
      head = new Custom("./Gator/gator_head.obj", "./Gator/gator_head.mtl");

      body = new Custom("./Gator/gator_body.obj", "./Gator/gator_body.mtl");


      legLeft = new Custom("./Gator/gator_left_leg.obj", "./Gator/gator_left_leg.mtl");
      legRight = new Custom("./Gator/gator_right_leg.obj", "./Gator/gator_right_leg.mtl");

      armLeft = new Custom("./Gator/gator_left_arm.obj", "./Gator/gator_left_arm.mtl");
      armRight = new Custom("./Gator/gator_right_arm.obj", "./Gator/gator_right_arm.mtl");

      tail1 = new Custom("./Gator/gator_tail1.obj", "./Gator/gator_tail1.mtl");
      tail2 = new Custom("./Gator/gator_tail2.obj", "./Gator/gator_tail2.mtl");
      break;
    case "owl": //owl========================================================================================
      head = new Custom("./owl/owl_head.obj", "./owl/owl_head.mtl");

      body = new Custom("./owl/owl_body.obj", "./owl/owl_body.mtl");


      legLeft = new Custom("./owl/owl_left_leg.obj", "./owl/owl_left_leg.mtl");
      legRight = new Custom("./owl/owl_right_leg.obj", "./owl/owl_right_leg.mtl");

      armLeft = new Custom("./owl/owl_left_arm.obj", "./owl/owl_left_arm.mtl");
      armRight = new Custom("./owl/owl_right_arm.obj", "./owl/owl_right_arm.mtl");

      tail1 = new Custom("./owl/owl_tail1.obj", "./owl/owl_tail1.mtl");
      tail2 = new Custom("./owl/owl_tail2.obj", "./owl/owl_tail2.mtl");
      break;
    default://set defualt to raccoon===========================================================================
      head = new Custom("./Objs/low_poly_raccoon.obj", "./Objs/low_poly_raccoon.mtl");

      body = new Custom("./Objs/low_poly_raccoon_body.obj", "./Objs/low_poly_raccoon_body.mtl");


      legLeft = new Custom("./Objs/low_poly_raccoon_legLeft.obj", "./Objs/low_poly_raccoon_legLeft.mtl");
      legRight = new Custom("./Objs/low_poly_raccoon_legRight.obj", "./Objs/low_poly_raccoon_legRight.mtl");

      armLeft = new Custom("./Objs/low_poly_raccoon_armLeft.obj", "./Objs/low_poly_raccoon_armLeft.mtl");
      armRight = new Custom("./Objs/low_poly_raccoon_armRight.obj", "./Objs/low_poly_raccoon_armRight.mtl");

      tail1 = new Custom("./Objs/low_poly_raccoon_tail_1.obj", "./Objs/low_poly_raccoon_tail_1.mtl");
      tail2 = new Custom("./Objs/low_poly_raccoon_tail_2.obj", "./Objs/low_poly_raccoon_tail_2.mtl");

      break;
  }
}


function addActions() { // for connecting to html functions

  //on off switch
  //document.getElementById("on").onclick = function () { g_animating = !g_animating }
  //document.getElementById("off").onclick = function() {g_animating = false}

  //hat select
  //document.getElementById("hat1").addEventListener('click', function () { sethat1(this.value) })

  //document.getElementById("hat2").addEventListener('click', function () { sethat2(this.value) })

  //document.getElementById("Animals").addEventListener('click', function () { setAnimal(this.value) })

  //fov slider
  document.getElementById("fov").addEventListener('mousemove', function () { g_fov = this.value })

  //check change in sliders
  //document.getElementById("camera_slide").addEventListener('mousemove',function(){ global_angle_x = this.valueAsNumber; })
  //document.getElementById("yellow_slide").addEventListener('mousemove', function () { g_yellow_ang = this.valueAsNumber; })
  //document.getElementById("magenta_slide").addEventListener('mousemove', function () { g_magenta_ang = this.valueAsNumber; })

  //foilage generation
  //document.getElementById("foilage").addEventListener('mousemove', function () { foilage_amount = this.valueAsNumber; })
  //document.getElementById("create").onclick = function () { gen_foil() }


  //background color sliders
  //document.getElementById("redBackSlide").addEventListener('mouseup', function(){g_selected_back_color[0] = this.value/100; changeBack()})
  //document.getElementById("greenBackSlide").addEventListener('mouseup', function(){g_selected_back_color[1] = this.value/100; changeBack()})
  //document.getElementById("blueBackSlide").addEventListener('mouseup', function(){g_selected_back_color[2] = this.value/100; changeBack()})

  //is this added?

  //document.getElementById("sizeSlide").addEventListener('mouseup', function(){selected_size = this.value})
  //document.getElementById("segSlide").addEventListener('mouseup', function(){circle_seg = this.value})
}

function gen_foil() {
  foilage = [];
  for (let i = 0; i < foilage_amount; i++) {
    foilage.push(new FloorObj())
  }
}

function changeBack() {
  gl.clearColor(g_selected_back_color[0], g_selected_back_color[1], g_selected_back_color[2], 1.0);
  //renderAllShapes();
}

function initTextures() {



  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function () { sendTextureToGLSL(image); };
  // Tell the browser to load an image
  image.src = './textures/Debug.png';

  return true;
}

function sendTextureToGLSL(image) {

  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}



//I swear i will fix this but im tired rn and cant be bothered
function initTextures2() {



  var image2 = new Image();  // Create the image object
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image2.onload = function () { sendTextureToGLSL2(image2); };
  // Tell the browser to load an image
  image2.src = './textures/Grass.png';

  return true;
}

function sendTextureToGLSL2(image2) {

  var texture2 = gl.createTexture();   // Create a texture object
  if (!texture2) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  //gl.pixelStorei(gl.UNPACK_FLIP_X_WEBGL, 1);
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture2);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}


function main() {



  setupWebGL();

  connectVariablesToGLSL();

  //make the buttons do the thing they need to do
  addActions();



  document.onkeydown = function (ev) { keydown(ev, true) }
  document.onkeyup = function (ev) { keydown(ev, false) };

  // Register function (event handler) to be called on a mouse press
  canvas.onclick = function (ev) { if (ev.shiftKey) { g_walking = !g_walking } };

  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev); } else { pre_mouse_pos = null } };

  initTextures();

  initTextures2();//im so sorry about this janky code

  // Specify the color for clearing <canvas>
  gl.clearColor(0.3, 1.0, 1.0, 1.0);

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
  let [x, y] = convertToGLSpace(ev);

  let x_sens = 10;
  let y_sense = 10;

  let curent_mouse_pos = [ev.clientX, ev.clientY]



  if (pre_mouse_pos != null) {
    //console.log("current = "+ curent_mouse_pos)
    //console.log("pre = "+ pre_mouse_pos)
    //console.log("movement = "+ (curent_mouse_pos[0] - pre_mouse_pos[0]))

    let movement_x = (curent_mouse_pos[0] - pre_mouse_pos[0])
    let movement_y = (curent_mouse_pos[1] - pre_mouse_pos[1]) / 2

    global_angle_y -= movement_y;

    global_angle_x -= movement_x;


    //console.log("movement = "+movement_x)
    //console.log("global_angle_x = "+global_angle_x)


  }

  if (ev.buttons == 1) {
    pre_mouse_pos = curent_mouse_pos;
  }
  else {
    pre_mouse_pos = null;
  }

  //renderAllShapes();


}

function undo() {
  //console.log(gl_undolist)
  let x = gl_undolist.pop();
  if (x == 1) {
    gl_shapelist.pop()
  } else {
    gl_shapelist = gl_shapelist.slice(0, gl_shapelist.length - (x + 1))
  }
  renderAllShapes()
}

function convertToGLSpace(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  //return both variables
  return ([x, y]);
}


var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var g_pauseTime = 0;

var delta_update = performance.now() / 1000.0;
var delta_time = 0;

function tick() {
  //console.log("performance.now = " + performance.now())

  renderAllShapes()
  //console.log("delta = " + delta);

  //console.log(delta_time)

  delta_time = performance.now() / 1000.0 - delta_update;
  delta_update = performance.now() / 1000.0;

  if (g_animating) {
    g_seconds = (performance.now() / 1000.0 - g_startTime) - g_pauseTime;
  } else {
    g_pauseTime = (performance.now() / 1000.0 - g_startTime) - g_seconds;
    //delta_time = 0;//specific for grass
  }

  if (!g_walking || !g_animating) {
    delta_time = 0;//specific for grass
  }

  //console.log(delta_time);




  requestAnimationFrame(tick);

}

//global keybinds
let g_w = false;
let g_a = false;
let g_s = false;
let g_d = false;

let g_space = false;
let g_v = false;

let g_e = false;
let g_q = false;


function keydown(ev, down) { //gets the key down and if its up or not
  //console.log("ev = " + ev);
  switch (ev.keyCode) {

    case 87: //w key
      //console.log("w = " + down)
      g_w = down;
      break;

    case 65: //a key
      //console.log("a = " + down)
      g_a = down;
      break;

    case 83: //s key
      //console.log("s = " + down)
      g_s = down;
      break;

    case 68: //d key
      //console.log("d = " + down)
      g_d = down;
      break;

    case 86: //v key
      //console.log("v = " + down)
      g_v = down;
      break;

    case 69: //e key
      if (down && !g_e && g_camera.placeCube !== null) {//place cube... yeah
        g_map.cubes[g_camera.placeCube[0]][g_camera.placeCube[2]][g_camera.placeCube[1]] = new Cube();
        g_map.cubes[g_camera.placeCube[0]][g_camera.placeCube[2]][g_camera.placeCube[1]].matrix.translate(g_camera.placeCube[0], g_camera.placeCube[1], g_camera.placeCube[2]);
      }
      g_e = down;
      break;

    case 81: //q key
      if (down && !g_q && g_camera.RemoveCube !== null) {//place cube... yeah
        g_map.cubes[g_camera.RemoveCube[0]][g_camera.RemoveCube[2]][g_camera.RemoveCube[1]] = null;
        
      }
      g_q = down;
      break;


    case 32: //spacebar
      //console.log("spacebar =" + down)
      g_space = down;
      ev.preventDefault(); //prevents spacebar from scrolling on the page
      // found on stack overflow https://stackoverflow.com/questions/22559830/html-prevent-space-bar-from-scrolling-page
      break;
    default:
      console.log("unknown Keydown  = " + ev.keyCode);
      break;
  }
}









//for testing remove later
let npc = new NPC();


function renderAllShapes() {

  //start timer for performance tracking
  var start_time = performance.now()

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var projMat = new Matrix4()
  projMat.setPerspective(g_fov, canvas.width / canvas.height, .1, 100)
  //projMat.rotate((- global_angle_y)*3, 1, 0, 0);
  //projMat.rotate(-global_angle_x, 0, 1, 0);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements)

  var viewMat = new Matrix4()

  //handle camera movement

  //g_camera.rotateX(global_angle_y)
  //g_camera.rotateY(-global_angle_x)
  g_camera.rotate(global_angle_y, global_angle_x);
  // movement code here using delta time please
  g_camera.handle_movement(g_w, g_s, g_d, g_a, g_space, g_v, delta_time)

  //set up camera matrix
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
  );// eye / at / up

  //viewMat.rotate(-10 + global_angle_y, 1, 0, 0);
  //viewMat.rotate(-global_angle_x, 0, 1, 0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements)

  var globalRotMax = new Matrix4()
  //globalRotMax.rotate(-10 + global_angle_y, 1, 0, 0);
  //globalRotMax.rotate(-global_angle_x, 0, 1, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMax.elements)


  g_map.render();

  g_camera.castRay();





  


  //floor stuff
  

  //floorObs.render(delta_time);




  //console.log(body)

  npc.render();




  var identity = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements)


  //check end of performance and put on the page
  var duration = performance.now() - start_time;
  TextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration), "fps")

}

function TextToHTML(string, htmlID) {

  let html = document.getElementById(htmlID);

  if (!html) {
    console.log("Failed to retrive" + htmlID + "from HTML page")
  }

  html.innerHTML = string;
}

