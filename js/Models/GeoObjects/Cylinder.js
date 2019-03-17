Cylinder = function(n, center, size)
{
    GeoObject.call(this, center, size, [0,0,0,0]);

    this.construct(n);

    // texture
    this.texture = undefined;
    this.texMatrix = new Float32Array([1,0,0, 0,1,0, 0,0,1]);
    texScale(this.texMatrix, [2,2]);
};

Cylinder.prototype = Object.create(GeoObject.prototype);
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.construct = function(n)
{
    this.n = n;

    let angle = 0;
    let distAngle = 2*Math.PI/this.n;
    this.vertices = [];

    // generating vertices upper part
    for (let i = 0; i < this.n; ++i)
    {
        this.vertices.push([Math.cos(angle), Math.sin(angle), 1]);
        angle += distAngle;
    }

    // lower part
    angle = 0;

    for (let i = 0; i < this.n; ++i)
    {
        this.vertices.push([Math.cos(angle), Math.sin(angle), 0]);
        angle += distAngle;
    }

    //pushing upper and lower foundations center points
    this.vertices.push([0,0,1]);
    this.vertices.push([0,0,0]);

    // tessellation buffer and data stuff
    this.data = this.tessellateSides();
    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.DYNAMIC_DRAW);

    // wire buffer
    this.wires = this.wire();
    this.wireBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.wires), gl.DYNAMIC_DRAW);

    // vertex buffer
    this.vertexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verticize()), gl.DYNAMIC_DRAW);
};

Cylinder.prototype.draw = function()
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
        gl.polygonOffset(0,2);
        gl.drawArrays(gl.TRIANGLES, 0, 6*this.n);
        gl.drawArrays(gl.TRIANGLE_FAN, 6*this.n, this.n+2);
        gl.drawArrays(gl.TRIANGLE_FAN, 7*this.n+2, this.n+2);
        gl.disable(gl.POLYGON_OFFSET_FILL);
    popMatrix();

    gl.disableVertexAttribArray(aXYZ);
    gl.disableVertexAttribArray(aNormal);

    if (typeof this.texture !== 'undefined')
    {
        if (gl.isTexture(this.texture)) { gl.disableVertexAttribArray(aST); }
    }
};

Cylinder.prototype.drawWires = function()
{
    this.drawWiresUtil(gl.LINE_STRIP);
};

Cylinder.prototype.drawVertices = function(selectionMode = false)
{
    this.drawVerticesUtil(selectionMode);
};

Cylinder.prototype.tessellateSides = function(eps = 0.01)
{
    // array to fill with data
    let data = [];
    let normals = [];

    // calculating top side vertices's normals
    for (let i = 0; i < this.n; ++i)
    {
        let p0 = this.vertices[i];
        let p1 = this.vertices[(i + 1)%this.n];
        let p2 = this.vertices[i+this.n];

        //todo: fix normal with eps
        let normal = unitVector(vectorProduct(vectorPoints(p1,p0), vectorPoints(p2,p0)));
        normals.push(normal);
    }

    // calculating bottom side vertices's normals
    for (let i = 0; i < this.n; ++i)
    {
        let p0 = this.vertices[i+this.n];
        let p1 = this.vertices[(i + 1)%this.n + this.n];
        let p2 = this.vertices[i];

        let normal = unitVector(vectorProduct(vectorPoints(p2,p0), vectorPoints(p1,p0)));
        normals.push(normal);
    }

    // sides
    for (let i = 0; i < this.n; ++i)
    {
        // triangle 1
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[i][j]); }
        for (let j = 0; j < 3; ++j) { data.push(normals[i][j]); }
        data.push(i/this.n, 0);

        for (let j = 0; j < 3; ++j) { data.push(this.vertices[(i + 1)%this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(normals[(i + 1)%this.n][j]); }
        data.push((i+1)/this.n, 0);

        for (let j = 0; j < 3; ++j) { data.push(this.vertices[i+this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(normals[i+this.n][j]); }
        data.push(i/this.n, 1);

        // triangle 2
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[i+this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(normals[i+this.n][j]); }
        data.push(i/this.n, 1);

        for (let j = 0; j < 3; ++j) { data.push(this.vertices[(i + 1)%this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(normals[(i + 1)%this.n][j]); }
        data.push((i+1)/this.n, 0);

        for (let j = 0; j < 3; ++j) { data.push(this.vertices[(i + 1)%this.n + this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(normals[(i + 1)%this.n + this.n][j]); }
        data.push((i+1)/this.n, 1);
    }

    // top foundation
    normals.push([0,0,0]);
    this.calcFanNormals(normals, this.n*2, 0);

    // center
    for (let j = 0; j < 3; ++j) { data.push(this.vertices[this.n*2][j]); }
    for (let j = 0; j < 3; ++j) { data.push(-normals[this.n*2][j]); }
    data.push(0.5, 0.5);

    for (let i = 0; i <= this.n; ++i)
    {
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[i%this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(normals[i%this.n][j]); }
        data.push(i/this.n, 0);
    }

    // bottom foundation
    normals.push([0,0,0]);
    this.calcFanNormals(normals, this.n*2+1, this.n);

    for (let j = 0; j < 3; ++j) { data.push(this.vertices[this.n*2+1][j]); }
    for (let j = 0; j < 3; ++j) { data.push(normals[this.n*2+1][j]); }
    data.push(0.5, 0.5);

    for (let i = 0; i <= this.n; ++i)
    {
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[i%this.n + this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(-normals[i%this.n + this.n][j]); }
        data.push(i/this.n, 0);
    }

    return data;
};

Cylinder.prototype.calcFanNormals = function(normals, centerIndex, offset)
{
    for (let i = 0; i < this.n; ++i)
    {
        let center = this.vertices[centerIndex];
        let p0 = this.vertices[i + offset];
        let p1 = this.vertices[(i + 1)%this.n + offset];

        // calculating center normal
        let normal = unitVector(vectorProduct(vectorPoints(p0, center), vectorPoints(p1, center)));
        for (let j = 0; j < 3; ++j) { normals[centerIndex][j] += normal[j]/this.n; }

        // changing vertex normals
        normals[i+offset] = unitVector(vectorProduct(vectorPoints(center, p0), vectorPoints(p1, p0)));
    }

    normals[centerIndex] = unitVector(normals[centerIndex]);
};

Cylinder.prototype.wire = function()
{
    let data = [];

    // sides
    for (let i = 0; i < this.n; ++i)
    {
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[(i+1)%this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[i][j]); }
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[i+this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[(i+1)%this.n + this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[(i+1)%this.n][j]); }
    }

    // upper foundation
    for (let i = 0; i < this.n; ++i)
    {
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[i][j]); }
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[this.n*2][j]); }
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[(i+1)%this.n][j]); }
    }

    // lower foundation
    for (let i = 0; i < this.n; ++i)
    {
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[i+this.n][j]); }
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[this.n*2+1][j]); }
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[(i+1)%this.n + this.n][j]); }
    }

    return data;
};

Cylinder.prototype.updateBuffers = function()
{
    // tessellation
    this.data = this.tessellateSides();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.data));

    // wireframe
    this.wires = this.wire();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.wires));

    // vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.verticize()));
};