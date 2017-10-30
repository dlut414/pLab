#version 330 core
uniform mat4 vMvp;
uniform mat4 vModelMat;
uniform mat4 vViewMat;
uniform mat4 vProjectionMat;

layout(location = 0) in int vType;
layout(location = 1) in float vPosX;
layout(location = 2) in float vPosY;
layout(location = 3) in float vS1;
layout(location = 4) in float vS2;

flat out int fType;
out vec4 fPos;
out float fS1;
out float fS2;

void main() {
	vec3 pos = vec3(vPosX, vPosY, 0.0f);
	fType = vType;
	fPos = vMvp * vec4(pos, 1.0f);

	fS1 = vS1;
	fS2 = vS2;

	gl_Position = fPos;
	gl_PointSize = 2.0f;
}