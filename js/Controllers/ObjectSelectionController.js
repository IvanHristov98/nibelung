ObjectSelectionController = function()
{
    this.objects = new Group([0,0,0], [1,1,1]);
    this.objectNamesMap = {};
    this.size = 0;

    // viewing flags
    this.useWireframe = false;
    this.useMesh = true;
    this.moreOptionsWindow = document.getElementById("additional-options");
    this.moreOptionsWindow.style.display = "none";
    this.canvas = document.getElementById("main-canvas");
    this.vertexEditForm = document.getElementById("edit-vertex");
    this.vertexEditOffsets = [
        document.getElementById("edit-vertex-pos-x"),
        document.getElementById("edit-vertex-pos-y"),
        document.getElementById("edit-vertex-pos-z")
    ];

    // wireframe management
    this.canvas.addEventListener("keydown", this.switchWireFrame.bind(this), false);
    // mesh management
    this.canvas.addEventListener("keydown", this.switchMesh.bind(this), false);
    // additional options menu
    this.canvas.addEventListener("keydown", this.displayAdditionalOptionsWindow.bind(this), false);
    this.canvas.addEventListener("keyup", this.closeAdditionalOptionsWindow.bind(this), false);
    // vertex selection
    this.selectedCodes = {};
    this.canvas.addEventListener("mousedown", this.selectVertex.bind(this), false);
    // vertex editing
    this.canvas.addEventListener("keydown", this.initVertexEditing.bind(this), false);
    this.canvas.addEventListener("click", this.cancelVertexEditing.bind(this), false);

    document.getElementById("edit-vertex-submit").addEventListener("click", this.updateVertexEditing.bind(this), false)
};

ObjectSelectionController.prototype.switchWireFrame = function(event)
{
    if (event.key === "W" || event.key === "w" || event.key === "У" || event.key === "у")
    {
        this.useWireframe = !this.useWireframe;
    }
};

ObjectSelectionController.prototype.switchMesh = function(event)
{
    if (event.key === "M" || event.key === "m" || event.key === "П" || event.key === "п")
    {
        this.useMesh = !this.useMesh;
    }
};

ObjectSelectionController.prototype.displayAdditionalOptionsWindow = function(event)
{
    if (event.keyCode === 32)
    {
        this.moreOptionsWindow.style.display = "block";
    }
};

ObjectSelectionController.prototype.closeAdditionalOptionsWindow = function(event)
{
    if (event.keyCode === 32)
    {
        this.moreOptionsWindow.style.display = "none";
    }
};

ObjectSelectionController.prototype.draw = function(mesh = true, wireframe = false, points = false, key = undefined)
{
    if (typeof key === 'undefined')
    {
        this.objects.draw((mesh && this.useMesh), (wireframe && this.useWireframe), points);
    }
    else { this.objects.drawKey(mesh && this.useMesh, wireframe && this.useWireframe, points, key);}
};

// Object insertion
ObjectSelectionController.prototype.insertObject = function(object)
{
    this.objects.insertObject(this.size,object);
    this.size++;
};

ObjectSelectionController.prototype.pushCustomObject = function(insertObj, title, spanTitle, range, n = undefined, center = [0,0,0], size = [50,50,50])
{
    // DOM elements to manage object creation
    let canvas = this.canvas;
    let sizePrompt = document.getElementById('size-prompt');
    let txt = document.getElementById("size-prompt-text");
    let input = document.getElementById("size-prompt-input");
    let btn = document.getElementById("size-prompt-btn");

    // changing title to a suitable one
    document.getElementById('size-prompt-title').innerHTML = title;

    // input values changing
    input.min = range[0];
    input.max = range[1];
    input.value = Math.round((range[0]+range[1])/2);
    txt.innerHTML = spanTitle + ": " + input.value;

    // function to update text box presenting input value information
    function updateTextBox() { txt.innerHTML = spanTitle + ": " + input.value; }

    function cancelCreation()
    {
        input.removeEventListener('input', updateTextBox);
        btn.removeEventListener('click', create);
        canvas.removeEventListener('click', cancelCreation);
        sizePrompt.style.display = 'none';
    }

    function create()
    {
        insertObj(Math.round(parseInt(input.value)),center,size);
        cancelCreation();

        sideMenu.switchToAssets();
    }

    // creating a prompt asking the user to moderate the object to be created
    if (typeof n === 'undefined')
    {
        sizePrompt.style.display = 'block';

        input.addEventListener('input', updateTextBox);
        btn.addEventListener('click', create);
        canvas.addEventListener('click', cancelCreation);
    }
    else { insertObj(n, center, size); }
};

ObjectSelectionController.prototype.addUniqueName = function(name)
{
    let title = name;
    if (this.objectNamesMap[title])
    {
        let count = 1;
        while (this.objectNamesMap[title + " " + count]) { count++; }
        title += " " + count;
    }
    this.objectNamesMap[title] = true;
    return title;
};

ObjectSelectionController.prototype.pushCustomCone = function(n = undefined, center = [0,0,0], size = [50,50,50])
{
    let title = this.addUniqueName("Нов конус");

    function pushCone(n, center, size)
    {
        let cone = new Cone(n, center, size);
        cone.name = title;
        this.insertObject(cone);
    }

    this.pushCustomObject(pushCone.bind(this), title, "Стени", [3,60], n, center, size);
};

ObjectSelectionController.prototype.pushCustomPyramid = function(n = undefined, center = [0,0,0], size = [50,50,50])
{
    let title = this.addUniqueName("Нова пирамида");

    function pushPyramid(n, center, size)
    {
        let pyramid = new Pyramid(n, center, size);
        pyramid.name = title;
        this.insertObject(pyramid);
    }

    this.pushCustomObject(pushPyramid.bind(this), title, "Стени", [3,60], n, center, size);
};

ObjectSelectionController.prototype.pushCustomCubicSphere = function(n = undefined, center = [0,0,0], size = [50,50,50])
{
    let title = this.addUniqueName("Нова кубична сфера");

    function pushSphere(n, center, size)
    {
        let sphere = new CubicSphere(n, center, size);
        sphere.name = title;
        this.insertObject(sphere);
    }

    this.pushCustomObject(pushSphere.bind(this), title, "Разцепвания", [1,6], n, center, size);
};

ObjectSelectionController.prototype.pushCustomCylinder = function(n = undefined, center = [0,0,0], size = [50,50,50])
{
    let title = this.addUniqueName("Нов цилиндър");

    function pushCylinder(n, center, size)
    {
        let cylinder = new Cylinder(n, center, size);
        cylinder.name = title;
        this.insertObject(cylinder);
    }

    this.pushCustomObject(pushCylinder.bind(this), title, "Стени", [3, 60], n, center, size);
};

ObjectSelectionController.prototype.pushCustomCuboid = function(n = undefined, center = [0,0,0], size = [50,50,50])
{
    let cuboid = new Cuboid(center, size);
    cuboid.name = this.addUniqueName("Нов кубоид");
    this.insertObject(cuboid);

    sideMenu.switchToAssets();
};

ObjectSelectionController.prototype.pushCustomSprite = function(center = [0,0,0], size = [50,50,50])
{
    let sprite = new Sprite(center, size);
    sprite.name = this.addUniqueName("Нов спрайт");
    this.insertObject(sprite);

    sideMenu.switchToAssets();
};

// Vertex selection
ObjectSelectionController.prototype.selectVertex = function(event)
{
    if (event.altKey)
    {
        let isLegit = true;
        for (let i = 1; i < 4; ++i)
        {
            isLegit &= (pixValues[i*4] === pixValues[0]);
            isLegit &= (pixValues[i*4+1] === pixValues[1]);
            isLegit &= (pixValues[i*4+2] === 0);
        }

        if (isLegit)
        {
            this.selectedCodes[rgToHash(pixValues[0], pixValues[1])] = true;

            if (sideMenu.selected && sideMenu.mode === 2)
            {
                this.objects.objects[sideMenu.selected].updateBuffers();
            }
        }
    }

    if (!event.altKey && !event.shiftKey)
    {
        this.selectedCodes = {};

        if (sideMenu.selected && sideMenu.mode === 2)
        {
            this.objects.objects[sideMenu.selected].updateBuffers();
        }
    }
};

// Vertex editing
ObjectSelectionController.prototype.initVertexEditing = function(event)
{
    if (event.key === "E" || event.key === "e")
    {
        this.vertexEditForm.style.display = "block";

        // for every input
        for (let i = 0; i < 3; ++i)
        {
            this.vertexEditOffsets[i].setAttribute("value","0");
        }
    }
};

ObjectSelectionController.prototype.cancelVertexEditing = function()
{
    this.vertexEditForm.style.display = "none";
};

ObjectSelectionController.prototype.updateVertexEditing = function()
{
    // for a shorter way to write it
    let targetObj = this.objects.objects[sideMenu.selected];

    // for the 3 inputs
    for (let i = 0; i < 3; ++i)
    {
        // for every selected vertex
        for (let key in this.selectedCodes)
        {
            targetObj.vertices[key][i] += parseInt(this.vertexEditOffsets[i].value)/100;
        }
    }

    targetObj.updateBuffers();

    this.cancelVertexEditing();
};