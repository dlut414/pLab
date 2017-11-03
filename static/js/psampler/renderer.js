/* parse string text and render as points */
var dict = {
	POINT_MODE : 0,
	STREAMLINE_MODE : 1,
};
var EPS = 0.0001;
var canvas = document.getElementById('canvas');
var gl;
var mode = dict.POINT_MODE;
var sl;
var program_point;
var program_sl;
var radius;
var data = [];
var selected_col = 0;
var range_max = 1.0, range_min = 0.0;
var pos_avg, pos_max, pos_min;
var pan;
var scale;
var mouse_down = false;
var canvas_size;
// var source_vertex = document.getElementById('vertex-shader').innerHTML;
// var source_fragment = document.getElementById('vertex-shader').innerHTML;
var source_point_vertex = `
	#version 100
	precision mediump float;
	// uniform mat4 vMvp;
	uniform vec2 pos_avg;
	uniform vec2 pos_max;
	uniform vec2 pos_min;
	uniform vec2 canvas_size;
	uniform vec2 pan;
	uniform float scale;
	attribute float type;
	attribute float x;
	attribute float y;
	attribute float s;
	varying float v_type;
	varying float v_s;
	void main() {
		v_type = type;
		v_s = s;
		vec2 delta = (pos_max - pos_min) / 2.0;
		vec2 pos = vec2( x - pos_avg.x, y - pos_avg.y ) / max(delta.x, delta.y)* 0.95;
		pos.x = pos.x / canvas_size.x * canvas_size.y;
		pos = scale* pos;
		pos = pos + pan;
		gl_Position = vec4(pos, 0.0, 1.0);
		gl_PointSize = 0.3* scale* 1.0;
	}
`;
var source_point_fragment = `
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
`;
var source_sl_vertex = `
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
`;
var source_sl_fragment = `
	#version 100
	precision mediump float;
	void main() {
		gl_FragColor = vec4(0, 0, 0, 1);
		return;
	}
`;

gl = setupCanvas_2D();
canvas_size = [gl.drawingBufferWidth, gl.drawingBufferHeight];

function setupShader_2D(program, source_vertex, source_fragment){
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(vertexShader, source_vertex);
	gl.shaderSource(fragmentShader, source_fragment);
	gl.compileShader(vertexShader);
	gl.compileShader(fragmentShader);
	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.detachShader(program, vertexShader);
	gl.detachShader(program, fragmentShader);
	if( !gl.getProgramParameter(program, gl.LINK_STATUS) ){
		alert('Shader program did not link successfully!');
		return;
	}
}
function setupCanvas_2D(){
	gl = canvas.getContext('webgl');
	if(!gl) return null;
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	setupShader_2D(program_point, source_point_vertex, source_point_fragment);
	setupShader_2D(program_sl, source_sl_vertex, source_sl_fragment);
	return gl;
}

function setupData_2D(result){
	var lines = result.split(/(?:\n)+|(?:\r\n)+/);
	if(lines[lines.length-1] == '') lines.splice(lines.length-1, 1);
	var n_cols = lines[0].split(' ').length;
	for(var i=0;i<n_cols;i++) {
		$('#selected_scalar').append('<option value=' + String(i) + '>' + String(i) + '</option>');
		data.push(new Float32Array(lines.length));
	}
	pos_avg = new Float32Array(2);
	pos_max = new Float32Array(2);
	pos_min = new Float32Array(2);
	for(var i=0;i<lines.length;i++){
		var line = lines[i].split(' ');
		var type = Number(line[0]);
		var x = Number(line[1]), y = Number(line[2]);
		var vx = Number(line[3]), vy = Number(line[4]);
		data[0][i] = type;
		data[1][i] = x, data[2][i] = y;
		data[3][i] = vx, data[4][i] = vy;
		for(var j=5;j<n_cols;j++) data[j][i] = Number(line[j]);
		pos_avg[0] += x, pos_avg[1] += y;
		pos_max[0] = pos_max[0] > x ? pos_max[0] : x;
		pos_max[1] = pos_max[1] > y ? pos_max[1] : y;
		pos_min[0] = pos_min[0] < x ? pos_min[0] : x;
		pos_min[1] = pos_min[1] < y ? pos_min[1] : y;
	}
	pos_avg[0] /= lines.length, pos_avg[1] /= lines.length;
	pan = new Float32Array(2);
	scale = 1.0;
}

function render_2D(){
	if( !gl ) {
		alert('WebGL not available!');
		return;
	}
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.useProgram(program_point);
	var vbo_type = gl.createBuffer();
	var vbo_x = gl.createBuffer(), vbo_y = gl.createBuffer(), vbo_s = gl.createBuffer();

	gl.uniform1f(gl.getUniformLocation(program_point, 'range_max'), range_max);
	gl.uniform1f(gl.getUniformLocation(program_point, 'range_min'), range_min);
	gl.uniform2fv(gl.getUniformLocation(program_point, 'pos_avg'), pos_avg);
	gl.uniform2fv(gl.getUniformLocation(program_point, 'pos_max'), pos_max);
	gl.uniform2fv(gl.getUniformLocation(program_point, 'pos_min'), pos_min);
	gl.uniform2fv(gl.getUniformLocation(program_point, 'canvas_size'), canvas_size);
	gl.uniform2fv(gl.getUniformLocation(program_point, 'pan'), pan);
	gl.uniform1f(gl.getUniformLocation(program_point, 'scale'), scale);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_type);
	gl.bufferData(gl.ARRAY_BUFFER, data[0], gl.STATIC_DRAW);
	var type_loc = gl.getAttribLocation(program_point, 'type');
	gl.enableVertexAttribArray(type_loc);
	gl.vertexAttribPointer(type_loc, 1, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_x);
	gl.bufferData(gl.ARRAY_BUFFER, data[1], gl.STATIC_DRAW);
	var x_loc = gl.getAttribLocation(program_point, 'x');
	gl.enableVertexAttribArray(x_loc);
	gl.vertexAttribPointer(x_loc, 1, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_y);
	gl.bufferData(gl.ARRAY_BUFFER, data[2], gl.STATIC_DRAW);
	var y_loc = gl.getAttribLocation(program_point, 'y');
	gl.enableVertexAttribArray(y_loc);
	gl.vertexAttribPointer(y_loc, 1, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_s);
	gl.bufferData(gl.ARRAY_BUFFER, data[selected_col], gl.STATIC_DRAW);
	var s_loc = gl.getAttribLocation(program_point, 's');
	gl.enableVertexAttribArray(s_loc);
	gl.vertexAttribPointer(s_loc, 1, gl.FLOAT, false, 0, 0);
	
	gl.drawArrays(gl.POINTS, 0, data[0].length);
	
	gl.disableVertexAttribArray(type_loc);
	gl.disableVertexAttribArray(x_loc);
	gl.disableVertexAttribArray(y_loc);
	gl.disableVertexAttribArray(s_loc);
}

//functions of STEAMLINE_MODE
function streamline_2D(){
	this.point = point_2D(data[0], data[1], data[2], radius);
	this.linex = [], this.liney = [];
	this.p1 = [0,0], this.p2 = [0,0];
	this.nlines = 1;
	this.len = 0;
	this.rsln = 0.01;
	this.setupStreamline = function(){
		this.linex = [], this.liney = [];
		var dx = (this.p2[0] - this.p1[0]) / (this.nlines + 1);
		var dy = (this.p2[1] - this.p1[1]) / (this.nlines + 1);
		for(var i=1;i<=this.nlines;i++){
			var start = [this.p1[0] + dx* i, this.p1[1] + dy* i];
			var len = 0;
			var fwd = [start[0], start[1]], bwd = [start[0], start[1]];
			var vel = this.point.interp(data[3], data[4], fwd[0], fwd[1]);
			var mvel = Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1]);
			this.linex.push([start[0]]), this.liney.push([start[1]]);
			while(mvel > EPS && len <= this.len){
				fwd[0] += rsln* vel[0], fwd[1] += rsln* vel[1];
				this.linex[linex.length-1].push(fwd[0]), this.liney[liney.length-1].push(fwd[1]);
				mvel = Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1]);
				len += rsln* mvel;
				vel = this.point.interp(data[3], data[4], fwd[0], fwd[1]);;
			}
			len = 0;
			mvel = Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1]);
			this.linex.push([start[0]]), this.liney.push([start[1]]);
			while(mvel > EPS && len < this.len){
				bwd[0] -= rsln* vel[0], bwd[1] -= rsln* vel[1];
				this.linex[linex.length-1].push(bwd[0]), this.liney[liney.length-1].push(bwd[1]);
				mvel = Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1]);
				len += rsln* mvel;
				vel = this.point.interp(data[3], data[4], bwd[0], bwd[1]);;
			}
		}
	};
	this.draw = function(){
		if( !gl ) {
			alert('WebGL not available!');
			return;
		}
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.useProgram(program_sl);
		var vbo_linex = gl.createBuffer(), vbo_liney = gl.createBuffer();

		gl.uniform2fv(gl.getUniformLocation(program_sl, 'pos_avg'), pos_avg);
		gl.uniform2fv(gl.getUniformLocation(program_sl, 'pos_max'), pos_max);
		gl.uniform2fv(gl.getUniformLocation(program_sl, 'pos_min'), pos_min);
		gl.uniform2fv(gl.getUniformLocation(program_sl, 'canvas_size'), canvas_size);
		gl.uniform2fv(gl.getUniformLocation(program_sl, 'pan'), pan);
		gl.uniform1f(gl.getUniformLocation(program_sl, 'scale'), scale);
		for(var i=0;i<this.linex.length && i<this.liney.length;i++){
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo_linex);
			gl.bufferData(gl.ARRAY_BUFFER, this.linex[i], gl.STATIC_DRAW);
			var x_loc = gl.getUniformLocation(program_sl, 'x');
			gl.enableVertexAttribArray(x_loc);
			gl.vertexAttribPointer(x_loc, 1, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo_liney);
			gl.bufferData(gl.ARRAY_BUFFER, this.liney[i], gl.STATIC_DRAW);
			var y_loc = gl.getUniformLocation(program_sl, 'y');
			gl.enableVertexAttribArray(y_loc);
			gl.vertexAttribPointer(y_loc, 1, gl.FLOAT, false, 0, 0);
			
			gl.drawArrays(gl.LINE_STRIP, 0, this.linex[i].length);
			
			gl.disableVertexAttribArray(x_loc);
			gl.disableVertexAttribArray(y_loc);
		}
	};
	return this;
}

//add mouse control using jQuery
function coordInCanvas(evt){
	var x_pixel = evt.pageX - evt.target.offsetLeft;
	var y_pixel = canvas_size[1] - (evt.pageY - evt.target.offsetTop);
	var x_canvas = (x_pixel - canvas_size[0] / 2.0) / (canvas_size[0] / 2.0);
	var y_canvas = (y_pixel - canvas_size[1] / 2.0) / (canvas_size[1] / 2.0);
	return [x_canvas, y_canvas];
}
$('#canvas').mousedown(function(e){
	mouse_down = true;
	this.pre = coordInCanvas(e);
});
$('#canvas').mouseup(function(e){
	mouse_down = false;
});
$('#canvas').mousemove(function(e){
	if(mouse_down){
		var now = coordInCanvas(e);
		pan[0] += now[0] - this.pre[0];
		pan[1] += now[1] - this.pre[1];
		this.pre = now;
		render_2D();
	}
});
$('#canvas').on('wheel', function(e){
	e.stopPropagation();
	e.preventDefault();
	//e.originalEvent depends on the browser!
	if(e.originalEvent.deltaY > 0){
		scale = scale*1.1;
	}
	else{
		scale = scale*0.9 >= 0.1 ? scale*0.9 : 0.1;
	}
	render_2D();
});

//add forms control
$('#selected_scalar').change( function(){
	selected_col = $('#selected_scalar option:selected').val();
	render_2D();
});
$('#range_max').change( function(){
	range_max = $('#range_max').val();
	render_2D();
});
$('#range_min').change( function(){
	range_min = $('#range_min').val();
	render_2D();
});