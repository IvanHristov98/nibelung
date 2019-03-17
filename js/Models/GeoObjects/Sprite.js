Sprite = function(center, size)
{
    GeoObject.call(this, center, size, [0,0,0,0]);

    this.vertices = [
        [-0.5,0,0.5], [-0.5,0,-0.5],    // left
        [0.5,0,0.5], [0.5,0,-0.5]     // right
    ];
    this.texCoords = [[0,0], [1,0], [0,1], [1,1]];

    this.vertexMap = [[0,1,2],[1,3,2]];
    this.wireMap = [0,1,3,2,0];
    this.texMap = [[2,0,3],[0,1,3]];

    this.construct();

    this.texture = undefined;
    this.texMatrix = new Float32Array([1,0,0, 0,1,0, 0,0,1]);
};

Sprite.prototype = Object.create(GeoObject.prototype);
Sprite.prototype.constructor = Sprite;

Sprite.prototype.construct =  function()
{
    this.data = this.tessellate();
    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data),  gl.DYNAMIC_DRAW);

    this.wires = this.wire();
    this.wireBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.wires), gl.DYNAMIC_DRAW);

    this.vertexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verticize()), gl.DYNAMIC_DRAW);
};

Sprite.prototype.draw = function()
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
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.disable(gl.POLYGON_OFFSET_FILL);
    popMatrix();

    gl.disableVertexAttribArray(aXYZ);
    gl.disableVertexAttribArray(aNormal);

    if (typeof this.texture !== 'undefined')
    {
        if (gl.isTexture(this.texture)) { gl.disableVertexAttribArray(aST); }
    }
};

//todo: the rest of it
Sprite.prototype.drawWires = function()
{
    this.drawWiresUtil(gl.LINE_STRIP);
};

Sprite.prototype.drawVertices = function(selectionMode = false)
{
    this.drawVerticesUtil(selectionMode);
};

Sprite.prototype.tessellate = function()
{
    let data = [];

    // for every triangle
    for (let i = 0; i < 2; ++i)
    {
        let vm = this.vertexMap[i];
        let tm = this.texMap[i];
        let normal = vectorProduct(
            vectorPoints(this.vertices[vm[1]], this.vertices[vm[0]]),
            vectorPoints(this.vertices[vm[2]], this.vertices[vm[0]])
        );

        // for every vertex
        for (let j = 0; j < 3; ++j)
        {
            data.push(this.vertices[vm[j]][0], this.vertices[vm[j]][1], this.vertices[vm[j]][2]);
            data.push(normal[0], normal[1], normal[2]);
            data.push(this.texCoords[tm[j]][0], this.texCoords[tm[j]][1]);
        }
    }

    return data;
};

Sprite.prototype.wire = function()
{
    let wires = [];

    for (let i = 0; i < this.wireMap.length; ++i)
    {
        // a shorter way to write it
        let vertex = this.vertices[this.wireMap[i]];
        // adding vertices
        for (let j = 0; j < 3; ++j) { wires.push(vertex[j]); }
    }

    return wires;
};

Sprite.prototype.updateBuffers = function()
{
    // tessellation
    this.data = this.tessellate();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.data));

    // wires
    this.wires = this.wire();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wireBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.wires));

    // vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.verticize()));
};