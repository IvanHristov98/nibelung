PerlinShader = function()
{};

PerlinShader.vShader =
    'uniform mat4 uProjectionMatrix;'+
    'uniform mat4 uViewMatrix;'+
    'uniform mat4 uModelMatrix;'+
    '' +
    'attribute vec3 aXYZ;' +
    'attribute vec3 aColor;' +
    '' +
    'varying vec3 vColor;' +
    'varying vec3 vXYZ;' +
    ''+
    'void main ()'+
    '{'+
    '	mat4 mvMatrix = uViewMatrix * uModelMatrix;'+
    '	gl_Position = uProjectionMatrix * mvMatrix * vec4(aXYZ,1);'+
    ''+
    '	vColor = aColor;' +
    '	vXYZ = aXYZ;'+
    '}';

PerlinShader.fShader =
    'precision mediump float;' +
    '' +
    '' +
    'uniform vec2 uGradientTL;' +
    'uniform vec2 uGradientTR;' +
    'uniform vec2 uGradientBL;' +
    'uniform vec2 uGradientBR;' +
    '' +
    'uniform vec2 uGridPointTL;' +
    'uniform vec2 uGridPointTR;' +
    'uniform vec2 uGridPointBL;' +
    'uniform vec2 uGridPointBR;' +
    '' +
    'uniform float uMaxNoiseHeight;' +
    'uniform float uGroundOffset;' +
    '' +
    'varying vec3 vColor;' +
    'varying vec3 vXYZ;' +
    '' +
    'float smoothFrac(float frac)' +
    '{' +
    '	return 6.0*pow(frac,5.0)-15.0*pow(frac,4.0)+10.0*pow(frac,3.0);' +
    '}' +
    '' +
    'void main( )'+
    '{' +
    '' +
    '	float dotProductTL = min(dot(uGradientTL, vXYZ.xy - uGridPointTL)/2.0 + uGroundOffset, uMaxNoiseHeight);' +
    '	float dotProductTR = min(dot(uGradientTR, vXYZ.xy - uGridPointTR)/2.0 + uGroundOffset, uMaxNoiseHeight);' +
    '	float dotProductBL = min(dot(uGradientBL, vXYZ.xy - uGridPointBL)/2.0 + uGroundOffset, uMaxNoiseHeight);' +
    '	float dotProductBR = min(dot(uGradientBR, vXYZ.xy - uGridPointBR)/2.0 + uGroundOffset, uMaxNoiseHeight);' +
    '' +
    '	float fracX = smoothFrac(abs(vXYZ.x - uGridPointBL.x));' +
    '	float fracY = smoothFrac(abs(vXYZ.y + uGridPointBL.y));' +
    '' +
    '	float sideErp1 = mix(dotProductTL, dotProductTR, fracX);' +
    '	float sideErp2 = mix(dotProductBL, dotProductBR, fracX);' +
    '' +
    '	float avgErp = mix(sideErp1, sideErp2, fracY);' +
    ''+
    '	gl_FragColor = vec4(avgErp*vColor,1.0);'+
    '}';
