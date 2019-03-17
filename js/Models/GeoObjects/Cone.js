Cone = function(n, center, size)
{
    GeoObject.call(this, center, size, [0,0,0,0]);
    this.construct(n);

    // textures
    this.texture = undefined;
    this.texMatrix = new Float32Array([1,0,0, 0,1,0, 0,0,1]);
    texScale(this.texMatrix, [2,2]);
};

Cone.prototype = Object.create(GeoObject.prototype);
Cone.prototype.constructor = Cone;

Cone.prototype.construct = function(n)
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
    this.vertexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verticize()), gl.DYNAMIC_DRAW);
};

Cone.prototype.draw = function()
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
            gl.drawArrays(gl.TRIANGLES, 0, 3*this.n);
            gl.drawArrays(gl.TRIANGLE_FAN, 3*this.n, this.n + 2);
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

Cone.prototype.drawWires = function()
{
    if (typeof this.n !== 'undefined')
    {
        this.drawWiresUtil(gl.LINE_STRIP);
    }
};

Cone.prototype.drawVertices = function(selectionMode = false)
{
    if (typeof this.n !== 'undefined')
    {
        this.drawVerticesUtil(selectionMode);
    }
};

Cone.prototype.tessellate = function()
{
    let data = [];

    let top = this.vertices[0];
    let normals = [];
    normals.push([0,0,0]);
    this.calcFanNormals(normals, 0);

    for (let i = 0; i < this.n; ++i)
    {
        let p0 = this.vertices[i+2];
        let p1 = this.vertices[(i+1)%this.n + 2];

        for (let j = 0; j < 3; j++) { data.push(p0[j]); }
        for (let j = 0; j < 3; j++) { data.push(normals[i+1][j]); }
        data.push(i/this.n, 0);

        for (let j = 0; j < 3; j++) { data.push(p1[j]); }
        for (let j = 0; j < 3; j++) { data.push(normals[(i+1)%this.n+1][j]); }
        data.push((i+1)/this.n, 0);

        for (let j = 0; j < 3; j++) { data.push(top[j]); }
        for (let j = 0; j < 3; j++) { data.push(-normals[0][j]); }
        data.push(0.5, 0.5);
    }

    normals.length = 0;
    normals.push([0,0,0]);
    let bottom = this.vertices[1];
    this.calcFanNormals(normals, 1);

    data.push(bottom[0], bottom[1], bottom[2], normals[0][0], normals[0][1], normals[0][2], 0.5, 0.5);

    for (let i = 0; i <= this.n; ++i)
    {
        for (let j = 0; j < 3; ++j) { data.push(this.vertices[i%this.n+2][j]); }
        for (let j = 0; j < 3; ++j) { data.push(-normals[(i)%this.n+1][j]); }
        data.push(i/this.n, 0);
    }

    return data;
};

Cone.prototype.calcFanNormals = function(normals, centerIndex)
{
    for (let i = 0; i < this.n; ++i)
    {
        let center = this.vertices[centerIndex];
        let p0 = this.vertices[i + 2];
        let p1 = this.vertices[(i+1)%this.n + 2];

        // calculating center normal
        let normal = unitVector(vectorProduct(p0, center), vectorProduct(p1, center));
        for (let j = 0; j < 3; ++j) { normals[0][j] += normal[j]/this.n; }

        normals.push(unitVector(vectorProduct(vectorPoints(center, p0), vectorPoints(p1, p0))));
    }

    //normals[0] = unitVector(normals[0]);
    normals[0] = [0,0,1];
};

Cone.prototype.wire = function()
{
    let wires = [];

    // sides
    for (let i = 0; i < this.n; ++i)
    {
        for (let j = 0; j < 3; ++j) { wires.push(this.vertices[i+2][j]); }
        for (let j = 0; j < 3; ++j) { wires.push(this.vertices[(i+1)%this.n + 2][j]); }

        // cone top
        for (let j = 0; j < 3; ++j) { wires.push(this.vertices[0][j]); }
    }

    // foundation
    for (let i = 0; i < this.n; ++i)
    {
        for (let j = 0; j < 3; ++j) { wires.push(this.vertices[i+2][j]); }
        for (let j = 0; j < 3; ++j) { wires.push(this.vertices[(i+1)%this.n + 2][j]); }

        // cone bottom
        for (let j = 0; j < 3; ++j) { wires.push(this.vertices[1][j]); }
    }

    return wires;
};

Cone.prototype.updateBuffers = function()
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
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.verticize()));
};