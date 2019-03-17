DiffuseShader = function() {};

DiffuseShader.vShader =
    "const int NUM_LIGHTS = 5;" +
    "" +
    "uniform mat4 uModelMatrix;" +
    "uniform mat4 uViewMatrix;" +
    "uniform mat4 uProjectionMatrix;" +
    "uniform vec3 uDirectionalLights[NUM_LIGHTS];" +
    "uniform vec3 uAmbientColor;" +
    "uniform vec3 uDiffuseColor;" +
    "" +
    "attribute vec3 aXYZ;" +
    "attribute vec3 aNormal;" +
    "attribute vec2 aST;" +
    "attribute vec3 aColor;" +
    "" +
    "varying vec2 vST;" +
    "varying vec3 vColor;" +
    "" +
    "void main()" +
    "{" +
    "   mat4 mvMatrix = uViewMatrix*uModelMatrix;" +
    "   gl_Position = uProjectionMatrix*mvMatrix*vec4(aXYZ, 1.0);" +
    "" +
    "   vColor = aColor * uAmbientColor;" +
    "   vec3 normal = vec3(normalize(mvMatrix*vec4(aNormal, 0.0)));" +
    "" +
    "   for (int i = 0; i < NUM_LIGHTS; i++)" +
    "   {" +
    "       vec3 light = normalize(-uDirectionalLights[i]);" +
    "       vColor += aColor*uDiffuseColor*max(dot(light, normal), 0.0);" +
    "   }" +
    "" +
    "   vST = aST;" +
    "}";

DiffuseShader.fShader =
    "precision mediump float;" +
    "" +
    "uniform sampler2D uSampler;" +
    "uniform sampler2D uAlphaSampler;" +
    "uniform mat3 uTexMatrix;" +
    "uniform float uAlpha;" +
    "uniform bool uUseTex;" +
    "uniform bool uUseAlphaMap;" +
    "uniform vec3 uAlphaColor;" +
    "" +
    "varying vec2 vST;" +
    "varying vec3 vColor;" +
    "" +
    "float alphaErp(float num)" +
    "{" +
    "   return max(-32.0 + 126.0*num - 120.0*num*num, 0.0)/2.0;" +
    "}" +
    "" +
    "void main()" +
    "{" +
    "   vec4 color = vec4(1.0);" +
    "   if (uUseTex)" +
    "   {" +
    "       color *= texture2D(uSampler, (uTexMatrix*vec3(vST, 1.0)).st);" +
    "   }" +
    "" +
    "   if (uUseAlphaMap)" +
    "   {" +
    "       vec4 alphaVal = texture2D(uAlphaSampler, (uTexMatrix*vec3(vST, 1.0)).st);" +
    "       if (alphaVal.x < 0.5) { discard; }" +
    "       color += alphaErp(alphaVal.x)*vec4(uAlphaColor,1.0);" +
    "   }" +
    "   gl_FragColor = color*vec4(vColor, uAlpha);" +
    "}";