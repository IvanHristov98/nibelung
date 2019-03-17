FlatShader = function() {};

FlatShader.vShader =
    "uniform mat4 uProjectionMatrix;" +
    "uniform mat4 uViewMatrix;" +
    "uniform mat4 uModelMatrix;" +
    "uniform float uPointSize;" +
    "" +
    "attribute vec3 aXYZ;" +
    "attribute vec3 aColor;" +
    "" +
    "varying vec3 vColor;" +
    "" +
    "void main()" +
    "{" +
    "   mat4 mvMatrix = uViewMatrix * uModelMatrix;" +
    "   gl_Position = uProjectionMatrix * mvMatrix * vec4(aXYZ,1.0);" +
    "   gl_PointSize = uPointSize;" +
    "" +
    "   vColor = aColor;" +
    "}";

FlatShader.fShader =
    "precision highp float;" +
    "" +
    "varying vec3 vColor;" +
    "uniform float uPointSize;" +
    "uniform bool uUseCircleMode;" +
    "" +
    "void main()" +
    "{" +
    "   float alpha = 1.0;" +
    "" +
    "   if (uUseCircleMode)" +
    "   {" +
    "       vec2 centerXY = 2.0*gl_PointCoord - 1.0;" +
    "       float eps = 0.03*uPointSize;" +
    "       alpha = 0.0;" +
    "       float dist = dot(centerXY, centerXY);" +
    "" +
    "       alpha = 1.0 - smoothstep(1.0-eps, 1.0 + eps, dist);" +
    "   }" +
    "" +
    "   if (alpha < 0.2) { discard;}" +
    "" +
    "   gl_FragColor = alpha * vec4(vColor, 1.0);" +
    "}"
    ;