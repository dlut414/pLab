/* parse string text and render as points */
var dict = {
	POINT_MODE : 0,
	STREAMLINE_MODE : 1,
};
var EPS = 0.0001;
var canvas = document.getElementById('canvas');
var gl;
var mode = dict.POINT_MODE;
var point_drawer, streamline_drawer, colorPicker;
var data = [];
var selected_col = 0;
var range_max = 1.0, range_min = 0.0;
var pos_avg, pos_max, pos_min;
var pan;
var scale;
var point_size = Number($('#point_size').val());
var mouse_down = false;
var canvas_size;
var mousePos = [0, 0];
// var source_point_vertex = document.getElementById('point-vertex-shader').innerHTML;
// var source_point_fragment = document.getElementById('point-fragment-shader').innerHTML;
// var source_sl_vertex = document.getElementById('sl-vertex-shader').innerHTML;
// var source_sl_fragment = document.getElementById('sl-fragment-shader').innerHTML;
var source_colorPick_fragment = `
	#version 100
	precision mediump float;
	uniform vec3 color;
	void main() {
		gl_FragColor = vec4(color, 1.0);
	}
`;
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
	uniform float point_size;
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
		float scaled_pointSize = scale* point_size;
		gl_Position = vec4(pos, 0.0, 1.0);
		gl_PointSize = 0.3* scaled_pointSize;
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
	}
`;

gl = setupCanvas_2D();
canvas_size = [gl.drawingBufferWidth, gl.drawingBufferHeight];

function setupShader_2D(source_vertex, source_fragment){
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(vertexShader, source_vertex);
	gl.shaderSource(fragmentShader, source_fragment);
	gl.compileShader(vertexShader);
	gl.compileShader(fragmentShader);
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.detachShader(program, vertexShader);
	gl.detachShader(program, fragmentShader);
	if( !gl.getProgramParameter(program, gl.LINK_STATUS) ){
		alert('Shader program did not link successfully!');
		return;
	}
	return program;
}
function setupCanvas_2D(){
	gl = canvas.getContext('webgl');
	if(!gl) return null;
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	return gl;
}

function setupData_2D(result){
	//clear existing global data
	pos_avg = new Float32Array(2);
	pos_max = new Float32Array(2);
	pos_min = new Float32Array(2);
	data = [];
	var lines = result.split(/[\n]+|[\r\n]+/);
	if(lines[lines.length-1] == '') lines.splice(lines.length-1, 1);
	var n_cols = lines[0].split(/[\s]+|[\,]/).length;
	$($('#selected_scalar option')).remove();
	for(var i=0;i<n_cols;i++) {
		$('#selected_scalar').append('<option value=' + String(i) + '>' + String(i) + '</option>');
		data.push(new Float32Array(lines.length));
	}
	for(var i=0;i<lines.length;i++){
		var line = lines[i].split(/[\s]+|[\,]/);
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
	point_drawer = new point_2D();
	streamline_drawer = new streamline_2D();
	colorPicker = new colorPick();
}
function render_2D() {
  switch (mode) {
    case dict.STREAMLINE_MODE:
      streamline_drawer.draw();
      break;
    case dict.POINT_MODE:
    default:
      point_drawer.draw();
  }
}

//functions of POINT_MODE
function point_2D(){
	this.program = setupShader_2D(source_point_vertex, source_point_fragment);
	this.draw = function(){
		if( !gl ) {
			alert('WebGL not available!');
			return;
		}
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.useProgram(this.program);
		var vbo_type = gl.createBuffer();
		var vbo_x = gl.createBuffer(), vbo_y = gl.createBuffer(), vbo_s = gl.createBuffer();

		gl.uniform1f(gl.getUniformLocation(this.program, 'range_max'), range_max);
		gl.uniform1f(gl.getUniformLocation(this.program, 'range_min'), range_min);
		gl.uniform2fv(gl.getUniformLocation(this.program, 'pos_avg'), pos_avg);
		gl.uniform2fv(gl.getUniformLocation(this.program, 'pos_max'), pos_max);
		gl.uniform2fv(gl.getUniformLocation(this.program, 'pos_min'), pos_min);
		gl.uniform2fv(gl.getUniformLocation(this.program, 'canvas_size'), canvas_size);
		gl.uniform2fv(gl.getUniformLocation(this.program, 'pan'), pan);
		gl.uniform1f(gl.getUniformLocation(this.program, 'scale'), scale);
		gl.uniform1f(gl.getUniformLocation(this.program, 'point_size'), point_size);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_type);
		gl.bufferData(gl.ARRAY_BUFFER, data[0], gl.STATIC_DRAW);
		var type_loc = gl.getAttribLocation(this.program, 'type');
		gl.enableVertexAttribArray(type_loc);
		gl.vertexAttribPointer(type_loc, 1, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_x);
		gl.bufferData(gl.ARRAY_BUFFER, data[1], gl.STATIC_DRAW);
		var x_loc = gl.getAttribLocation(this.program, 'x');
		gl.enableVertexAttribArray(x_loc);
		gl.vertexAttribPointer(x_loc, 1, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_y);
		gl.bufferData(gl.ARRAY_BUFFER, data[2], gl.STATIC_DRAW);
		var y_loc = gl.getAttribLocation(this.program, 'y');
		gl.enableVertexAttribArray(y_loc);
		gl.vertexAttribPointer(y_loc, 1, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_s);
		gl.bufferData(gl.ARRAY_BUFFER, data[selected_col], gl.STATIC_DRAW);
		var s_loc = gl.getAttribLocation(this.program, 's');
		gl.enableVertexAttribArray(s_loc);
		gl.vertexAttribPointer(s_loc, 1, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.POINTS, 0, data[0].length);
		
		gl.disableVertexAttribArray(type_loc);
		gl.disableVertexAttribArray(x_loc);
		gl.disableVertexAttribArray(y_loc);
		gl.disableVertexAttribArray(s_loc);
	};
	return this;
}
function streamline_2D() {
  return (
    (this.linex = []),
    (this.liney = []),
    (this.radius = +$("#radius").val()),
    (this.p1 = [+$("#p1x").val(), +$("#p1y").val()]),
    (this.p2 = [+$("#p2x").val(), +$("#p2y").val()]),
    (this.nlines = +$("#nlines").val()),
    (this.slen = +$("#slen").val()),
    (this.rsln = +$("#rsln").val()),
    (this.program = setupShader_2D(source_sl_vertex, source_sl_fragment)),
    (this.setupStreamline = function() {
      (this.point = new pointCloud_2D(data[0], data[1], data[2], this.radius)),
        (this.linex = []),
        (this.liney = []);
      for (
        var a = [],
          c = [],
          d = (this.p2[0] - this.p1[0]) / (this.nlines + 1),
          f = (this.p2[1] - this.p1[1]) / (this.nlines + 1),
          h = 1;
        h <= this.nlines;
        h++
      ) {
        var k = [this.p1[0] + d * h, this.p1[1] + f * h],
          l = 0,
          m = [k[0], k[1]],
          n = [k[0], k[1]],
          o = this.point.interp(data[3], data[4], m[0], m[1]),
          q = Math.sqrt(o[0] * o[0] + o[1] * o[1]);
        for (a.push([k[0]]), c.push([k[1]]); q > EPS && l <= this.slen; ) {
          (m[0] += this.rsln * o[0]),
            (m[1] += this.rsln * o[1]),
            a[a.length - 1].push(m[0]),
            c[c.length - 1].push(m[1]),
            (q = Math.sqrt(o[0] * o[0] + o[1] * o[1])),
            (l += this.rsln * q),
            (o = this.point.interp(data[3], data[4], m[0], m[1]));
        }
        for (
          l = 0,
            q = Math.sqrt(o[0] * o[0] + o[1] * o[1]),
            a.push([k[0]]),
            c.push([k[1]]);
          q > EPS && l < this.slen;

        ) {
          (n[0] -= this.rsln * o[0]),
            (n[1] -= this.rsln * o[1]),
            a[a.length - 1].push(n[0]),
            c[c.length - 1].push(n[1]),
            (q = Math.sqrt(o[0] * o[0] + o[1] * o[1])),
            (l += this.rsln * q),
            (o = this.point.interp(data[3], data[4], n[0], n[1]));
        }
      }
      for (var h = 0; h < a.length && h < c.length; h++) {
        this.linex.push(new Float32Array(a[h])),
          this.liney.push(new Float32Array(c[h]));
      }
      for (var s = [], t = [], h = 0; h < data[0].length; h++) {
        0 == data[0][h] && (s.push(data[1][h]), t.push(data[2][h]));
      }
      (this.dummyX = new Float32Array(s)), (this.dummyY = new Float32Array(t));
    }),
    (this.draw = function() {
      if (!gl) return void alert("WebGL not available!");
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT),
        gl.useProgram(this.program);
      var a = gl.createBuffer(),
        c = gl.createBuffer();
      gl.uniform2fv(gl.getUniformLocation(this.program, "pos_avg"), pos_avg),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pos_max"), pos_max),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pos_min"), pos_min),
        gl.uniform2fv(
          gl.getUniformLocation(this.program, "canvas_size"),
          canvas_size
        ),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pan"), pan),
        gl.uniform1f(gl.getUniformLocation(this.program, "scale"), scale);
      for (var d = 0; d < this.linex.length && d < this.liney.length; d++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, a),
          gl.bufferData(gl.ARRAY_BUFFER, this.linex[d], gl.STATIC_DRAW);
        var f = gl.getAttribLocation(this.program, "x");
        gl.enableVertexAttribArray(f),
          gl.vertexAttribPointer(f, 1, gl.FLOAT, !1, 0, 0),
          gl.bindBuffer(gl.ARRAY_BUFFER, c),
          gl.bufferData(gl.ARRAY_BUFFER, this.liney[d], gl.STATIC_DRAW);
        var h = gl.getAttribLocation(this.program, "y");
        gl.enableVertexAttribArray(h),
          gl.vertexAttribPointer(h, 1, gl.FLOAT, !1, 0, 0),
          gl.drawArrays(gl.LINE_STRIP, 0, this.linex[d].length),
          gl.disableVertexAttribArray(f),
          gl.disableVertexAttribArray(h);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, a),
        gl.bufferData(gl.ARRAY_BUFFER, this.dummyX, gl.STATIC_DRAW);
      var f = gl.getAttribLocation(this.program, "x");
      gl.enableVertexAttribArray(f),
        gl.vertexAttribPointer(f, 1, gl.FLOAT, !1, 0, 0),
        gl.bindBuffer(gl.ARRAY_BUFFER, c),
        gl.bufferData(gl.ARRAY_BUFFER, this.dummyY, gl.STATIC_DRAW);
      var f = gl.getAttribLocation(this.program, "y");
      gl.enableVertexAttribArray(h),
        gl.vertexAttribPointer(h, 1, gl.FLOAT, !1, 0, 0),
        gl.drawArrays(gl.POINTS, 0, this.dummyX.length),
        gl.disableVertexAttribArray(f),
        gl.disableVertexAttribArray(h);
    }),
    this
  );
}

//function of mouse point intersection (render id to color)
function colorPick(){
	this.program = setupShader_2D(source_point_vertex, source_colorPick_fragment);
	this.pick = function(x, y){
		if( !gl ) {
			alert('WebGL not available!');
			return;
		}
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.useProgram(this.program);
		var vbo_type = gl.createBuffer();
		var vbo_x = gl.createBuffer(), vbo_y = gl.createBuffer();

		gl.uniform1f(gl.getUniformLocation(this.program, 'range_max'), range_max);
		gl.uniform1f(gl.getUniformLocation(this.program, 'range_min'), range_min);
		gl.uniform2fv(gl.getUniformLocation(this.program, 'pos_avg'), pos_avg);
		gl.uniform2fv(gl.getUniformLocation(this.program, 'pos_max'), pos_max);
		gl.uniform2fv(gl.getUniformLocation(this.program, 'pos_min'), pos_min);
		gl.uniform2fv(gl.getUniformLocation(this.program, 'canvas_size'), canvas_size);
		gl.uniform2fv(gl.getUniformLocation(this.program, 'pan'), pan);
		gl.uniform1f(gl.getUniformLocation(this.program, 'scale'), scale);
		gl.uniform1f(gl.getUniformLocation(this.program, 'point_size'), point_size);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_x);
		gl.bufferData(gl.ARRAY_BUFFER, data[1], gl.STATIC_DRAW);
		var x_loc = gl.getAttribLocation(this.program, 'x');
		gl.enableVertexAttribArray(x_loc);
		gl.vertexAttribPointer(x_loc, 1, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_y);
		gl.bufferData(gl.ARRAY_BUFFER, data[2], gl.STATIC_DRAW);
		var y_loc = gl.getAttribLocation(this.program, 'y');
		gl.enableVertexAttribArray(y_loc);
		gl.vertexAttribPointer(y_loc, 1, gl.FLOAT, false, 0, 0);
		
		for(var p=0;p<data[0].length;p++){
			var r = ((p & 0x000000FF) >> 0) / 255.0;
			var g = ((p & 0x0000FF00) >> 8) / 255.0;
			var b = ((p & 0x00FF0000) >> 16) / 255.0;
			gl.uniform3fv(gl.getUniformLocation(this.program, 'color'), [r,g,b]);
			gl.drawArrays(gl.POINTS, p, 1);
		}
		
		gl.disableVertexAttribArray(x_loc);
		gl.disableVertexAttribArray(y_loc);
		gl.flush();
		gl.finish();
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		var pixels = new Uint8Array(4);
		gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		return pixels[0] + (pixels[1] << 8) + (pixels[2] << 16);
	};
	return this;
}
function coordInCanvas(a) {
  var c = a.pageX - a.target.offsetLeft,
    d = canvas_size[1] - (a.pageY - a.target.offsetTop),
    f = (c - canvas_size[0] / 2) / (canvas_size[0] / 2),
    h = (d - canvas_size[1] / 2) / (canvas_size[1] / 2);
  return [f, h];
}

$('#canvas').mousedown(function(e){
	mouse_down = true;
	this.pre = coordInCanvas(e);
});
$('#canvas').mouseup(function(e){
	mouse_down = false;
	if(mode == dict.POINT_MODE){
		var p = colorPicker.pick(e.pageX - e.target.offsetLeft, canvas_size[1] - (e.pageY - e.target.offsetTop));
		//console.log(p);
		var attribPanel = $('#attribPanel');
		try{
			attribPanel.html('<ul>' + 
				'<li>' + 'type: ' + data[0][p] + '</li>' + 
				'<li>' + 'x: ' + data[1][p].toFixed(4) + '  |  y: ' + data[2][p].toFixed(4) + '</li>' + 
				'<li>' + 'vx: ' + data[2][p].toFixed(4) + '  |  vy: ' + data[3][p].toFixed(4) + '</li>' + 
				'<li>' + 'scalar: ' + data[selected_col][p].toFixed(4) + '</li>' + '</ul>');
			attribPanel.show('fast');
		}
		catch(e){
			attribPanel.html('<ul>' + 
				'<li>' + 'type: ' + data[0][p] + '</li>' + 
				'<li>' + 'x: ' + data[1][p] + '  |  y: ' + data[2][p] + '</li>' + 
				'<li>' + 'vx: ' + data[2][p] + '  |  vy: ' + data[3][p] + '</li>' + 
				'<li>' + 'scalar: ' + data[selected_col][p] + '</li>' + '</ul>');
			attribPanel.show('fast');			
		}
		finally{
			point_drawer.draw();
		}
	}
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
	if(e.originalEvent.deltaY < 0){
		scale = scale*1.1;
	}
	else{
		scale = scale*0.9 >= 0.1 ? scale*0.9 : 0.1;
	}
	render_2D();
});

//add forms control
$('#selected_scalar').change( function(){
	selected_col = Number($('#selected_scalar option:selected').val());
	render_2D();
});
$('#range_max').change( function(){
	range_max = Number($('#range_max').val());
	render_2D();
});
$('#range_min').change( function(){
	range_min = Number($('#range_min').val());
	render_2D();
});
$('#point_size').change( function(){
	point_size = Number($('#point_size').val());
	render_2D();
});
$('#radius').change(function(){
	streamline_drawer.radius = Number($('#radius').val());
});
$('#nlines').change(function(){
	streamline_drawer.nlines = Number($('#nlines').val());
});
$('#slen').change(function(){
	streamline_drawer.slen = Number($('#slen').val());
});
$('#rsln').change(function(){
	streamline_drawer.rsln = Number($('#rsln').val());
});
$('#p1x').change(function(){
	streamline_drawer.p1[0] = Number($('#p1x').val());
});
$('#p1y').change(function(){
	streamline_drawer.p1[1] = Number($('#p1y').val());
});
$('#p2x').change(function(){
	streamline_drawer.p2[0] = Number($('#p2x').val());
});
$('#p2y').change(function(){
	streamline_drawer.p2[1] = Number($('#p2y').val());
});

//mode selection
$('#mode').change(function(){
	var form_pt = $('#form-point');
	var form_sl = $('#form-streamline');
	if ( $('#radio-pt').is(':checked') ){
		form_pt.show('fast');
		form_sl.hide('fast');
		mode = dict.POINT_MODE;
		render_2D();
	}
	else if( $('#radio-sl').is(':checked') ){
		form_sl.show('fast');
		form_pt.hide('fast');
		$('#attribPanel').hide('fast');
		mode = dict.STREAMLINE_MODE;
		//use input button to render streamline
		// streamline_drawer.setupStreamline();
		// render_2D();
	}
});

//render button
$('#button-render').click(function(){
	streamline_drawer.setupStreamline();
	render_2D();
});
