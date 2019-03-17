ParticlesController = function(baseObject)
{
    this.container = {};
    this.namesMap = {};
    this.size = 0;

    this.defCenter = [0,0,0];
    this.defRange = [100,100,100];
    this.defRot = [0,0,0,0];
    this.defDensity = 100;

    this.baseObject = baseObject;
    this.defDir = [-1,-1,-1];
    this.defAvgSpeed = 20;
    this.defAvgSize = 1.5;
    this.defAvgRot = [0,0,0,0];
};

ParticlesController.prototype.insertPlanar = function()
{
    // def stands for default
    let particles = new PlaneParticles(
        this.defCenter.slice(), this.defRange.slice(), this.defRot.slice(), this.baseObject, this.defDensity, this.defDir.slice(),
        this.defAvgSpeed, this.defAvgSize, this.defAvgRot.slice()
    );
    this.setSomeDefaultValues(particles);
    particles.name = this.addUniqueName("Планарни частици");

    this.container[this.size++] = particles;

    // updating side menu
    sideMenu.switchToParticles();
};

ParticlesController.prototype.insertPoint = function()
{
    let particles = new PointParticles(
        this.defCenter.slice(), this.defRange.slice(), this.defRot.slice(), this.baseObject, this.defDensity,
        this.defAvgSpeed, this.defAvgSize, this.defAvgRot.slice()
    );
    this.setSomeDefaultValues(particles);
    particles.name = this.addUniqueName("Точкови частици");

    this.container[this.size++] = particles;

    // updating side menu
    sideMenu.switchToParticles();
};

// todo: test
ParticlesController.prototype.removeParticle = function(key)
{
    delete this.container[key];
};

ParticlesController.prototype.drawParticles = function(mesh = true, frame = false)
{
    for (let key in this.container)
    {
        if (mesh) { this.container[key].draw(); }
        if (frame && key === sideMenu.selected) { this.container[key].drawFrame(); }
    }
};

ParticlesController.prototype.moveParticles = function(interval)
{
    for (let key in this.container)
    {
        this.container[key].move(interval);
    }
};

// Helper functions
ParticlesController.prototype.setSomeDefaultValues = function(particles)
{
    particles.pathRandomizerCoeff = 0;
    particles.maxDirOffset = [0,0,0];
    particles.avgSpeedOffset = 0;
    particles.avgSizeOffset = 0;
    particles.avgRotOffset = 0;
};

ParticlesController.prototype.addUniqueName = function(name)
{
    if (this.namesMap[name])
    {
        let count = 1;
        while (this.namesMap[name + " " + 1]) { ++count; }
        name += " " + count;
    }

    this.namesMap[name] = true;
    return name;
};