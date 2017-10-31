/* parse string text and render as points */
var gl;
var program0;
var type_arr = [], x_arr = [], y_arr = [], vx_arr = [], vy_arr = [], s_arr = [];
// var source_vertex = document.getElementById('vertex-shader').innerHTML;
// var source_fragment = document.getElementById('vertex-shader').innerHTML;
var source_vertex = `
	#version 100
	precision mediump float;
	// uniform mat4 vMvp;
	attribute float type;
	attribute float x;
	attribute float y;
	attribute float s;
	// varying float v_type;
	// varying float v_s;
	void main() {
		// v_type = type;
		// v_s = s;
		gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
		gl_PointSize = 20.0;
	}
`;
var source_fragment = `
	#version 100
	precision mediump float;
	// uniform float sRangeMax;
	// uniform float sRangeMin;
	// varying float v_type;
	// varying float v_s;
	const float EPS = 0.01;
	const vec4 white = vec4(1.0, 1.0, 1.0, 1.0);
	const vec4 red = vec4(1.0, 0.0, 0.0, 1.0);
	const vec4 green = vec4(0.0, 1.0, 0.0, 1.0);
	const vec4 blue = vec4(0.0, 0.0, 1.0, 1.0);
	// void paintRGB();
	void main() {
		//paintRGB();
		gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
	}
	
	// void paintRGB() {
		// float range = sRangeMax - sRangeMin;
		// float s_normalized = (v_s - sRangeMin) / range;
		// if (abs(v_type) <= EPS) {
			// gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
		// }
		// else {
			// if (s_normalized >= 0.0 && s_normalized < 0.5)
				// gl_FragColor = 2.0 * ((0.5 - s_normalized)* blue + s_normalized* green);
			// else if (s_normalized >= 0.5 && s_normalized < 1.0)
				// gl_FragColor = 2.0 * ((1.0 - s_normalized)* green + (s_normalized - 0.5)* red);
			// else if (s_normalized < 0.0)
				// gl_FragColor = blue;
			// else
				// gl_FragColor = red;
		// }
		// gl_FragColor.a = 1.0;
	// }
`;

function render_2D(result){
	var lines = result.split('\n');
	for(var i=0;i<lines.length;i++){
		var line = lines[i].split(' ');
		var type = Number(line[0]), 
				x = Number(line[1]), y = Number(line[2]), 
				vx = Number(line[3]), vy = Number(line[4]), s = Number(line[5]);
		type_arr.push(type);
		x_arr.push(x), y_arr.push(y);
		vx_arr.push(vx), vy_arr.push(vy), s_arr.push(s);
	}
	if( !(gl = setupCanvas()) ) {
		alert('WebGL not available!');
		return;
	}
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	setupShader();
	
	gl.useProgram(program0);
	var vbo_type = gl.createBuffer();
	var vbo_x = gl.createBuffer(), vbo_y = gl.createBuffer(), vbo_s = gl.createBuffer();
	
	// gl.uniform1f(gl.getUniformLocation(program0, 'sRangeMax'), sRangeMax);
	// gl.uniform1f(gl.getUniformLocation(program0, 'sRangeMin'), sRangeMin);
	// gl.uniformMatrix4fv(gl.getUniformLocation(program0, 'vMvp'), false, vMvp);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_type);
	gl.bufferData(gl.ARRAY_BUFFER, type_arr, gl.STATIC_DRAW);
	var type_loc = gl.getAttribLocation(program0, 'type');
	gl.enableVertexAttribArray(type_loc);
	gl.vertexAttribPointer(type_loc, 1, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_x);
	gl.bufferData(gl.ARRAY_BUFFER, x_arr, gl.STATIC_DRAW);
	var x_loc = gl.getAttribLocation(program0, 'x');
	gl.enableVertexAttribArray(x_loc);
	gl.vertexAttribPointer(x_loc, 1, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_y);
	gl.bufferData(gl.ARRAY_BUFFER, y_arr, gl.STATIC_DRAW);
	var y_loc = gl.getAttribLocation(program0, 'y');
	gl.enableVertexAttribArray(y_loc);
	gl.vertexAttribPointer(y_loc, 1, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_s);
	gl.bufferData(gl.ARRAY_BUFFER, s_arr, gl.STATIC_DRAW);
	var s_loc = gl.getAttribLocation(program0, 's');
	gl.enableVertexAttribArray(s_loc);
	gl.vertexAttribPointer(s_loc, 1, gl.FLOAT, false, 0, 0);
	
	
	gl.drawArrays(gl.POINTS, 0, s_arr.length);
	
	gl.disableVertexAttribArray(type_loc);
	gl.disableVertexAttribArray(x_loc);
	gl.disableVertexAttribArray(y_loc);
	gl.disableVertexAttribArray(s_loc);
	
	//gl.useProgram(0);
}

function setupCanvas(){
	var canvas = document.getElementById('canvas');
	gl = canvas.getContext('webgl');
	if(!gl) return null;
	gl.enable(gl.TEXTURE_1D);
	gl.enable(gl.TEXTURE_2D);
	gl.enable(gl.TEXTURE_3D);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.enable(gl.POINT_SPRITE_ARB);
	gl.enable(gl.VERTEX_PROGRAM_POINT_SIZE);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	return gl;
}

function setupShader(){
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(vertexShader, source_vertex);
	gl.shaderSource(fragmentShader, source_fragment);
	gl.compileShader(vertexShader);
	gl.compileShader(fragmentShader);
	program0 = gl.createProgram();
	gl.attachShader(program0, vertexShader);
	gl.attachShader(program0, fragmentShader);
	gl.linkProgram(program0);
	gl.detachShader(program0, vertexShader);
	gl.detachShader(program0, fragmentShader);
	if( !gl.getProgramParameter(program0, gl.LINK_STATUS) ){
		alert('Shader program0 did not link successfully!');
		return;
	}
}



