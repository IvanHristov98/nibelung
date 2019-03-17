Cuboid = function(center, size)
{
    GeoObject.call(this, center, size, [0,0,0,0]);

    this.vertices = [
        [+0.5,-0.5,-0.5], [+0.5,+0.5,-0.5],
        [-0.5,+0.5,-0.5], [-0.5,-0.5,-0.5],
        [+0.5,-0.5,+0.5], [+0.5,+0.5,+0.5],
        [-0.5,+0.5,+0.5], [-0.5,-0.5,+0.5]
    ];
    this.textureCoords = [[0,0], [0,1], [1,0], [1,1]];

    this.map = [
        [0,1,4], [4,1,5],   // front
        [6,2,7], [7,2,3],   // back
        [5,1,6], [6,1,2],   // right
        [4,7,0], [0,7,3],   // left
        [4,5,7], [7,5,6],   // upper
        [0,3,1], [1,3,2]    // lower
    ];

    this.wireMap = [
        0,1,2,3,0,  // bottom
        4,5,1,5,    // right
        6,2,6,      // front
        7,3,7,      // left
        4           //back
    ];

    this.textureMap = [
        [0,2,1], [1,2,3], // front
        [1,0,3], [3,0,2], // back
        [1,0,3], [3,0,2], // right
        [3,1,2], [2,1,0], // left
        [0,2,1], [1,2,3], // upper
        [0,1,2], [2,1,3], // lower
    ];

    this.construct();

    // todo: original
    //this.texture = undefined;
    this.texture = undefined;
    this.texMatrix = new Float32Array([1,0,0, 0,1,0, 0,0,1]);
};

Cuboid.prototype = Object.create(GeoObject.prototype);
Cuboid.prototype.constructor = Cuboid;

Cuboid.prototype.construct = function()
{
    // tessellation buffer
    this.data = this.tessellate();
    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.DYNAMIC_DRAW);

    // wireframe buffer
    this.wires = this.wire();
    this.wireBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.wires), gl.DYNAMIC_DRAW);

    // points buffer
    this.vertexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verticize()), gl.DYNAMIC_DRAW);
};

Cuboid.prototype.draw = function()
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
        // z-fighting
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(0,2);
        gl.drawArrays(gl.TRIANGLES, 0, this.data.length/8);
        gl.disable(gl.POLYGON_OFFSET_FILL);
    popMatrix();

    gl.disableVertexAttribArray(aXYZ);
    gl.disableVertexAttribArray(aNormal);

    if (typeof this.texture !== 'undefined')
    {
        if (gl.isTexture(this.texture)) { gl.disableVertexAttribArray(aST); }
    }
};

Cuboid.prototype.drawWires = function()
{
    this.drawWiresUtil(gl.LINE_STRIP);
};

Cuboid.prototype.drawVertices = function(selectionMode = false)
{
    this.drawVerticesUtil(selectionMode);
};

Cuboid.prototype.tessellate = function ()
{
    let data = [];

    for (let i = 0; i < this.map.length; ++i)
    {
        for (let j = 0; j < 3; ++j)
        {
            // vertices
            data.push(this.vertices[this.map[i][j]][0], this.vertices[this.map[i][j]][1], this.vertices[this.map[i][j]][2]);

            // normals
            let p0 = this.vertices[this.map[i][j]];
            let p1 = this.vertices[this.map[i][(j-1 >= 0) ? (j-1) : (j+2)]];
            let p2 = this.vertices[this.map[i][(j+1)%3]];

            let normal = unitVector(vectorProduct(vectorPoints(p1,p0), vectorPoints(p2,p0)));
            data.push(normal[0], normal[1], normal[2]);

            // texture coords
            data.push(this.textureCoords[this.textureMap[i][j]][0], this.textureCoords[this.textureMap[i][j]][1]);
        }
    }

    return data;
};

Cuboid.prototype.wire = function()
{
    let wires = [];

    for (let i = 0; i < this.wireMap.length; ++i)
    {
        wires.push(
            this.vertices[this.wireMap[i]][0],
            this.vertices[this.wireMap[i]][1],
            this.vertices[this.wireMap[i]][2]
        );
    }

    return wires;
};

Cuboid.prototype.updateBuffers = function()
{
    // updating polygons
    this.data = this.tessellate();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.data));

    // updating wireframe
    this.wires = this.wire();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.wires));

    // updating vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.verticize()));
};