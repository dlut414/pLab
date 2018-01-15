"use strict";
var dict = { POINT_MODE: 0, STREAMLINE_MODE: 1 },
  EPS = 1e-4,
  canvas = document.getElementById("canvas"),
  gl,
  mode = dict.POINT_MODE,
  point_drawer,
  streamline_drawer,
  colorPicker,
  data = [],
  selected_col = 0,
  range_max = 1,
  range_min = 0,
  pos_avg,
  pos_max,
  pos_min,
  pan,
  scale,
  point_size = +$("#point_size").val(),
  mouse_down = !1,
  canvas_size,
  mousePos = [0, 0],
  source_colorPick_fragment =
    "\n\t#version 100\n\tprecision mediump float;\n\tuniform vec3 color;\n\tvoid main() {\n\t\tgl_FragColor = vec4(color, 1.0);\n\t}\n",
  source_point_vertex =
    "\n\t#version 100\n\tprecision mediump float;\n\t// uniform mat4 vMvp;\n\tuniform vec2 pos_avg;\n\tuniform vec2 pos_max;\n\tuniform vec2 pos_min;\n\tuniform vec2 canvas_size;\n\tuniform vec2 pan;\n\tuniform float scale;\n\tuniform float point_size;\n\tattribute float type;\n\tattribute float x;\n\tattribute float y;\n\tattribute float s;\n\tvarying float v_type;\n\tvarying float v_s;\n\tvoid main() {\n\t\tv_type = type;\n\t\tv_s = s;\n\t\tvec2 delta = (pos_max - pos_min) / 2.0;\n\t\tvec2 pos = vec2( x - pos_avg.x, y - pos_avg.y ) / max(delta.x, delta.y)* 0.95;\n\t\tpos.x = pos.x / canvas_size.x * canvas_size.y;\n\t\tpos = scale* pos;\n\t\tpos = pos + pan;\n\t\tfloat scaled_pointSize = scale* point_size;\n\t\tgl_Position = vec4(pos, 0.0, 1.0);\n\t\tgl_PointSize = 0.3* scaled_pointSize;\n\t}\n",
  source_point_fragment =
    "\n\t#version 100\n\tprecision mediump float;\n\tuniform float range_max;\n\tuniform float range_min;\n\tvarying float v_type;\n\tvarying float v_s;\n\tconst float EPS = 0.01;\n\tconst vec4 white = vec4(1.0, 1.0, 1.0, 1.0);\n\tconst vec4 red = vec4(1.0, 0.0, 0.0, 1.0);\n\tconst vec4 green = vec4(0.0, 1.0, 0.0, 1.0);\n\tconst vec4 blue = vec4(0.0, 0.0, 1.0, 1.0);\n\tvoid paintRGB();\n\tvoid main() {\n\t\tpaintRGB();\n\t\t//gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);\n\t}\n\t\n\tvoid paintRGB() {\n\t\tfloat range = range_max - range_min;\n\t\tfloat s_normalized = (v_s - range_min) / range;\n\t\tif (abs(v_type) <= EPS) {\n\t\t\tgl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);\n\t\t}\n\t\telse {\n\t\t\tif (s_normalized >= 0.0 && s_normalized < 0.5)\n\t\t\t\tgl_FragColor = 2.0 * ((0.5 - s_normalized)* blue + s_normalized* green);\n\t\t\telse if (s_normalized >= 0.5 && s_normalized < 1.0)\n\t\t\t\tgl_FragColor = 2.0 * ((1.0 - s_normalized)* green + (s_normalized - 0.5)* red);\n\t\t\telse if (s_normalized < 0.0)\n\t\t\t\tgl_FragColor = blue;\n\t\t\telse\n\t\t\t\tgl_FragColor = red;\n\t\t}\n\t\tgl_FragColor.a = 1.0;\n\t}\n",
  source_sl_vertex =
    "\n\t#version 100\n\tprecision mediump float;\n\tuniform vec2 pos_avg;\n\tuniform vec2 pos_max;\n\tuniform vec2 pos_min;\n\tuniform vec2 canvas_size;\n\tuniform vec2 pan;\n\tuniform float scale;\n\tattribute float x;\n\tattribute float y;\n\tvoid main() {\n\t\tvec2 delta = (pos_max - pos_min) / 2.0;\n\t\tvec2 pos = vec2( x - pos_avg.x, y - pos_avg.y ) / max(delta.x, delta.y)* 0.95;\n\t\tpos.x = pos.x / canvas_size.x * canvas_size.y;\n\t\tpos = scale* pos;\n\t\tpos = pos + pan;\n\t\tgl_Position = vec4(pos, 0.0, 1.0);\n\t\tgl_PointSize = 0.3* scale* 1.0;\n\t}\n",
  source_sl_fragment =
    "\n\t#version 100\n\tprecision mediump float;\n\tvoid main() {\n\t\tgl_FragColor = vec4(0, 0, 0, 1);\n\t}\n";
(gl = setupCanvas_2D()),
  (canvas_size = [gl.drawingBufferWidth, gl.drawingBufferHeight]);
function setupShader_2D(u, v) {
  var w = gl.createShader(gl.VERTEX_SHADER),
    z = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(w, u),
    gl.shaderSource(z, v),
    gl.compileShader(w),
    gl.compileShader(z);
  var A = gl.createProgram();
  return (
    gl.attachShader(A, w),
    gl.attachShader(A, z),
    gl.linkProgram(A),
    gl.detachShader(A, w),
    gl.detachShader(A, z),
    gl.getProgramParameter(A, gl.LINK_STATUS)
      ? A
      : void alert("Shader program did not link successfully!")
  );
}
function setupCanvas_2D() {
  return ((gl = canvas.getContext("webgl")), !gl)
    ? null
    : (gl.enable(gl.CULL_FACE),
      gl.frontFace(gl.CCW),
      gl.enable(gl.DEPTH_TEST),
      gl.depthFunc(gl.LESS),
      gl.clearColor(1, 1, 1, 1),
      gl);
}
function setupData_2D(u) {
  (pos_avg = new Float32Array(2)),
    (pos_max = new Float32Array(2)),
    (pos_min = new Float32Array(2)),
    (data = []);
  var v = u.split(/[\n]+|[\r\n]+/);
  "" == v[v.length - 1] && v.splice(v.length - 1, 1);
  var w = v[0].split(/[\s]+|[\,]/).length;
  $($("#selected_scalar option")).remove();
  for (var z = 0; z < w; z++)
    $("#selected_scalar").append(
      "<option value=" + (z + ">") + (z + "</option>")
    ),
      data.push(new Float32Array(v.length));
  for (var z = 0; z < v.length; z++) {
    var A = v[z].split(/[\s]+|[\,]/),
      B = +A[0],
      C = +A[1],
      D = +A[2],
      E = +A[3],
      F = +A[4];
    (data[0][z] = B),
      (data[1][z] = C),
      (data[2][z] = D),
      (data[3][z] = E),
      (data[4][z] = F);
    for (var G = 5; G < w; G++) data[G][z] = +A[G];
    (pos_avg[0] += C),
      (pos_avg[1] += D),
      (pos_max[0] = pos_max[0] > C ? pos_max[0] : C),
      (pos_max[1] = pos_max[1] > D ? pos_max[1] : D),
      (pos_min[0] = pos_min[0] < C ? pos_min[0] : C),
      (pos_min[1] = pos_min[1] < D ? pos_min[1] : D);
  }
  (pos_avg[0] /= v.length),
    (pos_avg[1] /= v.length),
    (pan = new Float32Array(2)),
    (scale = 1),
    (point_drawer = new point_2D()),
    (streamline_drawer = new streamline_2D()),
    (colorPicker = new colorPick());
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
function point_2D() {
  return (
    (this.program = setupShader_2D(source_point_vertex, source_point_fragment)),
    (this.draw = function() {
      if (!gl) return void alert("WebGL not available!");
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT),
        gl.useProgram(this.program);
      var u = gl.createBuffer(),
        v = gl.createBuffer(),
        w = gl.createBuffer(),
        z = gl.createBuffer();
      gl.uniform1f(gl.getUniformLocation(this.program, "range_max"), range_max),
        gl.uniform1f(
          gl.getUniformLocation(this.program, "range_min"),
          range_min
        ),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pos_avg"), pos_avg),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pos_max"), pos_max),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pos_min"), pos_min),
        gl.uniform2fv(
          gl.getUniformLocation(this.program, "canvas_size"),
          canvas_size
        ),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pan"), pan),
        gl.uniform1f(gl.getUniformLocation(this.program, "scale"), scale),
        gl.uniform1f(
          gl.getUniformLocation(this.program, "point_size"),
          point_size
        ),
        gl.bindBuffer(gl.ARRAY_BUFFER, u),
        gl.bufferData(gl.ARRAY_BUFFER, data[0], gl.STATIC_DRAW);
      var A = gl.getAttribLocation(this.program, "type");
      gl.enableVertexAttribArray(A),
        gl.vertexAttribPointer(A, 1, gl.FLOAT, !1, 0, 0),
        gl.bindBuffer(gl.ARRAY_BUFFER, v),
        gl.bufferData(gl.ARRAY_BUFFER, data[1], gl.STATIC_DRAW);
      var B = gl.getAttribLocation(this.program, "x");
      gl.enableVertexAttribArray(B),
        gl.vertexAttribPointer(B, 1, gl.FLOAT, !1, 0, 0),
        gl.bindBuffer(gl.ARRAY_BUFFER, w),
        gl.bufferData(gl.ARRAY_BUFFER, data[2], gl.STATIC_DRAW);
      var C = gl.getAttribLocation(this.program, "y");
      gl.enableVertexAttribArray(C),
        gl.vertexAttribPointer(C, 1, gl.FLOAT, !1, 0, 0),
        gl.bindBuffer(gl.ARRAY_BUFFER, z),
        gl.bufferData(gl.ARRAY_BUFFER, data[selected_col], gl.STATIC_DRAW);
      var D = gl.getAttribLocation(this.program, "s");
      gl.enableVertexAttribArray(D),
        gl.vertexAttribPointer(D, 1, gl.FLOAT, !1, 0, 0),
        gl.drawArrays(gl.POINTS, 0, data[0].length),
        gl.disableVertexAttribArray(A),
        gl.disableVertexAttribArray(B),
        gl.disableVertexAttribArray(C),
        gl.disableVertexAttribArray(D);
    }),
    this
  );
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
        var u = [],
          v = [],
          w = (this.p2[0] - this.p1[0]) / (this.nlines + 1),
          z = (this.p2[1] - this.p1[1]) / (this.nlines + 1),
          A = 1;
        A <= this.nlines;
        A++
      ) {
        var B = [this.p1[0] + w * A, this.p1[1] + z * A],
          C = 0,
          D = [B[0], B[1]],
          E = [B[0], B[1]],
          F = this.point.interp(data[3], data[4], D[0], D[1]),
          G = Math.sqrt(F[0] * F[0] + F[1] * F[1]);
        for (u.push([B[0]]), v.push([B[1]]); G > EPS && C <= this.slen; )
          (D[0] += this.rsln * F[0]),
            (D[1] += this.rsln * F[1]),
            u[u.length - 1].push(D[0]),
            v[v.length - 1].push(D[1]),
            (G = Math.sqrt(F[0] * F[0] + F[1] * F[1])),
            (C += this.rsln * G),
            (F = this.point.interp(data[3], data[4], D[0], D[1]));
        for (
          C = 0,
            G = Math.sqrt(F[0] * F[0] + F[1] * F[1]),
            u.push([B[0]]),
            v.push([B[1]]);
          G > EPS && C < this.slen;

        )
          (E[0] -= this.rsln * F[0]),
            (E[1] -= this.rsln * F[1]),
            u[u.length - 1].push(E[0]),
            v[v.length - 1].push(E[1]),
            (G = Math.sqrt(F[0] * F[0] + F[1] * F[1])),
            (C += this.rsln * G),
            (F = this.point.interp(data[3], data[4], E[0], E[1]));
      }
      for (var A = 0; A < u.length && A < v.length; A++)
        this.linex.push(new Float32Array(u[A])),
          this.liney.push(new Float32Array(v[A]));
      for (var H = [], I = [], A = 0; A < data[0].length; A++)
        0 == data[0][A] && (H.push(data[1][A]), I.push(data[2][A]));
      (this.dummyX = new Float32Array(H)), (this.dummyY = new Float32Array(I));
    }),
    (this.draw = function() {
      if (!gl) return void alert("WebGL not available!");
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT),
        gl.useProgram(this.program);
      var u = gl.createBuffer(),
        v = gl.createBuffer();
      gl.uniform2fv(gl.getUniformLocation(this.program, "pos_avg"), pos_avg),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pos_max"), pos_max),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pos_min"), pos_min),
        gl.uniform2fv(
          gl.getUniformLocation(this.program, "canvas_size"),
          canvas_size
        ),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pan"), pan),
        gl.uniform1f(gl.getUniformLocation(this.program, "scale"), scale);
      for (var w = 0; w < this.linex.length && w < this.liney.length; w++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, u),
          gl.bufferData(gl.ARRAY_BUFFER, this.linex[w], gl.STATIC_DRAW);
        var z = gl.getAttribLocation(this.program, "x");
        gl.enableVertexAttribArray(z),
          gl.vertexAttribPointer(z, 1, gl.FLOAT, !1, 0, 0),
          gl.bindBuffer(gl.ARRAY_BUFFER, v),
          gl.bufferData(gl.ARRAY_BUFFER, this.liney[w], gl.STATIC_DRAW);
        var A = gl.getAttribLocation(this.program, "y");
        gl.enableVertexAttribArray(A),
          gl.vertexAttribPointer(A, 1, gl.FLOAT, !1, 0, 0),
          gl.drawArrays(gl.LINE_STRIP, 0, this.linex[w].length),
          gl.disableVertexAttribArray(z),
          gl.disableVertexAttribArray(A);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, u),
        gl.bufferData(gl.ARRAY_BUFFER, this.dummyX, gl.STATIC_DRAW);
      var z = gl.getAttribLocation(this.program, "x");
      gl.enableVertexAttribArray(z),
        gl.vertexAttribPointer(z, 1, gl.FLOAT, !1, 0, 0),
        gl.bindBuffer(gl.ARRAY_BUFFER, v),
        gl.bufferData(gl.ARRAY_BUFFER, this.dummyY, gl.STATIC_DRAW);
      var z = gl.getAttribLocation(this.program, "y");
      gl.enableVertexAttribArray(A),
        gl.vertexAttribPointer(A, 1, gl.FLOAT, !1, 0, 0),
        gl.drawArrays(gl.POINTS, 0, this.dummyX.length),
        gl.disableVertexAttribArray(z),
        gl.disableVertexAttribArray(A);
    }),
    this
  );
}
function colorPick() {
  return (
    (this.program = setupShader_2D(
      source_point_vertex,
      source_colorPick_fragment
    )),
    (this.pick = function(u, v) {
      if (!gl) return void alert("WebGL not available!");
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT),
        gl.useProgram(this.program);
      var w = gl.createBuffer(),
        z = gl.createBuffer(),
        A = gl.createBuffer();
      gl.uniform1f(gl.getUniformLocation(this.program, "range_max"), range_max),
        gl.uniform1f(
          gl.getUniformLocation(this.program, "range_min"),
          range_min
        ),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pos_avg"), pos_avg),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pos_max"), pos_max),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pos_min"), pos_min),
        gl.uniform2fv(
          gl.getUniformLocation(this.program, "canvas_size"),
          canvas_size
        ),
        gl.uniform2fv(gl.getUniformLocation(this.program, "pan"), pan),
        gl.uniform1f(gl.getUniformLocation(this.program, "scale"), scale),
        gl.uniform1f(
          gl.getUniformLocation(this.program, "point_size"),
          point_size
        ),
        gl.bindBuffer(gl.ARRAY_BUFFER, z),
        gl.bufferData(gl.ARRAY_BUFFER, data[1], gl.STATIC_DRAW);
      var B = gl.getAttribLocation(this.program, "x");
      gl.enableVertexAttribArray(B),
        gl.vertexAttribPointer(B, 1, gl.FLOAT, !1, 0, 0),
        gl.bindBuffer(gl.ARRAY_BUFFER, A),
        gl.bufferData(gl.ARRAY_BUFFER, data[2], gl.STATIC_DRAW);
      var C = gl.getAttribLocation(this.program, "y");
      gl.enableVertexAttribArray(C),
        gl.vertexAttribPointer(C, 1, gl.FLOAT, !1, 0, 0);
      for (var D = 0; D < data[0].length; D++) {
        var E = ((255 & D) >> 0) / 255,
          F = ((65280 & D) >> 8) / 255,
          G = ((16711680 & D) >> 16) / 255;
        gl.uniform3fv(gl.getUniformLocation(this.program, "color"), [E, F, G]),
          gl.drawArrays(gl.POINTS, D, 1);
      }
      gl.disableVertexAttribArray(B),
        gl.disableVertexAttribArray(C),
        gl.flush(),
        gl.finish(),
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      var H = new Uint8Array(4);
      return (
        gl.readPixels(u, v, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, H),
        H[0] + (H[1] << 8) + (H[2] << 16)
      );
    }),
    this
  );
}
function coordInCanvas(u) {
  var v = u.pageX - u.target.offsetLeft,
    w = canvas_size[1] - (u.pageY - u.target.offsetTop),
    z = (v - canvas_size[0] / 2) / (canvas_size[0] / 2),
    A = (w - canvas_size[1] / 2) / (canvas_size[1] / 2);
  return [z, A];
}
$("#canvas").mousedown(function(u) {
  (mouse_down = !0), (this.pre = coordInCanvas(u));
}),
  $("#canvas").mouseup(function(u) {
    if (((mouse_down = !1), mode == dict.POINT_MODE)) {
      var v = colorPicker.pick(
          u.pageX - u.target.offsetLeft,
          canvas_size[1] - (u.pageY - u.target.offsetTop)
        ),
        w = $("#attribPanel");
      try {
        w.html(
          "<ul><li>type: " +
            data[0][v] +
            "</li><li>x: " +
            data[1][v].toFixed(4) +
            "  |  y: " +
            data[2][v].toFixed(4) +
            "</li><li>vx: " +
            data[2][v].toFixed(4) +
            "  |  vy: " +
            data[3][v].toFixed(4) +
            "</li><li>scalar: " +
            data[selected_col][v].toFixed(4) +
            "</li></ul>"
        ),
          w.show("fast");
      } catch (z) {
        w.html(
          "<ul><li>type: " +
            data[0][v] +
            "</li><li>x: " +
            data[1][v] +
            "  |  y: " +
            data[2][v] +
            "</li><li>vx: " +
            data[2][v] +
            "  |  vy: " +
            data[3][v] +
            "</li><li>scalar: " +
            data[selected_col][v] +
            "</li></ul>"
        ),
          w.show("fast");
      } finally {
        point_drawer.draw();
      }
    }
  }),
  $("#canvas").mousemove(function(u) {
    if (mouse_down) {
      var v = coordInCanvas(u);
      (pan[0] += v[0] - this.pre[0]),
        (pan[1] += v[1] - this.pre[1]),
        (this.pre = v),
        render_2D();
    }
  }),
  $("#canvas").on("wheel", function(u) {
    u.stopPropagation(),
      u.preventDefault(),
      0 > u.originalEvent.deltaY
        ? (scale *= 1.1)
        : (scale = 0.1 <= 0.9 * scale ? 0.9 * scale : 0.1),
      render_2D();
  }),
  $("#selected_scalar").change(function() {
    (selected_col = +$("#selected_scalar option:selected").val()), render_2D();
  }),
  $("#range_max").change(function() {
    (range_max = +$("#range_max").val()), render_2D();
  }),
  $("#range_min").change(function() {
    (range_min = +$("#range_min").val()), render_2D();
  }),
  $("#point_size").change(function() {
    (point_size = +$("#point_size").val()), render_2D();
  }),
  $("#radius").change(function() {
    streamline_drawer.radius = +$("#radius").val();
  }),
  $("#nlines").change(function() {
    streamline_drawer.nlines = +$("#nlines").val();
  }),
  $("#slen").change(function() {
    streamline_drawer.slen = +$("#slen").val();
  }),
  $("#rsln").change(function() {
    streamline_drawer.rsln = +$("#rsln").val();
  }),
  $("#p1x").change(function() {
    streamline_drawer.p1[0] = +$("#p1x").val();
  }),
  $("#p1y").change(function() {
    streamline_drawer.p1[1] = +$("#p1y").val();
  }),
  $("#p2x").change(function() {
    streamline_drawer.p2[0] = +$("#p2x").val();
  }),
  $("#p2y").change(function() {
    streamline_drawer.p2[1] = +$("#p2y").val();
  }),
  $("#mode").change(function() {
    var u = $("#form-point"),
      v = $("#form-streamline");
    $("#radio-pt").is(":checked")
      ? (u.show("fast"), v.hide("fast"), (mode = dict.POINT_MODE), render_2D())
      : $("#radio-sl").is(":checked") &&
        (v.show("fast"),
        u.hide("fast"),
        $("#attribPanel").hide("fast"),
        (mode = dict.STREAMLINE_MODE));
  }),
  $("#button-render").click(function() {
    streamline_drawer.setupStreamline(), render_2D();
  });
