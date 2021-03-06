"use strict";
var doc = document;
function setup(a) {
  (doc.header = new DataView(a, 0, 54)),
    (doc.width = doc.header.getInt32(18, !0)),
    (doc.height = doc.header.getInt32(22, !0)),
    (doc.rowSize = -4 & (3 * doc.width + 3)),
    (doc.data = []);
  for (var c = 0; c < doc.height; c++) {
    for (
      var d = 54 + c * doc.rowSize, e = new DataView(a, d, doc.rowSize), f = 0;
      f < doc.width;
      f++
    ) {
      var h = e.getUint8(3 * f),
        k = e.getUint8(3 * f + 1),
        l = e.getUint8(3 * f + 2);
      doc.data.push(((0 | l) << 16) + ((0 | k) << 8) + (0 | h));
    }
  }
}
function make(color2type, color2vel) {
  for (
    var output = "", dp = +$("#point_distance").val(), i = 0;
    i < doc.height;
    i++
  ) {
    for (var id, j = 0; j < doc.width; j++) {
      if (((id = i * doc.width + j), color2type.has(doc.data[id]))) {
        var type = color2type.get(doc.data[id]),
          x = j * dp,
          y = i * dp,
          vx = 0,
          vy = 0;
        color2vel.has(doc.data[id])
          ? ((vx = eval(color2vel.get(doc.data[id])[0])),
            (vy = eval(color2vel.get(doc.data[id])[1])),
            (vx = vx ? vx : 0),
            (vy = vy ? vy : 0))
          : (vx = vy = 0);
        for (
          var line =
              type +
              " " +
              x.toExponential(6) +
              " " +
              y.toExponential(6) +
              " " +
              vx.toExponential(6) +
              " " +
              vy.toExponential(6),
            p = 0;
          p < $("#trailing_zero").val();
          p++
        ) {
          line += " 0";
        }
        (line += "\r\n"), (output += line);
      }
    }
  }
  download("output.txt", output);
}
function download(a, c) {
  var d = new Blob([c], { type: "text/plain" }),
    e = doc.createElement("a");
  e.setAttribute("href", window.URL.createObjectURL(d)),
    e.setAttribute("download", a),
    (e.style.display = "none"),
    doc.body.appendChild(e),
    e.click(),
    doc.body.removeChild(e);
}
$("#button-save").click(function() {
  var a = [],
    c = [];
  if (
    ($(".color").each(function() {
      a.push(
        parseInt(
          $(this)
            .val()
            .substr(-6),
          16
        )
      );
    }),
    $(".type").each(function() {
      c.push($(this).val());
    }),
    a.length != c.length)
  )
    return void alert("Length of color is different from length of type");
  (doc.color2type = new Map()),
    a.forEach(function(h, k) {
      return doc.color2type.set(h, c[k]);
    });
  var d = [],
    e = [],
    f = [];
  $(".color-vel").each(function() {
    d.push(
      parseInt(
        $(this)
          .val()
          .substr(-6),
        16
      )
    );
  }),
    $(".string-vx").each(function() {
      e.push($(this).val());
    }),
    $(".string-vy").each(function() {
      f.push($(this).val());
    }),
    (doc.color2vel = new Map()),
    d.forEach(function(h, k) {
      return doc.color2vel.set(h, [e[k], f[k]]);
    }),
    make(doc.color2type, doc.color2vel);
});
