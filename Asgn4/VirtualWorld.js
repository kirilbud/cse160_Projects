//by Kiril Saltz

// Vertex shader program
var VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec2 a_UV;
attribute vec3 a_Normal;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertPos;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_NormalMatrix;
void main() {
  gl_Position =  u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  v_UV = a_UV;
  v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
  v_VertPos = u_ModelMatrix * a_Position;
}
`;

// Fragment shader program
var FSHADER_SOURCE =`
precision mediump float;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertPos;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;
uniform sampler2D u_Sampler4;
uniform vec3 u_lightPos;
uniform vec3 u_spotLightPos;
uniform vec3 u_cameraPos;
uniform bool u_lightOn;
uniform vec3 u_lightColor;
uniform int u_whichTexture;
void main() {
  if(u_whichTexture == -2) {
     gl_FragColor = u_FragColor;
  } else if (u_whichTexture == -1) {
     gl_FragColor = vec4(v_UV,1.0,1.0); //debug UV
  } else if (u_whichTexture == -3) {
     gl_FragColor = vec4((v_Normal + 1.0) / 2.0 , 1.0); //debug Normal
  } else if (u_whichTexture == 0) { //wood
     gl_FragColor = texture2D(u_Sampler0, v_UV);
  } else if (u_whichTexture == 1) { //grass
     gl_FragColor = texture2D(u_Sampler1, v_UV);
  } else if (u_whichTexture == 2) { //sky
     gl_FragColor = texture2D(u_Sampler2, v_UV);
  } else if (u_whichTexture == 3) { //cobble
     gl_FragColor = texture2D(u_Sampler3, v_UV);
  } else if (u_whichTexture == 4) { //sand
     gl_FragColor = texture2D(u_Sampler4, v_UV);
  } else {
     gl_FragColor = vec4(1,.2,.2,1);
  }
  //u_lightPos = vect3(1,1,1);

  vec3 lightVect = u_lightPos - vec3(v_VertPos);
  vec3 spotLightVect =  u_spotLightPos - vec3(v_VertPos);

  float r = length(lightVect);

  //if(r < 1.0){
  //  gl_FragColor = vec4(1,0,0,1);
  //}else if (r < 2.0){
  //  gl_FragColor = vec4(0,1,0,1);
  //}

  //light fall off model
  //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

  vec3 L = normalize(lightVect);
  vec3 N = normalize(v_Normal);
  float nDotL = max(dot(N,L),0.0);

  //reflection
  vec3 R = reflect(-L,N);

  //eye
  vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

  //specular
  float specular = pow(max(dot(E,R),0.0),32.0) * (length(u_lightColor)/3.0); 

  //spotlight vars
  vec3 down = vec3(0,1,0);
  vec3 SL = normalize(spotLightVect);
  float nDotSL = max(dot(N,SL),0.0);

  float downDotSL = max(dot(down,SL),0.0);

  vec3 SR = reflect(-SL,N);
  float spotSpecular = pow(max(dot(E,SR),0.0),32.0)/3.0; 
  vec3 spotDiffuse = (vec3(gl_FragColor) * nDotSL)/3.0;

  if(downDotSL < 0.7){
    spotSpecular = 0.0;
    spotDiffuse = vec3(0.0,0.0,0.0);
  }

  vec3 diffuse = vec3(gl_FragColor) * nDotL;
  diffuse[0] = diffuse[0] * u_lightColor[0];
  diffuse[1] = diffuse[1] * u_lightColor[1];
  diffuse[2] = diffuse[2] * u_lightColor[2];
  vec3 ambient = vec3(gl_FragColor) * 0.3;

  if(u_lightOn){
    gl_FragColor = vec4(specular+spotSpecular+diffuse+spotDiffuse+ambient, 1.0);
  }
  

}
`;



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
let u_NormalMatrix;

let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let a_UV;
let a_Normal;

let u_lightPos;
let u_spotLightPos;
let u_cameraPos;
let u_lightOn;
let u_lightColor;


let global_angle_x = 0;
let global_angle_y = 0;

let g_yellow_ang = 0;
let g_magenta_ang = 0;


var g_selected_color = [1, 0, 0, 1];
var g_selected_back_color = [0, 0, 0, 1];


let g_animating = true;

let g_walking = true;

let g_map = new Map();

let g_block = 0;

let g_norms = false;
let g_lightBool = true;

let g_lightpos = [13,5,13];
let g_spotLightpos = [22,8,22];

let g_lightColor = [1,1,1];



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
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
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

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_spotLightPos = gl.getUniformLocation(gl.program, 'u_spotLightPos');
  if (!u_spotLightPos) {
    console.log('Failed to get the storage location of u_spotLightPos');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
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


  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_NormalMatrix, false, identity.elements)


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
  document.getElementById("pointX_slide").addEventListener('mousemove',function(){ g_lightpos[0] = this.valueAsNumber/10; })
  document.getElementById("pointY_slide").addEventListener('mousemove', function () { g_lightpos[1] = this.valueAsNumber/10; })
  document.getElementById("pointZ_slide").addEventListener('mousemove', function () { g_lightpos[2] = this.valueAsNumber/10; })

  document.getElementById("pointR_slide").addEventListener('mousemove',function(){ g_lightColor[0] = this.valueAsNumber/100; })
  document.getElementById("pointG_slide").addEventListener('mousemove', function () { g_lightColor[1] = this.valueAsNumber/100; })
  document.getElementById("pointB_slide").addEventListener('mousemove', function () { g_lightColor[2] = this.valueAsNumber/100; })

  //foilage generation
  //document.getElementById("foilage").addEventListener('mousemove', function () { foilage_amount = this.valueAsNumber; })
  document.getElementById("norms").onclick = function () { g_norms = !g_norms }
  document.getElementById("lights").onclick = function () { g_lightBool = !g_lightBool; }


  //background color sliders
  //document.getElementById("redBackSlide").addEventListener('mouseup', function(){g_selected_back_color[0] = this.value/100; changeBack()})
  //document.getElementById("greenBackSlide").addEventListener('mouseup', function(){g_selected_back_color[1] = this.value/100; changeBack()})
  //document.getElementById("blueBackSlide").addEventListener('mouseup', function(){g_selected_back_color[2] = this.value/100; changeBack()})

  //is this added?

  //document.getElementById("sizeSlide").addEventListener('mouseup', function(){selected_size = this.value})
  //document.getElementById("segSlide").addEventListener('mouseup', function(){circle_seg = this.value})
}



function changeBack() {
  gl.clearColor(g_selected_back_color[0], g_selected_back_color[1], g_selected_back_color[2], 1.0);
  //renderAllShapes();
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

  initTextures3();
  initTextures4();

  initTextures5();

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
    //delta_time = 0;//specific for grass
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
        g_map.cubes[g_camera.placeCube[0]][g_camera.placeCube[2]][g_camera.placeCube[1]].textureNum = g_block;
      }
      g_e = down;
      break;

    case 81: //q key
      if (down && !g_q && g_camera.RemoveCube !== null) {//place cube... yeah
        g_map.cubes[g_camera.RemoveCube[0]][g_camera.RemoveCube[2]][g_camera.RemoveCube[1]] = null;

      }
      g_q = down;
      break;
    case 49: //1 key
      g_block = 1;
      TextToHTML("Grass", "block");
      break;
    case 50: //2 key
      g_block = 0;
      TextToHTML("Wood", "block");
      break;

    case 51: //3 key
      g_block = 3;
      TextToHTML("Cobblestone", "block");
      break;
    case 52: //3 key
      g_block = 4;
      TextToHTML("Sand", "block");
      break;
    case 32: //spacebar
      //console.log("spacebar =" + down)
      g_space = down;
      ev.preventDefault(); //prevents spacebar from scrolling on the page
      // found on stack overflow https://stackoverflow.com/questions/22559830/html-prevent-space-bar-from-scrolling-page
      break;
    default:
      //console.log("unknown Keydown  = " + ev.keyCode);
      break;
  }
}









//for testing remove later
let npc = new NPC();
let g_skybox = new Cube();
g_skybox.textureNum = 2;

let g_sphere = new Sphere();

let g_light = new Cube();

let g_spotLight = new Cube();

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

  gl.uniform1i(u_lightOn, g_lightBool);

  gl.uniform3f(u_cameraPos,g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);

  gl.uniform3f(u_lightPos, g_lightpos[0] + Math.cos(g_seconds),g_lightpos[1]+Math.sin(g_seconds),g_lightpos[2]);
  gl.uniform3f(u_spotLightPos, g_spotLightpos[0],g_spotLightpos[1],g_spotLightpos[2]);
  g_light.color = [2,2,0,1];
  g_light.textureNum = -2;
  g_light.matrix.setTranslate(g_lightpos[0] + Math.cos(g_seconds),g_lightpos[1]+Math.sin(g_seconds),g_lightpos[2]);
  g_light.matrix.scale(-.1,-.1,-.1);
  g_light.matrix.translate(-.5,-.5,-.5);
  g_light.render();

  
  g_spotLight.color = [0,0,1,1];
  g_spotLight.textureNum = -2;
  g_spotLight.matrix.setTranslate(g_spotLightpos[0],g_spotLightpos[1],g_spotLightpos[2]);
  g_spotLight.matrix.scale(-.1,-.1,-.1);
  g_spotLight.matrix.translate(-.5,-.5,-.5);
  g_spotLight.render();



  g_map.render();

  g_skybox.matrix.setTranslate(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2])
  g_skybox.matrix.scale(-100, -100, 100);
  g_skybox.matrix.rotate(180, 1, 0, 0);
  g_skybox.matrix.rotate(g_seconds, 0, 1, 0);
  g_skybox.matrix.translate(-.5, -.5, -.5);



  //g_skybox.render();


  g_sphere.matrix.setTranslate(14, 3, 14)
  g_sphere.render();


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

