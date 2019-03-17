TimeController = function()
{
    // controls
    this.controlsPlay = document.getElementById("controls-play");
    this.controlsStop = document.getElementById("controls-stop");
    this.controlsPause = document.getElementById("controls-pause");
    this.controlsTimer = document.getElementById("controls-timer");
    this.isPlaying = false;
    this.timer = 0;
    this.oldTime = 0;

    this.updateControls();

    // adding event listeners
    this.controlsPlay.addEventListener("click", this.switchControls.bind(this), false);
    this.controlsPause.addEventListener("click", this.switchControls.bind(this), false);
    this.controlsStop.addEventListener("click", this.stopPlaying.bind(this), false);
};

TimeController.prototype.updateControls = function()
{
    if (!this.isPlaying)
    {
        this.controlsPlay.style.display = "inline-block";
        this.controlsPause.style.display = "none";
    }
    else
    {
        this.controlsPlay.style.display = "none";
        this.controlsPause.style.display = "inline-block";
    }
};

TimeController.prototype.switchControls = function()
{
    this.isPlaying = !this.isPlaying;

    this.updateControls();
};

TimeController.prototype.stopPlaying = function()
{
    // resetting everything
    this.isPlaying = false;
    this.timer = 0;

    // updating ui buttons
    this.updateControls();

    // reconstructing particles
    for (let key in sideMenu.particles)
    {
        let particles = sideMenu.particles[key];
        particles.construct(particles.avgSpeedOffset, particles.avgSizeOffset);
    }
};

TimeController.prototype.updateTimer = function(timePortion)
{
    if (this.isPlaying) { this.timer += timePortion; }

    // timer text update
    this.controlsTimer.innerHTML = this.timer.toFixed(2) + " сек";
};