#version 100
precision mediump float;
uniform vec2 pos_avg;
uniform vec2 pos_max;
uniform vec2 pos_min;
uniform vec2 canvas_size;
uniform vec2 pan;
uniform float scale;
attribute float x;
attribute float y;
void main() {
	vec2 delta = (pos_max - pos_min) / 2.0;
	vec2 pos = vec2( x - pos_avg.x, y - pos_avg.y ) / max(delta.x, delta.y)* 0.95;
	pos.x = pos.x / canvas_size.x * canvas_size.y;
	pos = scale* pos;
	pos = pos + pan;
	gl_Position = vec4(pos, 0.0, 1.0);
	gl_PointSize = 0.3* scale* 1.0;
}
