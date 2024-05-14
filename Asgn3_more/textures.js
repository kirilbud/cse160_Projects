function initTextures() {



    var image = new Image();  // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function () { sendTextureToGLSL(image); };
    // Tell the browser to load an image
    image.src = './textures/wood.png';

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


function initTextures3() {



    var image3 = new Image();  // Create the image object
    if (!image3) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image3.onload = function () { sendTextureToGLSL3(image3); };
    // Tell the browser to load an image
    image3.src = './textures/sky.png';

    return true;
}

function sendTextureToGLSL3(image3) {

    var texture3 = gl.createTexture();   // Create a texture object
    if (!texture3) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    //gl.pixelStorei(gl.UNPACK_FLIP_X_WEBGL, 1);
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE2);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture3);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image3);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler2, 2);

    //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

function initTextures4() {



    var image4 = new Image();  // Create the image object
    if (!image4) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image4.onload = function () { sendTextureToGLSL4(image4); };
    // Tell the browser to load an image
    image4.src = './textures/cobble.png';

    return true;
}

function sendTextureToGLSL4(image4) {

    var texture4 = gl.createTexture();   // Create a texture object
    if (!texture4) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    //gl.pixelStorei(gl.UNPACK_FLIP_X_WEBGL, 1);
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE3);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture4);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image4);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler3, 3);

    //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}


function initTextures5() {



    var image5 = new Image();  // Create the image object
    if (!image5) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image5.onload = function () { sendTextureToGLSL5(image5); };
    // Tell the browser to load an image
    image5.src = './textures/sand.png';

    return true;
}

function sendTextureToGLSL5(image5) {

    var texture5 = gl.createTexture();   // Create a texture object
    if (!texture5) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    //gl.pixelStorei(gl.UNPACK_FLIP_X_WEBGL, 1);
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE4);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture5);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image5);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler4, 4);

    //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}