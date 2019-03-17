OrientationCube = function(center, size)
{
    this.cube = new Cuboid([0,0,0], [1,1,1]);
    this.cube.color = [1,1,1];

    gl.activeTexture(gl.TEXTURE0);
    this.cube.texture = loadTexture('sprites/orientation_view.jpg');
    texTranslate(this.cube.texMatrix, [0, 0]);
    texScale(this.cube.texMatrix, [1/6, 1]);

    this.color = [1,1,1];
    this.center = center;
    this.size = size;
};

OrientationCube.prototype.draw = function(selectionMode = false)
{
    pushMatrix();
        translate(this.center);
        scale(this.size);

        this.cube.draw();
    popMatrix();
};