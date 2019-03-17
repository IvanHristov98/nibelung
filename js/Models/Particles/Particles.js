Particles = function(center, range, rot, baseObject, density, avgSpeed, avgSize, avgRot)
{
    // frame
    this.cuboid = new Cuboid(center, range);
    this.cuboid.rot = rot;
    this.center = center;
    this.rot = rot;
    this.name = "";

    // local fields
    this.range = range;
    this.avgSpeed = avgSpeed;   // float
    this.avgSize = avgSize;     // float
    this.avgRot = avgRot;       // 4d vector float
    this.baseObject = baseObject;
    this.density = density;
    this.dummies = [];
    this.rotBuckets = [];

    // fields affecting the behaviour of the particles
    this.pathRandomizerCoeff = 0.03;
    this.maxDirOffset = [0.3,0.3,0.3];
    this.avgSpeedOffset = 0.5;
    this.avgSizeOffset = 0.2;
    this.avgRotOffset = 0.5;
    this.alpha = 1;
};

Particles.prototype.draw = function()
{
    pushMatrix();
        translate(this.center);
        if (typeof this.rot !== 'undefined')
        {
            if (this.rot[0]) { zRotate(this.rot[0]); }
            if (this.rot[1]) { yRotate(this.rot[1]); }
            if (this.rot[2]) { xRotate(this.rot[2]); }
            if (this.rot[3]) { zRotate(this.rot[3]); }
        }

        // maintaining them ordered within the z-Buffer to avoid transparency failures
        let dummiesCopy = this.dummies.slice();
        dummiesCopy.sort(function(a,b){
            // option 1
            /*let mvMatrix = multiplyMatrix(glViewMat, glMat);
            let aPos = multiplyMatrixVec4(mvMatrix, [a.position[0], a.position[1], a.position[2], 1]);
            let bPos = multiplyMatrixVec4(mvMatrix, [b.position[0], b.position[1], b.position[2], 1]);
            return aPos[2] - bPos[2];*/

            // option 2
            let distA = vectorLength(vectorPoints(glEye, a.position));
            let distB = vectorLength(vectorPoints(glEye, b.position));

            return distB - distA;
        });

        for (let i = 0; i < this.density; ++i)
        {
            let clone = Object.assign(Object.create(Object.getPrototypeOf(this.baseObject)), this.baseObject);

            clone.center = dummiesCopy[i].position;
            clone.size = [dummiesCopy[i].size, dummiesCopy[i].size, dummiesCopy[i].size];
            clone.rot = dummiesCopy[i].rot;

            gl.uniform1f(uAlpha, this.alpha);

            clone.draw();
            // warns the garbage collector
            clone = null;
        }
    popMatrix();
};

Particles.prototype.drawFrame = function()
{
    this.cuboid.drawWires();
};

Particles.prototype.randomOffset = function(offset, val)
{
    offset = Math.abs(offset);
    return random(val-offset, val+offset);
};

Particles.prototype.moveParticle = function(particle, originalDir, interval)
{
    for (let j = 0; j < 3; ++j)
    {
        // dummies movement
        particle.position[j] += particle.speed*particle.dir[j]*interval;

        // randomizing path
        particle.dir[j] += random(-this.pathRandomizerCoeff, this.pathRandomizerCoeff);
        // handling direction restrictions
        particle.dir[j] = (particle.dir[j] > originalDir[j]+this.maxDirOffset[j])
            ? originalDir[j]+this.maxDirOffset[j]
            : particle.dir[j];
        particle.dir[j] = (particle.dir[j] < originalDir[j]-this.maxDirOffset[j])
            ? originalDir[j]-this.maxDirOffset[j]
            : particle.dir[j];
    }

    // making sure it's always a unit vector
    particle.dir = unitVector(particle.dir);
};

Particles.prototype.rotateParticle = function(particle, rotStep)
{
    for (let j = 0; j < 4; ++j) { particle.rot[j] += rotStep[j]; }
};

Particles.prototype.generateRandApproxRotation = function()
{
    let rot = [0,0,0,0];
    for (let j = 0; j < 4; ++j) { rot[j] = this.randomOffset(this.avgRotOffset, this.avgRot[j]); }

    return rot;
};