// numGrids - int, center - 3d vector, size - float
Grid = function(numGrids, center, size)
{
    if (typeof gl === 'undefined') { return; }

    this.numGrids = numGrids;
    this.gridCheckbox = document.getElementById("grid-checkbox");

    this.data = [];

    // horizontals
    for (let i = 0; i < this.numGrids; ++i)
    {
        for (let j = 0; j < this.numGrids+1; ++j) if (j - this.numGrids/2 !== 0)
        {
            this.data.push(
                i - this.numGrids/2, j - this.numGrids/2, 0,
                i + 1 - this.numGrids/2, j - this.numGrids/2, 0,
            );
        }
    }

    // verticals
    for (let i = 0; i < this.numGrids+1; ++i) if (i - this.numGrids/2 !== 0)
    {
        for (let j = 0; j < this.numGrids; ++j)
        {
            this.data.push(
                // verticals
                i - this.numGrids/2, j - this.numGrids/2, 0,
                i - this.numGrids/2, j + 1 - this.numGrids/2, 0,
            );
        }
    }

    // inserting the two marking lines
    this.data.push(
        -this.numGrids/2, 0, 0,
        +this.numGrids/2, 0, 0,
        0, -this.numGrids/2, 0,
        0, +this.numGrids/2, 0,
        );

    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.STATIC_DRAW);

    this.gridColor = [0.3, 0.3, 0.3];
    this.markingColor = [0,0,0];
    this.center = center;
    this.size = size;
};

Grid.prototype.draw = function()
{
    if (!this.gridCheckbox.checked) { return; }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);

    pushMatrix();
        translate(this.center);
        scale([this.size, this.size, this.size]);

        gl.enableVertexAttribArray(aXYZ);
        gl.vertexAttribPointer(aXYZ, 3, gl.FLOAT, false, 3*FLOAT_SIZE, 0*FLOAT_SIZE);

        useMatrix();

        gl.vertexAttrib3fv(aColor, this.markingColor);
        gl.drawArrays(gl.LINES, this.data.length/3 - 4, 4);

        gl.vertexAttrib3fv(aColor, this.gridColor);
        gl.drawArrays(gl.LINES, 0, this.data.length/3-4);
    popMatrix();
};