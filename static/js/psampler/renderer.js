'use strict';var dict={POINT_MODE:0,STREAMLINE_MODE:1},EPS=1e-4,canvas=document.getElementById('canvas'),gl,mode=dict.POINT_MODE,point_drawer,streamline_drawer,data=[],selected_col=0,range_max=1,range_min=0,pos_avg,pos_max,pos_min,pan,scale,mouse_down=!1,canvas_size,source_point_vertex='\n\t#version 100\n\tprecision mediump float;\n\t// uniform mat4 vMvp;\n\tuniform vec2 pos_avg;\n\tuniform vec2 pos_max;\n\tuniform vec2 pos_min;\n\tuniform vec2 canvas_size;\n\tuniform vec2 pan;\n\tuniform float scale;\n\tattribute float type;\n\tattribute float x;\n\tattribute float y;\n\tattribute float s;\n\tvarying float v_type;\n\tvarying float v_s;\n\tvoid main() {\n\t\tv_type = type;\n\t\tv_s = s;\n\t\tvec2 delta = (pos_max - pos_min) / 2.0;\n\t\tvec2 pos = vec2( x - pos_avg.x, y - pos_avg.y ) / max(delta.x, delta.y)* 0.95;\n\t\tpos.x = pos.x / canvas_size.x * canvas_size.y;\n\t\tpos = scale* pos;\n\t\tpos = pos + pan;\n\t\tgl_Position = vec4(pos, 0.0, 1.0);\n\t\tgl_PointSize = 0.3* scale* 1.0;\n\t}\n',source_point_fragment='\n\t#version 100\n\tprecision mediump float;\n\tuniform float range_max;\n\tuniform float range_min;\n\tvarying float v_type;\n\tvarying float v_s;\n\tconst float EPS = 0.01;\n\tconst vec4 white = vec4(1.0, 1.0, 1.0, 1.0);\n\tconst vec4 red = vec4(1.0, 0.0, 0.0, 1.0);\n\tconst vec4 green = vec4(0.0, 1.0, 0.0, 1.0);\n\tconst vec4 blue = vec4(0.0, 0.0, 1.0, 1.0);\n\tvoid paintRGB();\n\tvoid main() {\n\t\tpaintRGB();\n\t\t//gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);\n\t}\n\t\n\tvoid paintRGB() {\n\t\tfloat range = range_max - range_min;\n\t\tfloat s_normalized = (v_s - range_min) / range;\n\t\tif (abs(v_type) <= EPS) {\n\t\t\tgl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);\n\t\t}\n\t\telse {\n\t\t\tif (s_normalized >= 0.0 && s_normalized < 0.5)\n\t\t\t\tgl_FragColor = 2.0 * ((0.5 - s_normalized)* blue + s_normalized* green);\n\t\t\telse if (s_normalized >= 0.5 && s_normalized < 1.0)\n\t\t\t\tgl_FragColor = 2.0 * ((1.0 - s_normalized)* green + (s_normalized - 0.5)* red);\n\t\t\telse if (s_normalized < 0.0)\n\t\t\t\tgl_FragColor = blue;\n\t\t\telse\n\t\t\t\tgl_FragColor = red;\n\t\t}\n\t\tgl_FragColor.a = 1.0;\n\t}\n',source_sl_vertex='\n\t#version 100\n\tprecision mediump float;\n\tuniform vec2 pos_avg;\n\tuniform vec2 pos_max;\n\tuniform vec2 pos_min;\n\tuniform vec2 canvas_size;\n\tuniform vec2 pan;\n\tuniform float scale;\n\tattribute float x;\n\tattribute float y;\n\tvoid main() {\n\t\tvec2 delta = (pos_max - pos_min) / 2.0;\n\t\tvec2 pos = vec2( x - pos_avg.x, y - pos_avg.y ) / max(delta.x, delta.y)* 0.95;\n\t\tpos.x = pos.x / canvas_size.x * canvas_size.y;\n\t\tpos = scale* pos;\n\t\tpos = pos + pan;\n\t\tgl_Position = vec4(pos, 0.0, 1.0);\n\t\tgl_PointSize = 0.3* scale* 1.0;\n\t}\n',source_sl_fragment='\n\t#version 100\n\tprecision mediump float;\n\tvoid main() {\n\t\tgl_FragColor = vec4(0, 0, 0, 1);\n\t}\n';gl=setupCanvas_2D(),canvas_size=[gl.drawingBufferWidth,gl.drawingBufferHeight];function setupShader_2D(a,b){var c=gl.createShader(gl.VERTEX_SHADER),d=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(c,a),gl.shaderSource(d,b),gl.compileShader(c),gl.compileShader(d);var f=gl.createProgram();return gl.attachShader(f,c),gl.attachShader(f,d),gl.linkProgram(f),gl.detachShader(f,c),gl.detachShader(f,d),gl.getProgramParameter(f,gl.LINK_STATUS)?f:void alert('Shader program did not link successfully!')}function setupCanvas_2D(){return(gl=canvas.getContext('webgl'),!gl)?null:(gl.enable(gl.CULL_FACE),gl.frontFace(gl.CCW),gl.enable(gl.DEPTH_TEST),gl.depthFunc(gl.LESS),gl.clearColor(1,1,1,1),gl)}function setupData_2D(a){pos_avg=new Float32Array(2),pos_max=new Float32Array(2),pos_min=new Float32Array(2),data=[];var b=a.split(/(?:\n)+|(?:\r\n)+/);''==b[b.length-1]&&b.splice(b.length-1,1);for(var c=b[0].split(/(?:\s)+/).length,d=0;d<c;d++)$('#selected_scalar').append('<option value='+(d+'>')+(d+'</option>')),data.push(new Float32Array(b.length));for(var d=0;d<b.length;d++){var f=b[d].split(/(?:\s)+/),g=+f[0],h=+f[1],k=+f[2],l=+f[3],m=+f[4];data[0][d]=g,data[1][d]=h,data[2][d]=k,data[3][d]=l,data[4][d]=m;for(var n=5;n<c;n++)data[n][d]=+f[n];pos_avg[0]+=h,pos_avg[1]+=k,pos_max[0]=pos_max[0]>h?pos_max[0]:h,pos_max[1]=pos_max[1]>k?pos_max[1]:k,pos_min[0]=pos_min[0]<h?pos_min[0]:h,pos_min[1]=pos_min[1]<k?pos_min[1]:k}pos_avg[0]/=b.length,pos_avg[1]/=b.length,pan=new Float32Array(2),scale=1,point_drawer=new point_2D,streamline_drawer=new streamline_2D}function render_2D(){switch(mode){case dict.STREAMLINE_MODE:streamline_drawer.draw();break;case dict.POINT_MODE:default:point_drawer.draw();}}function point_2D(){return this.program=setupShader_2D(source_point_vertex,source_point_fragment),this.draw=function(){if(!gl)return void alert('WebGL not available!');gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT),gl.useProgram(this.program);var a=gl.createBuffer(),b=gl.createBuffer(),c=gl.createBuffer(),d=gl.createBuffer();gl.uniform1f(gl.getUniformLocation(this.program,'range_max'),range_max),gl.uniform1f(gl.getUniformLocation(this.program,'range_min'),range_min),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_avg'),pos_avg),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_max'),pos_max),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_min'),pos_min),gl.uniform2fv(gl.getUniformLocation(this.program,'canvas_size'),canvas_size),gl.uniform2fv(gl.getUniformLocation(this.program,'pan'),pan),gl.uniform1f(gl.getUniformLocation(this.program,'scale'),scale),gl.bindBuffer(gl.ARRAY_BUFFER,a),gl.bufferData(gl.ARRAY_BUFFER,data[0],gl.STATIC_DRAW);var f=gl.getAttribLocation(this.program,'type');gl.enableVertexAttribArray(f),gl.vertexAttribPointer(f,1,gl.FLOAT,!1,0,0),gl.bindBuffer(gl.ARRAY_BUFFER,b),gl.bufferData(gl.ARRAY_BUFFER,data[1],gl.STATIC_DRAW);var g=gl.getAttribLocation(this.program,'x');gl.enableVertexAttribArray(g),gl.vertexAttribPointer(g,1,gl.FLOAT,!1,0,0),gl.bindBuffer(gl.ARRAY_BUFFER,c),gl.bufferData(gl.ARRAY_BUFFER,data[2],gl.STATIC_DRAW);var h=gl.getAttribLocation(this.program,'y');gl.enableVertexAttribArray(h),gl.vertexAttribPointer(h,1,gl.FLOAT,!1,0,0),gl.bindBuffer(gl.ARRAY_BUFFER,d),gl.bufferData(gl.ARRAY_BUFFER,data[selected_col],gl.STATIC_DRAW);var k=gl.getAttribLocation(this.program,'s');gl.enableVertexAttribArray(k),gl.vertexAttribPointer(k,1,gl.FLOAT,!1,0,0),gl.drawArrays(gl.POINTS,0,data[0].length),gl.disableVertexAttribArray(f),gl.disableVertexAttribArray(g),gl.disableVertexAttribArray(h),gl.disableVertexAttribArray(k)},this}function streamline_2D(){return this.linex=[],this.liney=[],this.radius=+$('#radius').val(),this.p1=[+$('#p1x').val(),+$('#p1y').val()],this.p2=[+$('#p2x').val(),+$('#p2y').val()],this.nlines=+$('#nlines').val(),this.slen=+$('#slen').val(),this.rsln=+$('#rsln').val(),this.program=setupShader_2D(source_sl_vertex,source_sl_fragment),this.setupStreamline=function(){this.point=new pointCloud_2D(data[0],data[1],data[2],this.radius),this.linex=[],this.liney=[];for(var a=[],b=[],c=(this.p2[0]-this.p1[0])/(this.nlines+1),d=(this.p2[1]-this.p1[1])/(this.nlines+1),f=1;f<=this.nlines;f++){var g=[this.p1[0]+c*f,this.p1[1]+d*f],h=0,k=[g[0],g[1]],l=[g[0],g[1]],m=this.point.interp(data[3],data[4],k[0],k[1]),n=Math.sqrt(m[0]*m[0]+m[1]*m[1]);for(a.push([g[0]]),b.push([g[1]]);n>EPS&&h<=this.slen;)k[0]+=this.rsln*m[0],k[1]+=this.rsln*m[1],a[a.length-1].push(k[0]),b[b.length-1].push(k[1]),n=Math.sqrt(m[0]*m[0]+m[1]*m[1]),h+=this.rsln*n,m=this.point.interp(data[3],data[4],k[0],k[1]);for(h=0,n=Math.sqrt(m[0]*m[0]+m[1]*m[1]),a.push([g[0]]),b.push([g[1]]);n>EPS&&h<this.slen;)l[0]-=this.rsln*m[0],l[1]-=this.rsln*m[1],a[a.length-1].push(l[0]),b[b.length-1].push(l[1]),n=Math.sqrt(m[0]*m[0]+m[1]*m[1]),h+=this.rsln*n,m=this.point.interp(data[3],data[4],l[0],l[1])}for(var f=0;f<a.length&&f<b.length;f++)this.linex.push(new Float32Array(a[f])),this.liney.push(new Float32Array(b[f]))},this.draw=function(){if(!gl)return void alert('WebGL not available!');gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT),gl.useProgram(this.program);var a=gl.createBuffer(),b=gl.createBuffer();gl.uniform2fv(gl.getUniformLocation(this.program,'pos_avg'),pos_avg),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_max'),pos_max),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_min'),pos_min),gl.uniform2fv(gl.getUniformLocation(this.program,'canvas_size'),canvas_size),gl.uniform2fv(gl.getUniformLocation(this.program,'pan'),pan),gl.uniform1f(gl.getUniformLocation(this.program,'scale'),scale);for(var c=0;c<this.linex.length&&c<this.liney.length;c++){gl.bindBuffer(gl.ARRAY_BUFFER,a),gl.bufferData(gl.ARRAY_BUFFER,this.linex[c],gl.STATIC_DRAW);var d=gl.getAttribLocation(this.program,'x');gl.enableVertexAttribArray(d),gl.vertexAttribPointer(d,1,gl.FLOAT,!1,0,0),gl.bindBuffer(gl.ARRAY_BUFFER,b),gl.bufferData(gl.ARRAY_BUFFER,this.liney[c],gl.STATIC_DRAW);var f=gl.getAttribLocation(this.program,'y');gl.enableVertexAttribArray(f),gl.vertexAttribPointer(f,1,gl.FLOAT,!1,0,0),gl.drawArrays(gl.LINE_STRIP,0,this.linex[c].length),gl.disableVertexAttribArray(d),gl.disableVertexAttribArray(f)}},this}function coordInCanvas(a){var b=a.pageX-a.target.offsetLeft,c=canvas_size[1]-(a.pageY-a.target.offsetTop),d=(b-canvas_size[0]/2)/(canvas_size[0]/2),f=(c-canvas_size[1]/2)/(canvas_size[1]/2);return[d,f]}$('#canvas').mousedown(function(a){mouse_down=!0,this.pre=coordInCanvas(a)}),$('#canvas').mouseup(function(){mouse_down=!1}),$('#canvas').mousemove(function(a){if(mouse_down){var b=coordInCanvas(a);pan[0]+=b[0]-this.pre[0],pan[1]+=b[1]-this.pre[1],this.pre=b,render_2D()}}),$('#canvas').on('wheel',function(a){a.stopPropagation(),a.preventDefault(),0<a.originalEvent.deltaY?scale*=1.1:scale=0.1<=0.9*scale?0.9*scale:0.1,render_2D()}),$('#selected_scalar').change(function(){selected_col=+$('#selected_scalar option:selected').val(),render_2D()}),$('#range_max').change(function(){range_max=+$('#range_max').val(),render_2D()}),$('#range_min').change(function(){range_min=+$('#range_min').val(),render_2D()}),$('#radius').change(function(){streamline_drawer.radius=+$('#radius').val()}),$('#nlines').change(function(){streamline_drawer.nlines=+$('#nlines').val()}),$('#slen').change(function(){streamline_drawer.slen=+$('#slen').val()}),$('#rsln').change(function(){streamline_drawer.rsln=+$('#rsln').val()}),$('#p1x').change(function(){streamline_drawer.p1[0]=+$('#p1x').val()}),$('#p1y').change(function(){streamline_drawer.p1[1]=+$('#p1y').val()}),$('#p2x').change(function(){streamline_drawer.p2[0]=+$('#p2x').val()}),$('#p2y').change(function(){streamline_drawer.p2[1]=+$('#p2y').val()}),$('#mode').change(function(){var a=$('#form-point'),b=$('#form-streamline');$('#radio-pt').is(':checked')?(a.show('fast'),b.hide('fast'),mode=dict.POINT_MODE,render_2D()):$('#radio-sl').is(':checked')&&(b.show('fast'),a.hide('fast'),mode=dict.STREAMLINE_MODE)}),$('#button-render').click(function(){streamline_drawer.setupStreamline(),render_2D()});