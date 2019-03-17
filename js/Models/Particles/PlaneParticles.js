PlaneParticles = function(center, range, rot, baseObject, density, dir, avgSpeed, avgSize, avgRot)
{
    // inheriting base particles object
    Particles.call(this, center, range, rot, baseObject, density, avgSpeed, avgSize, avgRot);

    // local fields
    this.dir = unitVector(dir);

    // construction
    this.construct(this.avgSpeedOffset, this.avgSizeOffset);
};

PlaneParticles.prototype = Object.create(Particles.prototype);
PlaneParticles.prototype.constructor = PlaneParticles;

PlaneParticles.prototype.construct = function(speedOffset, sizeOffset)
{
    this.dummies.length = 0;
    this.rotBuckets.length = 0;

    for (let i = 0; i < this.density; ++i)
    {
        // generating position
        let pos = this.generateRandomPosition();
        // generating rotation
        let rot = this.generateRandApproxRotation();
        this.rotBuckets.push(rot);

        this.dummies.push(
            new Particle(pos,rot.slice(), unitVector(this.dir.slice()), this.randomOffset(speedOffset, this.avgSpeed), this.randomOffset(sizeOffset, this.avgSize))
        );
    }
};

PlaneParticles.prototype.move = function(interval)
{
    for (let i = 0; i < this.density; ++i)
    {
        this.moveParticle(this.dummies[i], this.dir.slice(), interval);
        this.rotateParticle(this.dummies[i], this.rotBuckets[i]);
        this.validateBoundaries(this.dummies[i]);
    }
};

PlaneParticles.prototype.validateBoundaries = function(particle)
{
    for (let i = 0; i < 3; ++i)
    {
        particle.position[i] = (particle.position[i] > this.range[i]/2) ? -this.range[i]/2 : particle.position[i];
        particle.position[i] = (particle.position[i] < -this.range[i]/2) ? this.range[i]/2 : particle.position[i];
    }
};

PlaneParticles.prototype.generateRandomPosition = function()
{
    let pos = [];
    for (let j = 0; j < 3; ++j) { pos.push(this.randomOffset(this.range[j]/2, 0)); }

    return pos;
};