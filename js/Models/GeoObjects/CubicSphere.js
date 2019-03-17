CubicSphere = function(n, center, size)
{
    GeoObject.call(this, center, size, [0,0,0,0]);
    this.construct(n);

    this.texture = undefined;
    this.texMatrix = new Float32Array([1,0,0, 0,1,0, 0,0,1]);
};

CubicSphere.prototype = Object.create(GeoObject.prototype);
CubicSphere.prototype.constructor = CubicSphere;

CubicSphere.prototype.construct = function(n)
{
    this.n = n;
    // generating vertices
    this.triangles = [];
    this.textureCoords = [];
    // predefined cube vertices
    let cubeVertices = [
        [+0.5,-0.5,-0.5], [+0.5,+0.5,-0.5],
        [-0.5,+0.5,-0.5], [-0.5,-0.5,-0.5],
        [+0.5,-0.5,+0.5], [+0.5,+0.5,+0.5],
        [-0.5,+0.5,+0.5], [-0.5,-0.5,+0.5]
    ];

    this.triangulize(cubeVertices[0], cubeVertices[1], cubeVertices[4], this.n, 1, 2);    // front
    this.triangulize(cubeVertices[4], cubeVertices[1], cubeVertices[5], this.n, 1, 2);    // front
    this.triangulize(cubeVertices[6], cubeVertices[2], cubeVertices[7], this.n, 1, 2);    // back
    this.triangulize(cubeVertices[7], cubeVertices[2], cubeVertices[3], this.n, 1, 2);    // back

    this.triangulize(cubeVertices[5], cubeVertices[1], cubeVertices[6], this.n, 0, 2);    // right
    this.triangulize(cubeVertices[6], cubeVertices[1], cubeVertices[2], this.n, 0, 2);    // right
    this.triangulize(cubeVertices[4], cubeVertices[7], cubeVertices[0], this.n, 0, 2);    // left
    this.triangulize(cubeVertices[0], cubeVertices[7], cubeVertices[3], this.n, 0, 2);    // left

    this.triangulize(cubeVertices[4], cubeVertices[5], cubeVertices[7], this.n, 0, 1);    // upper
    this.triangulize(cubeVertices[7], cubeVertices[5], cubeVertices[6], this.n, 0, 1);    // upper
    this.triangulize(cubeVertices[0], cubeVertices[3], cubeVertices[1], this.n, 0, 1);    // lower
    this.triangulize(cubeVertices[1], cubeVertices[3], cubeVertices[2], this.n, 0, 1);    // lower

    // tessellation
    this.data = this.tessellate();
    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.DYNAMIC_DRAW);

    // wires
    this.wires = this.wire();
    this.wireBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.wires), gl.DYNAMIC_DRAW);
};

CubicSphere.prototype.draw = function ()
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
            gl.polygonOffset(0,2);
            gl.drawArrays(gl.TRIANGLES, 0, 3*this.triangles.length);
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

CubicSphere.prototype.drawWires = function()
{
    if (typeof this.n !== 'undefined')
    {
        this.drawWiresUtil(gl.LINES);
    }
};

CubicSphere.prototype.tessellate = function()
{
    let data = [];

    for (let i = 0; i < this.triangles.length; ++i)
    {
        for (let j = 0; j < 3; ++j)
        {
            for (let k = 0; k < 3; ++k) { data.push(this.triangles[i][j][k]);}
            let p0 = this.triangles[i][j];
            let p1 = this.triangles[i][(j-1 >= 0) ? (j-1) : (j+2)];
            let p2 = this.triangles[i][(j+1)%3];

            let normal = unitVector(vectorProduct(vectorPoints(p1, p0), vectorPoints(p1, p2)));
            // there's a dependency whether it is odd or even
            for (let k = 0; k < 3; ++k) { data.push(normal[k]*((this.n%2) ? (1) : (-1))); }

            // front and back
            data.push(this.textureCoords[i][j][0], this.textureCoords[i][j][1]);
        }
    }

    return data;
};

CubicSphere.prototype.triangulize = function(p1, p2, p3, level, t1, t2)
{
    if (level > 0)
    {
        let p12 = this.getMiddlePoint(p1,p2);
        let p13 = this.getMiddlePoint(p1,p3);
        let p23 = this.getMiddlePoint(p2,p3);
        --level;

        this.triangulize(p1,p13,p12,level, t1, t2);
        this.triangulize(p12,p23,p2,level, t1, t2);
        this.triangulize(p13,p3,p23,level, t1, t2);
        this.triangulize(p12,p13,p23,level, t1, t2);
    }
    else
    {
        this.textureCoords.push([
            [p1[t1]+0.5, p1[t2]+0.5],
            [p2[t1]+0.5, p2[t2]+0.5],
            [p3[t1]+0.5, p3[t2]+0.5]
        ]);

        p1 = unitVector(p1);
        p2 = unitVector(p2);
        p3 = unitVector(p3);

        this.triangles.push([p1, p2, p3]);
    }
};

CubicSphere.prototype.getMiddlePoint = function(p, q)
{
    return [(p[0]+q[0])/2, (p[1]+q[1])/2, (p[2]+q[2])/2];
};

CubicSphere.prototype.wire = function()
{
    let wires = [];

    for (let i = 0; i < this.triangles.length; ++i)
    {
        for (let j = 0; j < 3; ++j) { wires.push([this.triangles[i][0][j]]); }
        for (let j = 0; j < 3; ++j) { wires.push([this.triangles[i][1][j]]); }

        for (let j = 0; j < 3; ++j) { wires.push([this.triangles[i][1][j]]); }
        for (let j = 0; j < 3; ++j) { wires.push([this.triangles[i][2][j]]); }

        for (let j = 0; j < 3; ++j) { wires.push([this.triangles[i][2][j]]); }
        for (let j = 0; j < 3; ++j) { wires.push([this.triangles[i][0][j]]); }
    }

    return wires;
};

// todo: test
CubicSphere.prototype.updateBuffers = function()
{
    // tessellation
    this.data = this.tessellate();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.data));

    // wires
    this.wires = this.wire();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.wires));
};