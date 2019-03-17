Group = function(center, size, rot = undefined)
{
    // a map to hold the objects
    this.objects = {};

    // additional properties
    this.center = center;
    this.size = size;
    this.rot = rot;
};

Group.prototype.draw = function(mesh = true, wireframe = false, points = false)
{
    for (let key in this.objects)
    {
        this.drawKey(mesh, wireframe, points, key);
    }
};

Group.prototype.drawKey = function(mesh = true, wireframe = false, points = false, key)
{
    pushMatrix();
        translate(this.center);
        scale(this.size);

        if (mesh) { this.objects[key].draw(); }
        if (wireframe) { this.objects[key].drawWires(); }
        if (points) { this.objects[key].drawVertices(); }
    popMatrix();
};

Group.prototype.insertObject = function(key, object)
{
    this.objects[key] = object;
};

Group.prototype.removeObject = function(key)
{
    delete this.objects[key];
};

Group.prototype.getObject = function (key)
{
    return this.objects[key];
};