'use strict';var dict={POINT_MODE:0,STREAMLINE_MODE:1},EPS=1e-4,canvas=document.getElementById('canvas'),gl,mode=dict.POINT_MODE,point_drawer,streamline_drawer,colorPicker,data=[],selected_col=0,range_max=1,range_min=0,pos_avg,pos_max,pos_min,pan,scale,mouse_down=!1,canvas_size,mousePos=[0,0],source_colorPick_fragment='\n\t#version 100\n\tprecision mediump float;\n\tuniform vec3 color;\n\tvoid main() {\n\t\tgl_FragColor = vec4(color, 1.0);\n\t}\n',source_point_vertex='\n\t#version 100\n\tprecision mediump float;\n\t// uniform mat4 vMvp;\n\tuniform vec2 pos_avg;\n\tuniform vec2 pos_max;\n\tuniform vec2 pos_min;\n\tuniform vec2 canvas_size;\n\tuniform vec2 pan;\n\tuniform float scale;\n\tattribute float type;\n\tattribute float x;\n\tattribute float y;\n\tattribute float s;\n\tvarying float v_type;\n\tvarying float v_s;\n\tconst float pointSize = 1.0;\n\tvoid main() {\n\t\tv_type = type;\n\t\tv_s = s;\n\t\tvec2 delta = (pos_max - pos_min) / 2.0;\n\t\tvec2 pos = vec2( x - pos_avg.x, y - pos_avg.y ) / max(delta.x, delta.y)* 0.95;\n\t\tpos.x = pos.x / canvas_size.x * canvas_size.y;\n\t\tpos = scale* pos;\n\t\tpos = pos + pan;\n\t\tfloat scaled_pointSize = scale* pointSize;\n\t\tgl_Position = vec4(pos, 0.0, 1.0);\n\t\tgl_PointSize = 0.3* scaled_pointSize;\n\t}\n',source_point_fragment='\n\t#version 100\n\tprecision mediump float;\n\tuniform float range_max;\n\tuniform float range_min;\n\tvarying float v_type;\n\tvarying float v_s;\n\tconst float EPS = 0.01;\n\tconst vec4 white = vec4(1.0, 1.0, 1.0, 1.0);\n\tconst vec4 red = vec4(1.0, 0.0, 0.0, 1.0);\n\tconst vec4 green = vec4(0.0, 1.0, 0.0, 1.0);\n\tconst vec4 blue = vec4(0.0, 0.0, 1.0, 1.0);\n\tvoid paintRGB();\n\tvoid main() {\n\t\tpaintRGB();\n\t\t//gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);\n\t}\n\t\n\tvoid paintRGB() {\n\t\tfloat range = range_max - range_min;\n\t\tfloat s_normalized = (v_s - range_min) / range;\n\t\tif (abs(v_type) <= EPS) {\n\t\t\tgl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);\n\t\t}\n\t\telse {\n\t\t\tif (s_normalized >= 0.0 && s_normalized < 0.5)\n\t\t\t\tgl_FragColor = 2.0 * ((0.5 - s_normalized)* blue + s_normalized* green);\n\t\t\telse if (s_normalized >= 0.5 && s_normalized < 1.0)\n\t\t\t\tgl_FragColor = 2.0 * ((1.0 - s_normalized)* green + (s_normalized - 0.5)* red);\n\t\t\telse if (s_normalized < 0.0)\n\t\t\t\tgl_FragColor = blue;\n\t\t\telse\n\t\t\t\tgl_FragColor = red;\n\t\t}\n\t\tgl_FragColor.a = 1.0;\n\t}\n',source_sl_vertex='\n\t#version 100\n\tprecision mediump float;\n\tuniform vec2 pos_avg;\n\tuniform vec2 pos_max;\n\tuniform vec2 pos_min;\n\tuniform vec2 canvas_size;\n\tuniform vec2 pan;\n\tuniform float scale;\n\tattribute float x;\n\tattribute float y;\n\tvoid main() {\n\t\tvec2 delta = (pos_max - pos_min) / 2.0;\n\t\tvec2 pos = vec2( x - pos_avg.x, y - pos_avg.y ) / max(delta.x, delta.y)* 0.95;\n\t\tpos.x = pos.x / canvas_size.x * canvas_size.y;\n\t\tpos = scale* pos;\n\t\tpos = pos + pan;\n\t\tgl_Position = vec4(pos, 0.0, 1.0);\n\t\tgl_PointSize = 0.3* scale* 1.0;\n\t}\n',source_sl_fragment='\n\t#version 100\n\tprecision mediump float;\n\tvoid main() {\n\t\tgl_FragColor = vec4(0, 0, 0, 1);\n\t}\n';gl=setupCanvas_2D(),canvas_size=[gl.drawingBufferWidth,gl.drawingBufferHeight];function setupShader_2D(a,c){var d=gl.createShader(gl.VERTEX_SHADER),f=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(d,a),gl.shaderSource(f,c),gl.compileShader(d),gl.compileShader(f);var h=gl.createProgram();return gl.attachShader(h,d),gl.attachShader(h,f),gl.linkProgram(h),gl.detachShader(h,d),gl.detachShader(h,f),gl.getProgramParameter(h,gl.LINK_STATUS)?h:void alert('Shader program did not link successfully!')}function setupCanvas_2D(){return(gl=canvas.getContext('experimental-webgl'),!gl)?null:(gl.enable(gl.CULL_FACE),gl.frontFace(gl.CCW),gl.enable(gl.DEPTH_TEST),gl.depthFunc(gl.LESS),gl.clearColor(1,1,1,1),gl)}function setupData_2D(a){pos_avg=new Float32Array(2),pos_max=new Float32Array(2),pos_min=new Float32Array(2),data=[];var c=a.split(/(?:\n)+|(?:\r\n)+/);''==c[c.length-1]&&c.splice(c.length-1,1);for(var d=c[0].split(/(?:\s)+/).length,f=0;f<d;f++)$('#selected_scalar').append('<option value='+(f+'>')+(f+'</option>')),data.push(new Float32Array(c.length));for(var f=0;f<c.length;f++){var h=c[f].split(/(?:\s)+/),k=+h[0],l=+h[1],m=+h[2],n=+h[3],o=+h[4];data[0][f]=k,data[1][f]=l,data[2][f]=m,data[3][f]=n,data[4][f]=o;for(var q=5;q<d;q++)data[q][f]=+h[q];pos_avg[0]+=l,pos_avg[1]+=m,pos_max[0]=pos_max[0]>l?pos_max[0]:l,pos_max[1]=pos_max[1]>m?pos_max[1]:m,pos_min[0]=pos_min[0]<l?pos_min[0]:l,pos_min[1]=pos_min[1]<m?pos_min[1]:m}pos_avg[0]/=c.length,pos_avg[1]/=c.length,pan=new Float32Array(2),scale=1,point_drawer=new point_2D,streamline_drawer=new streamline_2D,colorPicker=new colorPick}function render_2D(){switch(mode){case dict.STREAMLINE_MODE:streamline_drawer.draw();break;case dict.POINT_MODE:default:point_drawer.draw();}}function point_2D(){return this.program=setupShader_2D(source_point_vertex,source_point_fragment),this.draw=function(){if(!gl)return void alert('WebGL not available!');gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT),gl.useProgram(this.program);var a=gl.createBuffer(),c=gl.createBuffer(),d=gl.createBuffer(),f=gl.createBuffer();gl.uniform1f(gl.getUniformLocation(this.program,'range_max'),range_max),gl.uniform1f(gl.getUniformLocation(this.program,'range_min'),range_min),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_avg'),pos_avg),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_max'),pos_max),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_min'),pos_min),gl.uniform2fv(gl.getUniformLocation(this.program,'canvas_size'),canvas_size),gl.uniform2fv(gl.getUniformLocation(this.program,'pan'),pan),gl.uniform1f(gl.getUniformLocation(this.program,'scale'),scale),gl.bindBuffer(gl.ARRAY_BUFFER,a),gl.bufferData(gl.ARRAY_BUFFER,data[0],gl.STATIC_DRAW);var h=gl.getAttribLocation(this.program,'type');gl.enableVertexAttribArray(h),gl.vertexAttribPointer(h,1,gl.FLOAT,!1,0,0),gl.bindBuffer(gl.ARRAY_BUFFER,c),gl.bufferData(gl.ARRAY_BUFFER,data[1],gl.STATIC_DRAW);var k=gl.getAttribLocation(this.program,'x');gl.enableVertexAttribArray(k),gl.vertexAttribPointer(k,1,gl.FLOAT,!1,0,0),gl.bindBuffer(gl.ARRAY_BUFFER,d),gl.bufferData(gl.ARRAY_BUFFER,data[2],gl.STATIC_DRAW);var l=gl.getAttribLocation(this.program,'y');gl.enableVertexAttribArray(l),gl.vertexAttribPointer(l,1,gl.FLOAT,!1,0,0),gl.bindBuffer(gl.ARRAY_BUFFER,f),gl.bufferData(gl.ARRAY_BUFFER,data[selected_col],gl.STATIC_DRAW);var m=gl.getAttribLocation(this.program,'s');gl.enableVertexAttribArray(m),gl.vertexAttribPointer(m,1,gl.FLOAT,!1,0,0),gl.drawArrays(gl.POINTS,0,data[0].length),gl.disableVertexAttribArray(h),gl.disableVertexAttribArray(k),gl.disableVertexAttribArray(l),gl.disableVertexAttribArray(m)},this}function streamline_2D(){return this.linex=[],this.liney=[],this.radius=+$('#radius').val(),this.p1=[+$('#p1x').val(),+$('#p1y').val()],this.p2=[+$('#p2x').val(),+$('#p2y').val()],this.nlines=+$('#nlines').val(),this.slen=+$('#slen').val(),this.rsln=+$('#rsln').val(),this.program=setupShader_2D(source_sl_vertex,source_sl_fragment),this.setupStreamline=function(){this.point=new pointCloud_2D(data[0],data[1],data[2],this.radius),this.linex=[],this.liney=[];for(var a=[],c=[],d=(this.p2[0]-this.p1[0])/(this.nlines+1),f=(this.p2[1]-this.p1[1])/(this.nlines+1),h=1;h<=this.nlines;h++){var k=[this.p1[0]+d*h,this.p1[1]+f*h],l=0,m=[k[0],k[1]],n=[k[0],k[1]],o=this.point.interp(data[3],data[4],m[0],m[1]),q=Math.sqrt(o[0]*o[0]+o[1]*o[1]);for(a.push([k[0]]),c.push([k[1]]);q>EPS&&l<=this.slen;)m[0]+=this.rsln*o[0],m[1]+=this.rsln*o[1],a[a.length-1].push(m[0]),c[c.length-1].push(m[1]),q=Math.sqrt(o[0]*o[0]+o[1]*o[1]),l+=this.rsln*q,o=this.point.interp(data[3],data[4],m[0],m[1]);for(l=0,q=Math.sqrt(o[0]*o[0]+o[1]*o[1]),a.push([k[0]]),c.push([k[1]]);q>EPS&&l<this.slen;)n[0]-=this.rsln*o[0],n[1]-=this.rsln*o[1],a[a.length-1].push(n[0]),c[c.length-1].push(n[1]),q=Math.sqrt(o[0]*o[0]+o[1]*o[1]),l+=this.rsln*q,o=this.point.interp(data[3],data[4],n[0],n[1])}for(var h=0;h<a.length&&h<c.length;h++)this.linex.push(new Float32Array(a[h])),this.liney.push(new Float32Array(c[h]));for(var s=[],t=[],h=0;h<data[0].length;h++)0==data[0][h]&&(s.push(data[1][h]),t.push(data[2][h]));this.dummyX=new Float32Array(s),this.dummyY=new Float32Array(t)},this.draw=function(){if(!gl)return void alert('WebGL not available!');gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT),gl.useProgram(this.program);var a=gl.createBuffer(),c=gl.createBuffer();gl.uniform2fv(gl.getUniformLocation(this.program,'pos_avg'),pos_avg),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_max'),pos_max),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_min'),pos_min),gl.uniform2fv(gl.getUniformLocation(this.program,'canvas_size'),canvas_size),gl.uniform2fv(gl.getUniformLocation(this.program,'pan'),pan),gl.uniform1f(gl.getUniformLocation(this.program,'scale'),scale);for(var d=0;d<this.linex.length&&d<this.liney.length;d++){gl.bindBuffer(gl.ARRAY_BUFFER,a),gl.bufferData(gl.ARRAY_BUFFER,this.linex[d],gl.STATIC_DRAW);var f=gl.getAttribLocation(this.program,'x');gl.enableVertexAttribArray(f),gl.vertexAttribPointer(f,1,gl.FLOAT,!1,0,0),gl.bindBuffer(gl.ARRAY_BUFFER,c),gl.bufferData(gl.ARRAY_BUFFER,this.liney[d],gl.STATIC_DRAW);var h=gl.getAttribLocation(this.program,'y');gl.enableVertexAttribArray(h),gl.vertexAttribPointer(h,1,gl.FLOAT,!1,0,0),gl.drawArrays(gl.LINE_STRIP,0,this.linex[d].length),gl.disableVertexAttribArray(f),gl.disableVertexAttribArray(h)}gl.bindBuffer(gl.ARRAY_BUFFER,a),gl.bufferData(gl.ARRAY_BUFFER,this.dummyX,gl.STATIC_DRAW);var f=gl.getAttribLocation(this.program,'x');gl.enableVertexAttribArray(f),gl.vertexAttribPointer(f,1,gl.FLOAT,!1,0,0),gl.bindBuffer(gl.ARRAY_BUFFER,c),gl.bufferData(gl.ARRAY_BUFFER,this.dummyY,gl.STATIC_DRAW);var f=gl.getAttribLocation(this.program,'y');gl.enableVertexAttribArray(h),gl.vertexAttribPointer(h,1,gl.FLOAT,!1,0,0),gl.drawArrays(gl.POINTS,0,this.dummyX.length),gl.disableVertexAttribArray(f),gl.disableVertexAttribArray(h)},this}function colorPick(){return this.program=setupShader_2D(source_point_vertex,source_colorPick_fragment),this.pick=function(a,c){if(!gl)return void alert('WebGL not available!');gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT),gl.useProgram(this.program);var d=gl.createBuffer(),f=gl.createBuffer(),h=gl.createBuffer();gl.uniform1f(gl.getUniformLocation(this.program,'range_max'),range_max),gl.uniform1f(gl.getUniformLocation(this.program,'range_min'),range_min),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_avg'),pos_avg),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_max'),pos_max),gl.uniform2fv(gl.getUniformLocation(this.program,'pos_min'),pos_min),gl.uniform2fv(gl.getUniformLocation(this.program,'canvas_size'),canvas_size),gl.uniform2fv(gl.getUniformLocation(this.program,'pan'),pan),gl.uniform1f(gl.getUniformLocation(this.program,'scale'),scale),gl.bindBuffer(gl.ARRAY_BUFFER,f),gl.bufferData(gl.ARRAY_BUFFER,data[1],gl.STATIC_DRAW);var k=gl.getAttribLocation(this.program,'x');gl.enableVertexAttribArray(k),gl.vertexAttribPointer(k,1,gl.FLOAT,!1,0,0),gl.bindBuffer(gl.ARRAY_BUFFER,h),gl.bufferData(gl.ARRAY_BUFFER,data[2],gl.STATIC_DRAW);var l=gl.getAttribLocation(this.program,'y');gl.enableVertexAttribArray(l),gl.vertexAttribPointer(l,1,gl.FLOAT,!1,0,0);for(var m=0;m<data[0].length;m++){var n=((255&m)>>0)/255,o=((65280&m)>>8)/255,q=((16711680&m)>>16)/255;gl.uniform3fv(gl.getUniformLocation(this.program,'color'),[n,o,q]),gl.drawArrays(gl.POINTS,m,1)}return gl.disableVertexAttribArray(k),gl.disableVertexAttribArray(l),gl.flush(),gl.finish(),gl.pixelStorei(gl.UNPACK_ALIGNMENT,1),pixels=new Uint8Array(4),gl.readPixels(a,c,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixels),pixels[0]+(pixels[1]<<8)+(pixels[2]<<16)},this}function coordInCanvas(a){var c=a.pageX-a.target.offsetLeft,d=canvas_size[1]-(a.pageY-a.target.offsetTop),f=(c-canvas_size[0]/2)/(canvas_size[0]/2),h=(d-canvas_size[1]/2)/(canvas_size[1]/2);return[f,h]}$('#canvas').mousedown(function(a){mouse_down=!0,this.pre=coordInCanvas(a)}),$('#canvas').mouseup(function(a){if(mouse_down=!1,mode==dict.POINT_MODE){var c=colorPicker.pick(a.pageX-a.target.offsetLeft,canvas_size[1]-(a.pageY-a.target.offsetTop)),d=$('#attribPanel');try{d.html('<ul><li>type: '+data[0][c]+'</li><li>x: '+data[1][c].toFixed(4)+'  |  y: '+data[2][c].toFixed(4)+'</li><li>vx: '+data[2][c].toFixed(4)+'  |  vy: '+data[3][c].toFixed(4)+'</li><li>scalar: '+data[selected_col][c].toFixed(4)+'</li></ul>'),d.show('fast')}catch(f){d.html('<ul><li>type: '+data[0][c]+'</li><li>x: '+data[1][c]+'  |  y: '+data[2][c]+'</li><li>vx: '+data[2][c]+'  |  vy: '+data[3][c]+'</li><li>scalar: '+data[selected_col][c]+'</li></ul>'),d.show('fast')}finally{point_drawer.draw()}}}),$('#canvas').mousemove(function(a){if(mouse_down){var c=coordInCanvas(a);pan[0]+=c[0]-this.pre[0],pan[1]+=c[1]-this.pre[1],this.pre=c,render_2D()}}),$('#canvas').on('wheel',function(a){a.stopPropagation(),a.preventDefault(),0<a.originalEvent.deltaY?scale*=1.1:scale=0.1<=0.9*scale?0.9*scale:0.1,render_2D()}),$('#selected_scalar').change(function(){selected_col=+$('#selected_scalar option:selected').val(),render_2D()}),$('#range_max').change(function(){range_max=+$('#range_max').val(),render_2D()}),$('#range_min').change(function(){range_min=+$('#range_min').val(),render_2D()}),$('#radius').change(function(){streamline_drawer.radius=+$('#radius').val()}),$('#nlines').change(function(){streamline_drawer.nlines=+$('#nlines').val()}),$('#slen').change(function(){streamline_drawer.slen=+$('#slen').val()}),$('#rsln').change(function(){streamline_drawer.rsln=+$('#rsln').val()}),$('#p1x').change(function(){streamline_drawer.p1[0]=+$('#p1x').val()}),$('#p1y').change(function(){streamline_drawer.p1[1]=+$('#p1y').val()}),$('#p2x').change(function(){streamline_drawer.p2[0]=+$('#p2x').val()}),$('#p2y').change(function(){streamline_drawer.p2[1]=+$('#p2y').val()}),$('#mode').change(function(){var a=$('#form-point'),c=$('#form-streamline');$('#radio-pt').is(':checked')?(a.show('fast'),c.hide('fast'),mode=dict.POINT_MODE,render_2D()):$('#radio-sl').is(':checked')&&(c.show('fast'),a.hide('fast'),$('#attribPanel').hide('fast'),mode=dict.STREAMLINE_MODE)}),$('#button-render').click(function(){streamline_drawer.setupStreamline(),render_2D()});