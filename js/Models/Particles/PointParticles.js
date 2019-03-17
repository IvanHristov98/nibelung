PointParticles = function(center, range, rot, baseObject, density, avgSpeed, avgSize, avgRot)
{
    Particles.call(this, center, range, rot, baseObject, density, avgSpeed, avgSize, avgRot);

    // contains original movement direction vectors
    this.dirBuckets = [];
    this.spawningPos = [0,0,0];

    // determines position
    this.hBoundaries = [-45,45];    // horizontal
    this.vBoundaries = [-45,45];    // vertical

    this.construct(this.avgSpeedOffset, this.avgSizeOffset);
};

PointParticles.prototype = Object.create(Particles.prototype);
PointParticles.prototype.constructor = PointParticles;

PointParticles.prototype.construct = function(speedOffset, sizeOffset)
{
    this.dummies.length = 0;
    this.dirBuckets.length = 0;
    this.rotBuckets.length = 0;

    for (let i = 0; i < this.density; ++i)
    {
        // movement direction based on restrictions
        let hSphericalAngle  = random(this.hBoundaries[0], this.hBoundaries[1]);
        let vSphericalAngle = random(this.vBoundaries[0], this.vBoundaries[1]);
        let dir = this.dirFromCenterToSphericalSurface(hSphericalAngle, vSphericalAngle);

        // original position
        let pos = [0,0,0];
        for (let j = 0; j < 3; ++j) { pos[j] = dir[j]*(this.range[j]/2)*Math.random(); }

        // rotation
        let rot = this.generateRandApproxRotation();
        this.rotBuckets.push(rot);

        this.dirBuckets.push(dir);
        this.dummies.push(
            new Particle(pos, rot.slice(), dir, this.randomOffset(speedOffset, this.avgSpeed), this.randomOffset(sizeOffset, this.avgSize))
        );
    }
};

PointParticles.prototype.move = function(interval)
{
    for (let i = 0; i < this.density; ++i)
    {
        this.moveParticle(this.dummies[i], this.dirBuckets[i], interval);
        this.rotateParticle(this.dummies[i], this.rotBuckets[i]);
        this.checkBoundaries(this.dummies[i]);
    }
};

// Helper functions
PointParticles.prototype.dirFromCenterToSphericalSurface = function(hAngle, vAngle, center = [0,0,0])
{
    let coords = unitVector(this.calcSphericalCoords(hAngle, vAngle));

    return vectorPoints(coords, center);
};

PointParticles.prototype.calcSphericalCoords = function(hAngle, vAngle)
{
    return [
        Math.cos(radians(vAngle))*Math.cos(radians(hAngle)),
        Math.cos(radians(vAngle))*Math.sin(radians(hAngle)),
        Math.sin(radians(vAngle))
    ];
};

PointParticles.prototype.checkBoundaries = function(particle)
{
    let respawn = false;

    for (let i = 0; i < 3; ++i)
    {
        if (particle.position[i] > this.range[i]/2) { respawn = true; }
        if (particle.position[i] < -this.range[i]/2) { respawn = true; }
    }

    particle.position = (!respawn) ? particle.position : this.spawningPos.slice();
};