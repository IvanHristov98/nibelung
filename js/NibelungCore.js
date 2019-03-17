// constant to hold float size
const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

var gl;                 // global webgl context
var canvas;             // global drawing canvas
var glProg;             // global webgl program
var glMat;              // global transformation matrix
var isGlMatNew;         // flag used to signify if the matrix has been changed
var glViewMat;          // global view matrix
var glMatStack = [];    // global stack of matrices
var glEye = undefined;    // global variable to hold the position of the eye

// returns a context from a given HTML element
function getContext(id)
{
    canvas = document.getElementById(id);

    if (!canvas)
    {
        alert('Canvas не се поддържа от браузъра.');
        return null;
    }

    let context = canvas.getContext("webgl");

    if (!context)
    {
        context = canvas.getContext("experimental-webgl");
    }

    if(!context)
    {
        alert('WebGL не се поддържа от браузъра.');
        return null;
    }

    return context;
}

// returns a compiled shader
function getShader(source, type)
{
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

// links and returns a complete program
function getProgram(vSource, fSource)
{
    let vShader = getShader(vSource, gl.VERTEX_SHADER);
    let fShader = getShader(fSource, gl.FRAGMENT_SHADER);

    if (!vShader || !fShader) { return null; }

    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vShader);
    gl.attachShader(shaderProgram, fShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    {
        alert(gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function switchProgram(prog)
{
    glProg = prog;
    gl.useProgram(glProg);
    getVariables();
}

// finds the addresses of all uniform and attribute variables
function getVariables()
{
    for (let i = 0; i < gl.getProgramParameter(glProg, gl.ACTIVE_UNIFORMS); ++i)
    {
        let name = gl.getActiveUniform(glProg, i).name;
        window[name] = gl.getUniformLocation(glProg, name);
    }

    for (let i = 0; i < gl.getProgramParameter(glProg, gl.ACTIVE_ATTRIBUTES); ++i)
    {
        let name = gl.getActiveAttrib(glProg, i).name;
        window[name] = gl.getAttribLocation(glProg, name);
    }
}

// random number in the range between a and b
function random(a, b)
{
    return a + (b-a)*Math.random();
}

// converts degrees to radians
function radians(degrees)
{
    return degrees*Math.PI/180;
}

function orthoMatrix(width, height, near, far)
{
    let matrix = [
        2.0/width, 0, 0, 0,
        0, 2.0/height, 0, 0,
        0, 0, 2.0/(near-far), 0,
        0, 0, (far+near)/(near-far), 1
    ];

    return new Float32Array(matrix);
}

function perspMatrix(angle, aspect, near, far)
{
    let fov = 1/Math.tan(radians(angle)/2);
    let matrix = [
        fov/aspect, 0, 0, 0,
        0, fov, 0, 0,
        0, 0, (far+near)/(near-far), -1,
        0, 0, 2.0*near*far/(near-far), 0
    ];

    return new Float32Array(matrix);
}

function perspective(angle, aspect, near, far)
{
    let proj = perspMatrix(angle, aspect, near, far);

    if (gl.getUniformLocation(glProg, "uProjectionMatrix"))
    {
        gl.uniformMatrix4fv(uProjectionMatrix, false, proj);
    }
}

function ortho(width, height, near, far)
{
    let proj = orthoMatrix(width, height, near, far);

    if (gl.getUniformLocation(glProg, "uProjectionMatrix"))
    {
        gl.uniformMatrix4fv(uProjectionMatrix, false, proj);
    }
}

// normalizes a vector with a norm of 1
function unitVector(x)
{
    let length = 1/vectorLength(x);

    return [length*x[0], length*x[1], length*x[2]];
}

// Converts a 2D vector to a unit one
function unitVector2D(vector)
{
    let length = 1/Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2));
    return [length*vector[0], length*vector[1]];
}

function vectorLength(x)
{
    return Math.sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2]);
}

// returns a vector product of two vectors
function vectorProduct(x, y)
{
    return [
        x[1]*y[2] - x[2]*y[1],
        x[2]*y[0] - x[0]*y[2],
        x[0]*y[1] - x[1]*y[0]
    ];
}

// returns a scalar product of two vectors
function scalarProduct(x, y)
{
    return (x[0]*y[0] + x[1]*y[1] + x[2]*y[2]);
}

function vectorPoints(x, y)
{
    return [x[0]-y[0], x[1]-y[1], x[2]-y[2]];
}

// generates a matrix for a view point, parameters must be arrays
function viewMatrix(eye, focus, up)
{
    glEye = eye;
    // unit vector z' of the view direction
    let z = unitVector(vectorPoints(eye, focus));
    // unit vector x' perpendicular to z' and the up direction
    let x = unitVector(vectorProduct(up, z));
    // unit vector y' perpendicular to z' and x'
    let y = unitVector(vectorProduct(z, x));

    let matrix = [
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -scalarProduct(x, eye),
        -scalarProduct(y, eye),
        -scalarProduct(z, eye),
        1
    ];

    return new Float32Array(matrix);
}

// establishes a view point
function lookAt(eye,target,up)
{
    glViewMat = viewMatrix(eye,target,up);

    if (gl.getUniformLocation(glProg, "uViewMatrix"))
    {
        gl.uniformMatrix4fv(uViewMatrix,false,glViewMat);
    }
}

// matrix multiplication
function multiplyMatrix(a, b) {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    let out=[];
    let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
}

function multiplyMatrixVec4(mat, vec)
{
    let out = [];
    out[0] = mat[0]*vec[0] + mat[1]*vec[1] + mat[2]*vec[2] + mat[3]*vec[3];
    out[1] = mat[4]*vec[0] + mat[5]*vec[1] + mat[6]*vec[2] + mat[7]*vec[3];
    out[2] = mat[8]*vec[0] + mat[9]*vec[1] + mat[10]*vec[2] + mat[11]*vec[3];
    out[3] = mat[12]*vec[0] + mat[13]*vec[1] + mat[14]*vec[2] + mat[15]*vec[3];

    return out;
}

// loads the identty matrix in the model matrix
function identity()
{
    isGlMatNew = true;
    glMat = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}

// adds translation to the model matrix
function translate(v)
{
    isGlMatNew = true;
    glMat[12] += glMat[0]*v[0]+glMat[4]*v[1]+glMat[8]*v[2];
    glMat[13] += glMat[1]*v[0]+glMat[5]*v[1]+glMat[9]*v[2];
    glMat[14] += glMat[2]*v[0]+glMat[6]*v[1]+glMat[10]*v[2];
}

// adds scaling the model matrix
function scale(v)
{
    isGlMatNew = true;
    glMat[0] *= v[0];
    glMat[1] *= v[0];
    glMat[2] *= v[0];

    glMat[4] *= v[1];
    glMat[5] *= v[1];
    glMat[6] *= v[1];

    glMat[8] *= v[2];
    glMat[9] *= v[2];
    glMat[10] *= v[2];
}

// adds rotation around the x axis to the model matrix
function xRotate(a)
{
    isGlMatNew = true;

    a = radians(a);
    let s = Math.sin(a);
    let c = Math.cos(a);

    a = glMat[4]*s+glMat[8]*c;
    glMat[4]=glMat[4]*c-glMat[8]*s;
    glMat[8]=a;

    a = glMat[5]*s+glMat[9]*c;
    glMat[5]=glMat[5]*c-glMat[9]*s;
    glMat[9]=a;

    a = glMat[6]*s+glMat[10]*c;
    glMat[6]=glMat[6]*c-glMat[10]*s;
    glMat[10]=a;
}

// adds rotation around the y axis to the model matrix
function yRotate(a)
{
    isGlMatNew = true;

    a = radians(a);
    var s = Math.sin(a);
    var c = Math.cos(a);

    a = glMat[0]*s+glMat[8]*c;
    glMat[0]=glMat[0]*c-glMat[8]*s;
    glMat[8]=a;

    a = glMat[1]*s+glMat[9]*c;
    glMat[1]=glMat[1]*c-glMat[9]*s;
    glMat[9]=a;

    a = glMat[2]*s+glMat[10]*c;
    glMat[2]=glMat[2]*c-glMat[10]*s;
    glMat[10]=a;
}

// adds rotation around the z axis to the model matrix
function zRotate(a)
{
    isGlMatNew = true;

    a = radians(a);
    let s = Math.sin(a);
    let c = Math.cos(a);

    a = glMat[0]*s+glMat[4]*c;
    glMat[0]=glMat[0]*c-glMat[4]*s;
    glMat[4]=a;

    a = glMat[1]*s+glMat[5]*c;
    glMat[1]=glMat[1]*c-glMat[5]*s;
    glMat[5]=a;

    a = glMat[2]*s+glMat[6]*c;
    glMat[2]=glMat[2]*c-glMat[6]*s;
    glMat[6]=a;
}

// if the model matrix is modified it sends it to the shaders
function useMatrix()
{
    if (isGlMatNew)
    {
        isGlMatNew = false;

        gl.uniformMatrix4fv(uModelMatrix, false, glMat);
    }
}

// adds the current model matrix to the matrix stack
function pushMatrix()
{
    let mat = new Float32Array(glMat.length);
    mat.set(glMat);
    glMatStack.push(mat);
}

// extracts the model matrix from the stack
// at a currently empty stack returns the identity matrix
function popMatrix()
{
    isGlMatNew = true;

    if (glMatStack.length > 0)
    {
        glMat = glMatStack.pop();
    }
    else { glMat = identity(); }
}

// clones a matrix by copying all of it's elements
function cloneMatrix(a)
{
    let b = new Float32Array(a.length);
    b.set(a);

    return b;
}

function loadTexture(url, blurry, post)
{
    let texture = gl.createTexture();
    let image = new Image();
    image.onload = function()
    {
        imageLoaded(texture,image, blurry);
        if (post) { post(texture); }
    };
    image.src = url;
    return texture;
}

function imageLoaded(texture, image, blurry = true)
{
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    if (blurry)
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    }
    else
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
}

function texIdentity()
{
    return new Float32Array([1,0,0, 0,1,0, 0,0,1]);
}

// matrix - 3D, vector - 2D
function texTranslate(matrix, vector)
{
    matrix[6] += matrix[0]*vector[0]+matrix[3]*vector[1];
    matrix[7] += matrix[1]*vector[0]+matrix[4]*vector[1];
}

function texScale(matrix,vector)
{
    matrix[0] *= vector[0];
    matrix[1] *= vector[0];

    matrix[3] *= vector[1];
    matrix[4] *= vector[1];
}

function texRotate(matrix, angle)
{
    angle = radians(angle);
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    angle = matrix[0]*s + matrix[3]*c;
    matrix[0] = matrix[0]*c - matrix[3]*s;
    matrix[3] = angle;

    angle = matrix[1]*s + matrix[4]*c;
    matrix[1] = matrix[1]*c - matrix[4]*s;
    matrix[4] = angle;
}

// returns an X coordinate of a mouse event
function getX(event)
{
    return event.clientX - gl.canvas.offsetLeft - gl.canvas.offsetWidth/2;
}

function getY(event)
{
    return -event.clientY + gl.canvas.offsetTop + gl.canvas.offsetHeight/2;
}

function now()
{
    return (new Date()).getTime()/1000;
}

function hashToRG(num)
{
    let r = Math.floor(num/255);
    let g = num%255;

    return [r,g];
}

function rgToHash(r,g)
{
    return r*255 + g;
}

function isPowerOfTwo(num)
{
    return ((num !== 0) && (num & (num-1)) === 0);
}