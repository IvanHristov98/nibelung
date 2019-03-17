let gradientVectors = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [Math.sqrt(2),0], [-Math.sqrt(2),0],[0,Math.sqrt(2)], [0,-Math.sqrt(2)]
];

// Grid constructor
PerlinGrid = function(center, size, rows, cols, color)
{
    // Array to hold gradients
    this.gradients = [];

    // Generating gradient vectors for each point
    for (let i = 0; i <= rows; ++i)
    {
        for (let j = 0; j <= cols; ++j)
        {
            this.gradients.push(Math.floor(Math.random()*gradientVectors.length));
        }
    }

    // Array to hold unit squares
    this.units = [];

    // Adding unit squares
    for (let i = 0; i < rows; ++i)
    {
        for (let j = 0; j < cols; ++j)
        {
            this.units.push(new UnitSquare([j - cols/2,i - rows/2,0], 1));
            this.units[this.units.length-1].gradients = [
                this.gradients[i*(rows+1)+j],			// Bottom-Left
                this.gradients[i*(rows+1)+(j+1)],		// Bottom-Right
                this.gradients[(i+1)*(rows+1)+j],		// Top-Left
                this.gradients[(i+1)*(rows+1)+(j+1)]	// Top-Right
            ];

            this.units[this.units.length-1].color = color;
        }
    }

    // saving some local variables
    this.center = center;
    this.size = size;
};

// Drawing method
PerlinGrid.prototype.draw = function()
{
    pushMatrix();
    // Affine transformations
    translate(this.center);
    scale(this.size);

    // Drawing square units
    for (let i = 0; i < this.units.length; ++i) { this.units[i].draw(); }
    popMatrix();
};

// Unit Square constructor
UnitSquare = function(center, size)
{
    // Vertices of the square
    this.data = [
        -0.5,-0.5,0,
        +0.5,-0.5,0,
        -0.5,+0.5,0,
        +0.5,+0.5,0,
    ];

    // Default gradient vectors
    this.gradients = [0, 1, 2, 3];

    // Creating a buffer and binding vertex data to it
    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.data), gl.STATIC_DRAW);

    // Saving some local fields
    this.center = center;
    this.size = size;
    this.color = [1,1,1];
};

// Unit square draw method
UnitSquare.prototype.draw = function()
{
    // Buffer work
    gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
    gl.enableVertexAttribArray(aXYZ);
    gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,3*FLOAT_SIZE,0);
    gl.vertexAttrib3fv(aColor,this.color);

    // Assigning gradients to the shader
    gl.uniform2fv(uGradientBL, gradientVectors[this.gradients[0]]);
    gl.uniform2fv(uGradientBR, gradientVectors[this.gradients[1]]);
    gl.uniform2fv(uGradientTL, gradientVectors[this.gradients[2]]);
    gl.uniform2fv(uGradientTR, gradientVectors[this.gradients[3]]);

    // Adding the surrounding points of the block from the grid
    gl.uniform2f(uGridPointBL, this.data[0], this.data[1]);
    gl.uniform2f(uGridPointBR, this.data[3], this.data[4]);
    gl.uniform2f(uGridPointTL, this.data[6], this.data[7]);
    gl.uniform2f(uGridPointTR, this.data[9], this.data[10]);

    // Setting the vertical offset of noise surface
    gl.uniform1f(uGroundOffset, 0.6);
    // Setting the max height limit of the noise surface
    gl.uniform1f(uMaxNoiseHeight, 1.0);

    // Drawing
    pushMatrix();
    translate(this.center);
    scale([this.size,this.size,this.size]);
    useMatrix();
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    popMatrix();
};