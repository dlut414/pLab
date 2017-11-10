#version 100
precision mediump float;
uniform float range_max;
uniform float range_min;
varying float v_type;
varying float v_s;
const float EPS = 0.01;
const vec4 white = vec4(1.0, 1.0, 1.0, 1.0);
const vec4 red = vec4(1.0, 0.0, 0.0, 1.0);
const vec4 green = vec4(0.0, 1.0, 0.0, 1.0);
const vec4 blue = vec4(0.0, 0.0, 1.0, 1.0);
void paintRGB();
void main() {
	paintRGB();
	//gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
}

void paintRGB() {
	float range = range_max - range_min;
	float s_normalized = (v_s - range_min) / range;
	if (abs(v_type) <= EPS) {
		gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
	}
	else {
		if (s_normalized >= 0.0 && s_normalized < 0.5)
			gl_FragColor = 2.0 * ((0.5 - s_normalized)* blue + s_normalized* green);
		else if (s_normalized >= 0.5 && s_normalized < 1.0)
			gl_FragColor = 2.0 * ((1.0 - s_normalized)* green + (s_normalized - 0.5)* red);
		else if (s_normalized < 0.0)
			gl_FragColor = blue;
		else
			gl_FragColor = red;
	}
	gl_FragColor.a = 1.0;
}
