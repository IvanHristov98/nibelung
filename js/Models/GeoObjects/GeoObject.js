GeoObject = function(center, size, rot)
{
    this.name = undefined;
    this.visible = true;

    this.center = center;
    this.size = size;
    this.rot = rot;
    // colors
    this.color = [0.3, 0.3, 0.3];
    this.wireColor = [1,0.5,0];
    this.vertexColor = [0.8,1,0];
    this.texKey = undefined;
    this.texKeyHeight = undefined;
    this.texHeight = undefined;
    this.alphaColor = [1,0,0];
};

GeoObject.prototype.position = function()
{
    if (typeof this.center !== 'undefined')
    {
        translate(this.center);
    }
};

GeoObject.prototype.scale = function()
{
    if(typeof this.size !== 'undefined')
    {
        scale(this.size);
    }
};

GeoObject.prototype.rotate = function()
{
    if (typeof this.rot !== 'undefined')
    {
        if (this.rot[0]) { zRotate(this.rot[0]); }
        if (this.rot[1]) { yRotate(this.rot[1]); }
        if (this.rot[2]) { xRotate(this.rot[2]); }
        if (this.rot[3]) { zRotate(this.rot[3]); }
    }
};

GeoObject.prototype.verticize = function()
{
    let vertices = [];

    for (let i = 0; i < this.vertices.length; ++i)
    {
        // vertex locations
        for (let j = 0; j < 3; ++j) { vertices.push(this.vertices[i][j]); }

        // color identificators
        let colorID = hashToRG(i);
        if (!objectSelectionController.selectedCodes[i])
        {
            vertices.push(colorID[0]/255);
            vertices.push(colorID[1]/255);
            vertices.push(0);
        }
        else { vertices.push(1, 0, 0.8); }
    }

    return vertices;
};

GeoObject.prototype.drawVerticesUtil = function(selectionMode = false)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuf);
    let selectionMap = objectSelectionController.selectedCodes;

    if (!selectionMode && (Object.entries(selectionMap).length === 0 && selectionMap.constructor === Object))
    {
        gl.vertexAttrib3fv(aColor, this.vertexColor);
    }

    gl.enableVertexAttribArray(aXYZ);
    gl.vertexAttribPointer(aXYZ, 3, gl.FLOAT, false, 6*FLOAT_SIZE, 0*FLOAT_SIZE);

    if (selectionMode || (Object.entries(selectionMap).length && selectionMap.constructor === Object))
    {
        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6*FLOAT_SIZE, 3*FLOAT_SIZE);
    }

    pushMatrix();
        this.position();
        this.scale();
        this.rotate();

        useMatrix();
        gl.drawArrays(gl.POINTS, 0, this.vertices.length);
    popMatrix();

    gl.disableVertexAttribArray(aXYZ);

    if (selectionMode || (Object.entries(selectionMap).length && selectionMap.constructor === Object))
    {
        gl.disableVertexAttribArray(aColor);
    }
};

GeoObject.prototype.drawWiresUtil = function(drawingMode)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.vertexAttrib3fv(aColor, this.wireColor);

    gl.enableVertexAttribArray(aXYZ);
    gl.vertexAttribPointer(aXYZ, 3, gl.FLOAT, false, 3*FLOAT_SIZE, 0*FLOAT_SIZE);

    pushMatrix();
    this.position();
    this.scale();
    this.rotate();

    useMatrix();
    gl.drawArrays(drawingMode, 0, this.wires.length/3);
    popMatrix();

    gl.disableVertexAttribArray(aXYZ);
};

GeoObject.prototype.draw = function()
{};

GeoObject.prototype.drawWires = function()
{};

GeoObject.prototype.drawVertices = function()
{};

GeoObject.prototype.updateBuffers = function()
{};