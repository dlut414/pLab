/* parse string text and render as points */
var gl;
var program0;
var type_arr = [], x_arr = [], y_arr = [], vx_arr = [], vy_arr = [], s_arr = [];

var source_vertex = "";
var source_fragment = "";
alert('here');
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
	gl.clearColor(1.0, 1.0, 1.0, 0.0);
	return gl;
}

// function setupShader(){
	// var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	// var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	// gl.shaderSource(vertexShader, source_vertex);
	// gl.shaderSource(fragmentShader, source_fragment);
	// gl.compileShader(vertexShader);
	// gl.compileShader(fragmentShader);
	// program0 = gl.createProgram();
	// gl.attachShader(program0, vertexShader);
	// gl.attachShader(program0, fragmentShader);
	// gl.linkProgram(program0);
	// gl.detachShader(program0, vertexShader);
	// gl.detachShader(program0, fragmentShader);
	// if( !gl.getProgramParameter(program0, gl.LINK_STATUS) ){
		// alert('Shader program did not link successfully!');
		// return;
	// }
// }



