const MAX_RADIUS = 5000;
const MIN_RADIUS = 50;

EyeController = function(radius, hAngle, vAngle)
{
    // camera coordinates
    this.originalRadius = radius;
    this.originalHAngle = hAngle;
    this.originalVAngle = vAngle;

    this.radius = this.originalRadius;
    this.hAngle = this.originalHAngle;
    this.vAngle = this.originalVAngle;

    this.viewHAngle = this.hAngle;
    this.viewVAngle = this.vAngle;
    this.viewRadius = this.radius;

    // target coordinates
    this.target = [0,0,0];

    this.canvas = document.getElementById("main-canvas");
    this.move = false;
    this.tumble = false;
    this.zoom = false;

    this.oldX = 0;
    this.oldY = 0;

    this.viewScale = 1;

    // camera tumbling
    this.canvas.addEventListener("mousedown", this.eyeTumbleEnter.bind(this), false);
    this.canvas.addEventListener("mousemove", this.eyeTumble.bind(this), false);
    this.canvas.addEventListener("mouseup", this.movementCancel.bind(this), false);
    this.canvas.addEventListener("mouseout", this.movementCancel.bind(this), false);

    // moving camera
    this.canvas.addEventListener("mousedown", this.targetMoveEnter.bind(this), false);
    this.canvas.addEventListener("mousemove", this.targetMove.bind(this), false);

    // zooming vector wise
    this.canvas.addEventListener("mousedown", this.zoomVectorWiseEnter.bind(this), false);
    this.canvas.addEventListener("mousemove", this.zoomVectorWise.bind(this), false);

    // camera zooming radius wise
    this.canvas.addEventListener("wheel", this.zoomRadiusWise.bind(this), false );

    // resetting camera
    this.canvas.addEventListener("keydown", this.reset.bind(this), false);

    // resetting camera
    this.canvas.addEventListener('contextmenu', function (event) { event.preventDefault(); }, false);
};

// returns a 3D vector of spherical coordinates
EyeController.prototype.getSphericalCoords = function()
{
    // clamping vAngle
    if (this.vAngle > 80) { this.vAngle = 80; }
    if (this.vAngle < -80) { this.vAngle = -80;}

    return [
        this.target[0] + this.viewRadius*Math.cos(radians(this.viewVAngle))*Math.cos(radians(this.viewHAngle)),
        this.target[1] + this.viewRadius*Math.cos(radians(this.viewVAngle))*Math.sin(radians(this.viewHAngle)),
        this.target[2] + this.viewRadius*Math.sin(radians(this.viewVAngle))
    ];
};

// changes mouse cursor
EyeController.prototype.setCursor = function (type)
{
    this.canvas.style.cursor = type;
};

EyeController.prototype.eyeTumbleEnter = function(event)
{
    if (event.shiftKey && event.button === 0)
    {
        this.tumble = true;

        this.oldX = getX(event);
        this.oldY = getY(event);
    }
};

EyeController.prototype.eyeTumble = function(event)
{
    if (!this.tumble) { return;}
    if (!(event.shiftKey && event.buttons === 1))
    {
        this.movementCancel();
    }

    this.setCursor("move");

    let x = getX(event);
    let y = getY(event);

    let distX = this.oldX - x;
    let distY = this.oldY - y;

    //this.hAngle += this.viewScale*((y > 0) ? -distX/5 : distX/5);
    this.hAngle += (distX/4);
    this.vAngle += (distY/2);

    this.oldX = x;
    this.oldY = y;
};

EyeController.prototype.movementCancel = function()
{
    this.tumble = false;
    this.move = false;
    this.zoom = false;

    this.setCursor("auto");
};

EyeController.prototype.targetMoveEnter = function(event)
{
    if (event.shiftKey && event.button === 1)
    {
        this.move = true;

        this.oldX = getX(event);
        this.oldY = getY(event);
    }
};

EyeController.prototype.targetMove = function(event)
{
    if (!this.move) { return; }

    if (!(event.shiftKey && event.buttons === 4)) { this.movementCancel(); }

    this.setCursor("move");

    let x = getX(event);
    let y = getY(event);

    let distX = this.oldX - x;
    let distY = this.oldY - y;

    this.target[0] += this.viewScale*distX*0.5*(Math.cos(radians(this.viewHAngle + 45)) - Math.sin(radians(this.viewHAngle + 45)));
    this.target[1] += this.viewScale*distX*0.5*(Math.sin(radians(this.viewHAngle + 45)) + Math.cos(radians(this.viewHAngle + 45)));
    this.target[2] += this.viewScale*distY*0.75;

    this.oldX = x;
    this.oldY = y;
};

EyeController.prototype.zoomVectorWiseEnter = function(event)
{
    if (event.shiftKey && event.button === 2)
    {
        this.zoom = true;

        this.oldX = getX(event);
    }
};

EyeController.prototype.zoomVectorWise = function(event)
{
    if (!this.zoom) { return; }
    if (!(event.shiftKey && event.buttons === 2))
    {
        this.movementCancel();
    }

    this.setCursor("w-resize");

    let x = getX(event);

    let distX = x - this.oldX;

    let toCenter = unitVector(vectorPoints(this.target, this.getSphericalCoords()));

    for (let i = 0; i < 3; i++) { this.target[i] += distX*toCenter[i]; }

    this.oldX = x;
};

// zooms in and out
EyeController.prototype.zoomRadiusWise = function(event) {
    if (!event.shiftKey) {
        return;
    }

    // if run onto Mozilla
    if (typeof InstallTrigger !== 'undefined')
    {
        this.radius += 20*event.deltaY;
    }
    // on any other browser
    else { this.radius += event.deltaY; }

    this.viewScale = this.viewScale*Math.pow(1.0006, event.deltaY);

    if (this.radius > MAX_RADIUS) { this.radius = MAX_RADIUS; }
    if (this.radius < MIN_RADIUS) { this.radius = MIN_RADIUS; }
};

// resets eye to original coordinates
EyeController.prototype.reset = function(event)
{
    // covers cyrillic as well
    if (event.key === "a" || event.key === "A" || event.key === "а" || event.key === "А")
    {
        // resetting eye
        this.radius = this.originalRadius;
        this.hAngle = this.originalHAngle;
        this.vAngle = this.originalVAngle;

        // prevents multiple rotations
        if (this.viewHAngle > 0) { this.viewHAngle = (this.viewHAngle + 180) % 360 - 180;}
        else
        {
            this.viewHAngle = -((Math.abs(this.viewHAngle) + 180) % 360 - 180);
        }

        // resetting target
        this.target = [0,0,0];

        this.viewScale = 1;
    }
};