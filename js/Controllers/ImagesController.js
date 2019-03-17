var imagesController;

ImagesController = function()
{
    // a map of images
    this.images = {};
    this.size = 0;

    this.uploadPrompt = document.getElementById("image-upload-prompt");
    this.uploadPromptErrorMsg = document.getElementById("image-upload-prompt-error-msg");
    this.uploadInput = document.getElementById("image-upload-prompt-input");
    this.uploadPreview = document.getElementById("image-upload-prompt-preview");
    this.uploadBtn = document.getElementById("image-upload-prompt-btn");

    canvas.addEventListener("click", this.cancelJPGUpload.bind(this), false);
    this.uploadInput.addEventListener("change", this.previewJPG.bind(this), false);
    this.uploadBtn.addEventListener("click", this.uploadJPG.bind(this), false);
};

ImagesController.prototype.requestJPGUpload = function()
{
    this.uploadPrompt.style.display = "block";
    this.uploadPromptErrorMsg.style.display = "none";
    this.uploadPreview.src = "";
};

ImagesController.prototype.previewJPG = function()
{
    let reader = new FileReader();
    let preview = this.uploadPreview;

    function processUploaded()
    {
        preview.src = reader.result;
        reader.removeEventListener("loadend", processUploaded);
    }

    reader.addEventListener("loadend", processUploaded);

    reader.readAsDataURL(this.uploadInput.files[0]);
};

ImagesController.prototype.uploadJPG = function()
{
    // todo: add validation whether it is a JPG/JPEG or not
    // checking if something is actually uploaded
    if (this.uploadPreview.src !== "")
    {
        // validates it so webGL could produce the MipMap
        if (isPowerOfTwo(this.uploadPreview.clientWidth) && isPowerOfTwo(this.uploadPreview.clientHeight))
        {
            this.images[this.size++] = this.uploadPreview.src;
            this.cancelJPGUpload();

            // updating side menu
            sideMenu.switchToTextures();
        }
        // outputting an error message
        else { this.uploadPromptErrorMsg.style.display = "block"; }
    }
};

// todo: test
ImagesController.prototype.removeJPG = function(key)
{
    delete this.images[key];
};

ImagesController.prototype.cancelJPGUpload = function()
{
    this.uploadPrompt.style.display = "none";
    this.uploadPromptErrorMsg.style.display = "none";
    this.uploadPreview.src = "";
};