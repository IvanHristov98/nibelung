SideMenuController = function(particles, assets)
{
    this.particles = particles;
    this.assets = assets;
    // list
    this.list = document.getElementById("side-menu-list");
    this.listEmptyMsg = document.getElementById("side-menu-list-empty-msg");
    this.listEmptyMsg.style.display = "none";
    // buttons
    this.particlesBtn = document.getElementById("side-menu-particles"); // as index 0
    //this.groupsBtn = document.getElementById("side-menu-groups");       // as index 1
    this.assetsBtn = document.getElementById("side-menu-assets");       // as index 2
    this.texturesBtn = document.getElementById("side-menu-textures");   // as index 3

    // current selected
    this.mode = undefined;
    this.selected = undefined;
    this.elemOfSelected = undefined;
    this.switchToParticles();

    // side menu editor
    this.sideMenuEditorTitle = document.getElementById("side-menu-editor-title");
    this.sideMenuEditorTxt = document.getElementById("side-menu-empty-text");
    this.sideMenuEditorDelete = document.getElementById("side-menu-editor-delete");
    this.sideMenuEditorDelete.style.display = "none";
    // side menu common form
    this.assetForm = document.getElementById("side-menu-common-editor");
    this.assetFormCenter = [
        document.getElementById("side-menu-common-editor-center-x"),
        document.getElementById("side-menu-common-editor-center-y"),
        document.getElementById("side-menu-common-editor-center-z"),
    ];
    this.assetFormScale = [
        document.getElementById("side-menu-common-editor-scale-x"),
        document.getElementById("side-menu-common-editor-scale-y"),
        document.getElementById("side-menu-common-editor-scale-z"),
    ];
    this.assetFormRot = [
        document.getElementById("side-menu-common-editor-rot-y"),
        document.getElementById("side-menu-common-editor-rot-x"),
        document.getElementById("side-menu-common-editor-rot-z")
    ];
    // colors
    this.assetFormColor = document.getElementById("side-menu-common-editor-color");
    this.assetFormColorBox = document.getElementById("side-menu-common-editor-color-box");
    // texture
    this.assetFormTexture = document.getElementById("side-menu-common-editor-texture");
    // procedural alpha
    this.assetFormAlpha = document.getElementById("side-menu-common-editor-alpha");
    this.assetFormAlphaColor = document.getElementById("side-menu-common-editor-alpha-color");
    this.assetFormAlphaColorBox = document.getElementById("side-menu-common-editor-alpha-color-box");

    // side menu particles form
    this.particlesForm = document.getElementById("side-menu-particles-editor");
    this.particlesFormCenter = [
        document.getElementById("side-menu-particles-editor-center-x"),
        document.getElementById("side-menu-particles-editor-center-y"),
        document.getElementById("side-menu-particles-editor-center-z")
    ];
    this.particlesFormRange = [
        document.getElementById("side-menu-particles-editor-range-x"),
        document.getElementById("side-menu-particles-editor-range-y"),
        document.getElementById("side-menu-particles-editor-range-z")
    ];
    this.particlesFormRot = [
        document.getElementById("side-menu-particles-editor-rot-x"),
        document.getElementById("side-menu-particles-editor-rot-y"),
        document.getElementById("side-menu-particles-editor-rot-z"),
    ];

    // used to handle planar directions
    this.particlesFormPlanarDir = document.getElementById("side-menu-particles-editor-pl-dir");
    this.particlesFormPlanarDirs = [
        document.getElementById("side-menu-particles-editor-pl-dir-x"),
        document.getElementById("side-menu-particles-editor-pl-dir-y"),
        document.getElementById("side-menu-particles-editor-pl-dir-z"),
    ];

    // used to handle point directions
    this.particlesFormPointDir = document.getElementById("side-menu-particles-editor-point-dir");
    this.particlesFormPointDirs = [
        document.getElementById("side-menu-particles-editor-point-h-left"),
        document.getElementById("side-menu-particles-editor-point-h-right"),
        document.getElementById("side-menu-particles-editor-point-v-down"),
        document.getElementById("side-menu-particles-editor-point-v-up"),
    ];

    // used to select a base object
    this.particlesFormBaseObject = document.getElementById("side-menu-particles-editor-base-object");

    this.particlesFormDensity = document.getElementById("side-menu-particles-editor-density");
    this.particlesFormAvgSpeed = document.getElementById("side-menu-particles-editor-avg-speed");
    this.particlesFormAvgSize = document.getElementById("side-menu-particles-editor-avg-size");
    this.particlesFormAlpha = document.getElementById("side-menu-particles-editor-alpha");
    this.particlesFormAvgRot = [
        document.getElementById("side-menu-particles-editor-avg-rot-x"),
        document.getElementById("side-menu-particles-editor-avg-rot-y"),
        document.getElementById("side-menu-particles-editor-avg-rot-z")
    ];

    this.particlesFormPathRandCoeff = document.getElementById("side-menu-particles-editor-path-rand");
    this.particlesFormMaxDirOffset = document.getElementById("side-menu-particles-editor-max-dir-offset");
    this.particlesFormAvgSpeedOffset = document.getElementById("side-menu-particles-editor-avg-speed-offset");
    this.particlesFormAvgSizeOffset = document.getElementById("side-menu-particles-editor-avg-size-offset");
    this.particlesFormAvgRotOffset = document.getElementById("side-menu-particles-editor-avg-rot-offset");

    // textures
    this.texturesEditor = document.getElementById("side-menu-textures-editor");
    this.texturesView = document.getElementById("side-menu-texture-view");

    // button clicking
    this.particlesBtn.addEventListener("click", this.switchToParticles.bind(this), false);
    //this.groupsBtn.addEventListener("click", this.switchToGroups.bind(this), false);
    this.assetsBtn.addEventListener("click", this.switchToAssets.bind(this), false);
    this.texturesBtn.addEventListener("click", this.switchToTextures.bind(this), false);

    // list selection
    this.list.addEventListener("click", this.pickElement.bind(this), false);

    // side menu assets form
    for (let i = 0; i < 3; ++i)
    {
        this.assetFormCenter[i].addEventListener("input", this.updateAsset.bind(this), false);
        this.assetFormScale[i].addEventListener("input", this.updateAsset.bind(this), false);
        this.assetFormRot[i].addEventListener("input", this.updateAsset.bind(this), false);
    }
    this.assetFormColor.addEventListener("input", this.updateAsset.bind(this), false);
    this.assetFormTexture.addEventListener("input", this.updateAsset.bind(this), false);
    this.assetFormAlpha.addEventListener("input", this.updateAsset.bind(this), false);
    this.assetFormAlphaColor.addEventListener("input", this.updateAsset.bind(this), false);

    this.sideMenuEditorDelete.addEventListener("click", this.remove.bind(this), false);

    // side menu particles form
    for (let i = 0; i < 3; ++i)
    {
        this.particlesFormCenter[i].addEventListener("input", this.updateParticles.bind(this), false);
        this.particlesFormRange[i].addEventListener("input", this.reconstructParticles.bind(this), false);
        this.particlesFormRot[i].addEventListener("input", this.updateParticles.bind(this), false);

        this.particlesFormAvgRot[i].addEventListener("input", this.reconstructParticles.bind(this), false);

        // planar directions
        this.particlesFormPlanarDirs[i].addEventListener("input", this.reconstructParticles.bind(this), false);
    }

    // point directions
    for (let i = 0; i < 4; ++i) { this.particlesFormPointDirs[i].addEventListener("input", this.reconstructParticles.bind(this), false);}

    // base object
    this.particlesFormBaseObject.addEventListener("input", this.updateParticles.bind(this), false);
    this.particlesFormAlpha.addEventListener("input", this.updateParticles.bind(this), false);

    this.particlesFormDensity.addEventListener("input", this.reconstructParticles.bind(this), false);
    this.particlesFormAvgSpeed.addEventListener("input", this.reconstructParticles.bind(this), false);
    this.particlesFormAvgSize.addEventListener("input", this.reconstructParticles.bind(this), false);

    this.particlesFormPathRandCoeff.addEventListener("input", this.reconstructParticles.bind(this), false);
    this.particlesFormMaxDirOffset.addEventListener("input", this.reconstructParticles.bind(this), false);
    this.particlesFormAvgSpeedOffset.addEventListener("input", this.reconstructParticles.bind(this), false);
    this.particlesFormAvgSizeOffset.addEventListener("input", this.reconstructParticles.bind(this), false);
    this.particlesFormAvgRotOffset.addEventListener("input", this.reconstructParticles.bind(this), false);
};

// Button switches
SideMenuController.prototype.switchToParticles = function()
{
    this.switchMode(0);
    this.setBtnColors("#ffb600");
    this.list.innerHTML = "";

    for (let key in this.particles) { this.appendToList(this.particles[key].name, key); }

    if (this.list.innerHTML === "") { this.listEmptyMsg.style.display = "block";}
    else { this.listEmptyMsg.style.display = "none"; }
};

SideMenuController.prototype.switchToAssets = function()
{
    this.switchMode(2);
    this.setBtnColors("", "", "#ffb600");
    this.list.innerHTML = "";

    for (let key in this.assets.objects) { this.appendToList(this.assets.objects[key].name, key); }

    if (this.list.innerHTML === "") { this.listEmptyMsg.style.display = "block";}
    else { this.listEmptyMsg.style.display = "none"; }
};

SideMenuController.prototype.switchToTextures = function()
{
    this.switchMode(3);
    this.setBtnColors("", "", "", "#ffb600");
    this.list.innerHTML = "";
    for (let key in imagesController.images) { this.appendToList("Спрайт " + key, key); }

    if (this.list.innerHTML === "") { this.listEmptyMsg.style.display = "block";}
    else { this.listEmptyMsg.style.display = "none"; }
};

// List selection
SideMenuController.prototype.pickElement = function(event)
{
    this.selected = event.target.getAttribute("data-id");
    if (typeof this.elemOfSelected !== 'undefined') { this.elemOfSelected.className = "list-group-item"; }
    event.target.className += " active";
    this.elemOfSelected = event.target;

    // form revealing
    switch (this.mode)
    {
        case 0:
            this.activateParticlesForm();
            break;
        case 2:
            this.activateAssetForm();
            break;
        case 3:
            this.activateTexturesView();
            break;
    }
};

// Asset manipulation
SideMenuController.prototype.updateAsset = function()
{
    let asset = this.assets.objects[this.selected];

    for (let i = 0; i < 3; ++i)
    {
        asset.center[i] = (this.assetFormCenter[i].value) ? parseInt(this.assetFormCenter[i].value) : 0;
        asset.size[i] = (this.assetFormScale[i].value) ? parseInt(this.assetFormScale[i].value) : 0;
        asset.rot[i] = (this.assetFormRot[i].value) ? parseInt(this.assetFormRot[i].value) : 0;
    }

    // colors
    let rgb = this.hexToRGB(this.assetFormColor.value);
    if (rgb)
    {
        asset.color = [rgb.r/255, rgb.g/255, rgb.b/255];
        this.assetFormColorBox.style.backgroundColor = "#"+this.assetFormColor.value;
    }

    let texKey = parseInt(this.assetFormTexture.value);
    // checking if selected texture is the dummy
    if (texKey !== -1)
    {
        asset.texture = loadTexture(imagesController.images[texKey]);
    }
    else { asset.texture = undefined; }
    asset.texKey = texKey;
    asset.texKeyHeight = this.assetFormAlpha.value;

    // alpha colors
    rgb = this.hexToRGB(this.assetFormAlphaColor.value);
    if (rgb)
    {
        asset.alphaColor = [rgb.r/255, rgb.g/255, rgb.b/255];
        this.assetFormAlphaColorBox.style.backgroundColor = "#"+this.assetFormAlphaColor.value;
    }
};

// Particles manipulation
SideMenuController.prototype.updateParticles = function()
{
    let particles = this.particles[this.selected];

    for (let i = 0; i < 3; ++i)
    {
        particles.center[i] = (this.particlesFormCenter[i].value) ? parseInt(this.particlesFormCenter[i].value) : 0;
        particles.rot[i] = (this.particlesFormRot[i].value) ? parseInt(this.particlesFormRot[i].value) : 0;
    }

    // setting base object
    let key = this.particlesFormBaseObject.value;
    particles.baseObject = objectSelectionController.objects.objects[key];

    // setting alpha
    particles.alpha = parseInt(this.particlesFormAlpha.value)/100;
};

SideMenuController.prototype.reconstructParticles = function()
{
    let particles = this.particles[this.selected];  // for shorter writing
    // setting fields
    particles.density = parseInt(this.particlesFormDensity.value);
    particles.avgSpeed = parseInt(this.particlesFormAvgSpeed.value);
    particles.avgSize = parseInt(this.particlesFormAvgSize.value)/10;

    for (let i = 0; i < 3; ++i)
    {
        this.particles[this.selected].range[i] = (this.particlesFormRange[i].value) ? parseInt(this.particlesFormRange[i].value) : 0;
        particles.avgRot[i] = parseInt(this.particlesFormAvgRot[i].value)/50;
    }

    particles.pathRandomizerCoeff = parseInt(this.particlesFormPathRandCoeff.value)/100;
    let maxDirOffset = parseInt(this.particlesFormMaxDirOffset.value)/100;
    particles.maxDirOffset = [maxDirOffset, maxDirOffset, maxDirOffset];
    particles.avgSpeedOffset = parseInt(this.particlesFormAvgSpeedOffset.value)/10;
    particles.avgSizeOffset = parseInt(this.particlesFormAvgSizeOffset.value)/10;
    particles.avgRotOffset = parseInt(this.particlesFormAvgRotOffset.value)/10;

    // setting the direction if it is a planar particle set
    if (particles instanceof PlaneParticles)
    {
        for (let i = 0; i < 3; ++i)
        {
            particles.dir[i] = (parseFloat(this.particlesFormPlanarDirs[i].value))/100;
        }
    }

    // setting the direction boundaries if it is a point particle set
    if (particles instanceof PointParticles)
    {
        for (let i = 0; i < 2; ++i)
        {
            particles.hBoundaries[i] = parseInt(this.particlesFormPointDirs[i].value);
            particles.vBoundaries[i] = parseInt(this.particlesFormPointDirs[i+2].value);
        }
    }

    // reconstructing
    particles.construct(this.particles[this.selected].avgSpeedOffset, this.particles[this.selected].avgSizeOffset);
};

SideMenuController.prototype.remove = function()
{
    if (typeof this.selected !== 'undefined')
    {
        switch (this.mode)
        {
            case 0:
                particlesController.removeParticle(this.selected);
                this.selected = 'undefined';
                this.switchMode(this.mode);
                this.switchToParticles();
                break;
            case 2:
                this.assets.removeObject(this.selected);
                this.selected = 'undefined';
                this.switchMode(this.mode);
                this.switchToAssets();
                break;
            case 3:
                imagesController.removeJPG(this.selected);
                this.selected = "undefined";
                this.switchMode(this.mode);
                this.switchToTextures();
                break;
        }
    }
};

// HTML & CSS manipulation
SideMenuController.prototype.buildElement = function(elem, elemClass, content = undefined)
{
    let link = document.createElement(elem);
    link.className = elemClass;
    if (typeof content !== 'undefined')
    {
        link.innerHTML = content;
    }

    return link;
};

SideMenuController.prototype.setBtnColors = function(particleColor = "", groupColor = "", assetColor = "", textureColor = "")
{
    this.particlesBtn.style.backgroundColor = particleColor;
    //this.groupsBtn.style.backgroundColor = groupColor;
    this.assetsBtn.style.backgroundColor = assetColor;
    this.texturesBtn.style.backgroundColor = textureColor;
};

SideMenuController.prototype.switchMode = function(mode)
{
    this.mode = mode;
    this.selected = undefined;
    this.elemOfSelected = undefined;

    // Hiding forms
    if (typeof this.sideMenuEditorTitle !== 'undefined') { this.sideMenuEditorTitle.innerHTML = ""; }
    if (typeof this.sideMenuEditorTxt !== 'undefined') { this.sideMenuEditorTxt.style.display = "block"; }
    // Asset form
    if (typeof this.assetForm !== 'undefined') { this.assetForm.style.display = "none"; }
    if (typeof this.sideMenuEditorDelete !== 'undefined') { this.sideMenuEditorDelete.style.display = "none"; }
    // Particles form
    if (typeof this.particlesForm !== 'undefined') { this.particlesForm.style.display = "none"; }
    // Textures
    if (typeof this.texturesEditor !== 'undefined') { this.texturesEditor.style.display = "none"; }
};

SideMenuController.prototype.appendToList = function(name, key)
{
    let asset = this.buildElement("A", "list-group-item", name);
    asset.setAttribute("data-id", key);
    asset.style.cursor = "pointer";
    this.list.appendChild(asset);
};

// taken from stack overflow
SideMenuController.prototype.componentToHex = function(comp)
{
    let hex = comp.toString(16);
    return (hex.length === 1) ? "0" + hex : hex;
};

// taken from stack overflow
SideMenuController.prototype.hexToRGB = function(hex)
{
    let result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// accepts a 3d vector
SideMenuController.prototype.rgbToHex = function(rgbVec)
{
    let result = "";
    for (let i = 0; i < 3; ++i) { result += this.componentToHex(Math.round(rgbVec[i]*255)); }
    return result;
};

// Editor form manipulation
SideMenuController.prototype.activateAssetForm = function()
{
    let asset = this.assets.objects[this.selected];
    // first editing contents
    this.sideMenuEditorTitle.innerHTML = asset.name;

    for (let i = 0; i < 3; ++i)
    {
        this.assetFormCenter[i].value = asset.center[i];
        this.assetFormScale[i].value = asset.size[i];
        this.assetFormRot[i].value = asset.rot[i];
    }

    let color = this.rgbToHex(asset.color);
    this.assetFormColor.value = color;
    this.assetFormColorBox.style.backgroundColor = "#" + color;

    this.assetFormTexture.innerHTML = "";
    let dummyOption = this.buildElement("OPTION", "", "Няма");
    dummyOption.value = -1;
    this.assetFormTexture.appendChild(dummyOption);

    for (let key in imagesController.images)
    {
        let option = this.buildElement("OPTION", "", "Спрайт " + key);
        option.value = key;
        if (asset.texKey == key) { option.setAttribute("selected", "selected"); }
        this.assetFormTexture.appendChild(option);
    }

    color = this.rgbToHex(asset.alphaColor);
    this.assetFormAlphaColor.value = color;
    this.assetFormAlphaColorBox.style.backgroundColor = "#" + color;

    // final actions
    this.sideMenuEditorTxt.style.display = "none";
    this.assetForm.style.display = "block";
    this.sideMenuEditorDelete.style.display = "block";
    this.sideMenuEditorDelete.style.cursor = "pointer";
};

SideMenuController.prototype.activateParticlesForm = function()
{
    let particles = this.particles[this.selected];

    this.sideMenuEditorTitle.innerHTML = particles.name;

    for (let i = 0; i < 3; ++i)
    {
        this.particlesFormCenter[i].value = particles.center[i];
        this.particlesFormRange[i].value = particles.range[i];
        this.particlesFormRot[i].value = particles.rot[i];

        this.particlesFormAvgRot[i].value = particles.avgRot[i]*50;
    }

    this.particlesFormDensity.value = particles.density;
    this.particlesFormAvgSpeed.value = particles.avgSpeed;
    this.particlesFormAvgSize.value = particles.avgSize*10;
    this.particlesFormAlpha.value = particles.alpha*100;

    this.particlesFormPathRandCoeff.value = particles.pathRandomizerCoeff*100;
    // todo: fix in 3d
    this.particlesFormMaxDirOffset.value = particles.maxDirOffset[0]*100;
    this.particlesFormAvgSpeedOffset.value = particles.avgSpeedOffset*10;
    this.particlesFormAvgSizeOffset.value = particles.avgSizeOffset*10;
    this.particlesFormAvgRotOffset.value = particles.avgRotOffset*10;

    // base object
    this.particlesFormBaseObject.innerHTML = "";

    for (let key in objectSelectionController.objects.objects)
    {
        let obj = objectSelectionController.objects.objects[key];
        let option = this.buildElement("OPTION", "", obj.name);
        option.value = key;
        if (particles.baseObject.name === obj.name) { option.setAttribute("selected", "selected"); }
        this.particlesFormBaseObject.appendChild(option);
    }

    // additional
    if (particles instanceof PlaneParticles)
    {
        this.particlesFormPlanarDir.style.display = "block";

        for (let i = 0; i < 3; ++i)
        {
            this.particlesFormPlanarDirs[i].value = particles.dir[i]*100;
        }
    }
    else { this.particlesFormPlanarDir.style.display = "none";}

    if (particles instanceof PointParticles)
    {
        this.particlesFormPointDir.style.display = "block";

        for (let i = 0; i < 2; ++i)
        {
            this.particlesFormPointDirs[i].value = particles.hBoundaries[i];
            this.particlesFormPointDirs[i+2].value = particles.vBoundaries[i];
        }
    }
    else { this.particlesFormPointDir.style.display = "none"; }

    // final actions
    this.sideMenuEditorTxt.style.display = "none";
    this.particlesForm.style.display = "block";
    this.sideMenuEditorDelete.style.display = "block";
    this.sideMenuEditorDelete.style.cursor = "pointer";
};

SideMenuController.prototype.activateTexturesView = function()
{
    // viewing image
    this.texturesView.src = imagesController.images[this.selected];

    this.sideMenuEditorTxt.style.display = "none";
    this.texturesEditor.style.display = "block";
    this.sideMenuEditorDelete.style.display = "block";
    this.sideMenuEditorDelete.style.cursor = "pointer";
};