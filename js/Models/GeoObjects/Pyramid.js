Pyramid = function(n, center, size)
{
    GeoObject.call(this, center, size, [0,0,0,0]);

    this.construct(n);

    // textures
    this.texture = undefined;
    this.texMatrix = new Float32Array([1,0,0, 0,1,0, 0,0,1]);
    // a wonderful trick for seamless textures
    texScale(this.texMatrix, [2,2]);
};

Pyramid.prototype = Object.create(GeoObject.prototype);
Pyramid.prototype.constructor = Pyramid;

Pyramid.prototype.construct = function(n)
{
    this.n = n;

    // generating vertices
    let angle = 0;
    let dAngle = 2*Math.PI/this.n;
    this.vertices = [];
    this.vertices.push([0,0,1]);
    this.vertices.push([0,0,0]);

    for (let i = 0; i < this.n; ++i)
    {
        this.vertices.push([Math.cos(angle), Math.sin(angle), 0]);

        angle += dAngle;
    }

    // tessellation
    this.data = this.tessellate();
    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.DYNAMIC_DRAW);

    // wireframe
    this.wires = this.wire();
    this.wireBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.wires), gl.DYNAMIC_DRAW);

    // vertices
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verticize()), gl.DYNAMIC_DRAW);
};

Pyramid.prototype.draw = function()
{
    if (typeof this.n !== 'undefined')
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
        gl.vertexAttrib3fv(aColor, this.color);
        gl.uniform3fv(uAlphaColor, this.alphaColor);

        gl.enableVertexAttribArray(aXYZ);
        gl.vertexAttribPointer(aXYZ, 3, gl.FLOAT, false, 8*FLOAT_SIZE, 0*FLOAT_SIZE);

        gl.enableVertexAttribArray(aNormal);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 8*FLOAT_SIZE, 3*FLOAT_SIZE);
        gl.uniformMatrix3fv(uTexMatrix, false, this.texMatrix);

        if (typeof this.texHeight !== 'undefined')
        {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.texHeight);
            gl.activeTexture(gl.TEXTURE0);

            gl.uniform1i(uUseAlphaMap, 1);
        }
        else { gl.uniform1i(uUseAlphaMap, 0); }

        if (typeof this.texture !== 'undefined' || typeof this.texHeight !== 'undefined')
        {
            if (gl.isTexture(this.texture))
            {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.uniform1i(uUseTex, 1);
            }

            gl.enableVertexAttribArray(aST);
            gl.vertexAttribPointer(aST,2,gl.FLOAT,false, 8*FLOAT_SIZE,6*FLOAT_SIZE);
        }
        else { gl.uniform1i(uUseTex, 0); }

        pushMatrix();
            this.position();
            this.scale();
            this.rotate();

            useMatrix();
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(0, 2);
            gl.drawArrays(gl.TRIANGLES, 0, this.n*3);
            gl.drawArrays(gl.TRIANGLES, this.n*3, this.n*3);
            gl.disable(gl.POLYGON_OFFSET_FILL);
        popMatrix();

        gl.disableVertexAttribArray(aXYZ);
        gl.disableVertexAttribArray(aNormal);

        if (typeof this.texture !== 'undefined')
        {
            if (gl.isTexture(this.texture)) { gl.disableVertexAttribArray(aST); }
        }
    }
};

Pyramid.prototype.drawWires = function()
{
    if (typeof this.n !== 'undefined')
    {
        this.drawWiresUtil(gl.LINE_STRIP);
    }
};

// it uses a bit more specific implementation
Pyramid.prototype.drawVertices = function(selectionMode = false)
{
    if (typeof this.n !== 'undefined')
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
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
    }
};

Pyramid.prototype.tessellate = function()
{
    let data = [];

    // generating sides
    let top = this.vertices[0];

    for (let i = 0; i < this.n; ++i)
    {
        let p0 = this.vertices[i + 2];
        let p1 = this.vertices[(i+1)%this.n + 2];

        // a single side has the same normal vector
        let normal = unitVector(vectorProduct(vectorPoints(top, p0), vectorPoints(p1, p0)));

        // inserting point 0
        data.push(p0[0], p0[1], p0[2]);
        data.push(normal[0], normal[1], normal[2]);
        data.push(i/this.n, 0);

        // inserting point 1
        data.push(p1[0], p1[1], p1[2]);
        data.push(normal[0], normal[1], normal[2]);
        data.push((i+1)/this.n, 0);

        // inserting top
        data.push(top[0], top[1], top[2]);
        data.push(normal[0], normal[1], normal[2]);
        data.push(0.5, 0.5);
    }

    // generating bottom
    let bottom = this.vertices[1];

    for (let i = 0; i < this.n; ++i)
    {
        let p0 = this.vertices[i + 2];
        let p1 = this.vertices[(i+1)%this.n + 2];

        let normal = unitVector(vectorProduct(vectorPoints(p1, p0), vectorPoints(bottom, p0)));

        // inserting point 0
        data.push(p0[0], p0[1], p0[2]);
        data.push(normal[0], normal[1], normal[2]);
        data.push(i/this.n, 0);

        // inserting point 1
        data.push(p1[0], p1[1], p1[2]);
        data.push(normal[0], normal[1], normal[2]);
        data.push((i+1)/this.n, 0);

        // inserting top
        data.push(bottom[0], bottom[1], bottom[2]);
        data.push(normal[0], normal[1], normal[2]);
        data.push(0.5, 0.5);
    }

    return data;
};

Pyramid.prototype.wire = function()
{
    let wires = [];

    let top = this.vertices[0];
    let bottom = this.vertices[1];

    for (let i = 0; i < this.n; ++i)
    {
        for (let j = 0; j < 3; ++j) { wires.push(this.vertices[i + 2][j]); }
        for (let j = 0; j < 3; ++j) { wires.push(this.vertices[(i+1)%this.n + 2][j]); }

        // pyramid top
        for (let j = 0; j < 3; ++j) { wires.push(top[j]); }
    }

    for (let i = 0; i < this.n; ++i)
    {
        for (let j = 0; j < 3; ++j) { wires.push(this.vertices[i + 2][j]); }
        for (let j = 0; j < 3; ++j) { wires.push(this.vertices[(i+1)%this.n + 2][j]); }
        for (let j = 0; j < 3; ++j) { wires.push(bottom[j]); }
    }

    return wires;
};

Pyramid.prototype.updateBuffers = function()
{
    // tessellation
    this.data = this.tessellate();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.data));

    // wireframe
    this.wires = this.wire();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.wires));

    // vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.verticize()));
};