"use strict";
function pointCloud_2D(a, b, c, d) {
  if (a.length != b.length || b.length != c.length)
    return void alert("Data lengths are different!");
  if (0 >= d) return void alert("unavailable 'r'! ");
  (this.hash = function(l, n) {
    return (Math.floor(l / this.r) + 199 * Math.floor(n / this.r)) % 1e5;
  }),
    (this.neighbor_key = function(l, n) {
      var o = [
        this.hash(l - this.r, n + this.r),
        this.hash(l, n + this.r),
        this.hash(l + this.r, n + this.r),
        this.hash(l - this.r, n),
        this.hash(l, n),
        this.hash(l + this.r, n),
        this.hash(l - this.r, n - this.r),
        this.hash(l, n - this.r),
        this.hash(l + this.r, n - this.r)
      ];
      return o;
    }),
    (this.neighbor_list = function(l, n) {
      for (
        var s, o = [], p = this.neighbor_key(l, n), q = 0;
        q < p.length;
        q++
      ) {
        (s = this.cell.get(p[q])), s && (o = o.concat(s));
      }
      return o;
    }),
    (this.ww = function(l) {
      var n = Math.max(1 - l / this.r, 0);
      return n * n;
    }),
    (this.poly = function(l) {
      var n = [0, 0, 0, 0, 0],
        o = this.rr;
      return (
        (n[0] = l[0] / this.r),
        (n[1] = l[1] / this.r),
        (n[2] = l[0] * l[0] / o),
        (n[3] = l[0] * l[1] / o),
        (n[4] = l[1] * l[1] / o),
        n
      );
    }),
    (this.interp = function(l, n, o, p) {
      if (!l || l.length != this.np || !n || n.length != this.np)
        return void alert("Length of phi does not match np! Return 0.");
      var q = this.neighbor_list(o, p);
      if (!q || 0 == q.length) return [0, 0];
      for (var B, s = -1, z = this.rr, A = 0; A < q.length; A++) {
        if (((B = q[A]), !(Math.abs(a[B]) < EPS))) {
          var D = [this.px[B] - o, this.py[B] - p],
            E = D[0] * D[0] + D[1] * D[1];
          E < z && ((z = E), (s = B));
        }
      }
      if (-1 == s) return [0, 0];
      q = this.neighbor_list(this.px[s], this.py[s]);
      for (
        var B,
          F = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
          ],
          G = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
          A = 0;
        A < q.length;
        A++
      ) {
        if (((B = q[A]), !(Math.abs(a[B]) < EPS))) {
          var D = [this.px[B] - this.px[s], this.py[B] - this.py[s]],
            H = Math.sqrt(D[0] * D[0] + D[1] * D[1]);
          if (!(H > this.r))
            for (
              var J = this.ww(H),
                K = this.poly(D),
                L = J * (l[B] - l[s]),
                N = J * (n[B] - n[s]),
                O = 0;
              O < K.length;
              O++
            ) {
              for (var P = 0; P < K.length; P++) {
                F[O][P] += K[O] * K[P];
              }
              (G[0][O] += L * K[O]), (G[1][O] += N * K[O]);
            }
        }
      }
      var Q = matrix_invert(F);
      if (!Q) {
        var R = [[F[0][0], F[0][1]], [F[1][0], F[1][1]]],
          S = matrix_invert(R);
        if (!S) return [0, 0];
        Q = [
          [S[0][0], S[0][1], 0, 0, 0],
          [S[1][0], S[1][1], 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]
        ];
      }
      var T = transpose(G),
        U = matrix_product(Q, T),
        V = [1 / this.r * U[0][0], 1 / this.r * U[0][1]],
        W = [1 / this.r * U[1][0], 1 / this.r * U[1][1]],
        X = [2 / this.rr * U[2][0], 2 / this.rr * U[2][1]],
        Y = [1 / this.rr * U[3][0], 1 / this.rr * U[3][1]],
        Z = [2 / this.rr * U[4][0], 2 / this.rr * U[4][1]],
        $ = o - this.px[s],
        _ = p - this.py[s];
      return [
        l[s] +
          ($ * V[0] + _ * W[0]) +
          0.5 * ($ * $ * X[0] + 2 * $ * _ * Y[0] + _ * _ * Z[0]),
        n[s] +
          ($ * V[1] + _ * W[1]) +
          0.5 * ($ * $ * X[1] + 2 * $ * _ * Y[1] + _ * _ * Z[1])
      ];
    }),
    (this.EPS = 1e-3),
    (this.np = b.length),
    (this.type = a),
    (this.px = b),
    (this.py = c),
    (this.r = d),
    (this.rr = d * d),
    (this.cell = new Map());
  for (var f = 0; f < this.np; f++) {
    var g = this.hash(b[f], c[f]),
      h = this.cell.get(g);
    h ? h.push(f) : this.cell.set(g, [f]);
  }
  return this;
}
function dot_product(a, b) {
  if (!a || !b || a.length != b.length)
    return void alert("Vector not available!");
  for (var c = 0, d = 0; d < a.length; d++) {
    c += a[d] * b[d];
  }
  return c;
}
function transpose(a) {
  if (!a) return void alert("Matrix to transpose not available!");
  for (var d, b = [], c = 0; c < a[0].length; c++) {
    d = [];
    for (var f = 0; f < a.length; f++) {
      d.push(a[f][c]);
    }
    b.push(d);
  }
  return b;
}
function transpose_inplace(a) {
  if (!a || a.length != a[0].length) return void alert("Matrix not available!");
  for (var b = 0; b < a.length; b++) {
    for (var d, c = b + 1; c < a.length; c++) {
      (d = a[b][c]), (a[b][c] = a[c][b]), (a[c][b] = d);
    }
  }
  return a;
}
function matrix_product(a, b) {
  if (!a || !b || a[0].length != b.length)
    return void alert("Matrix not available!");
  for (var f, c = [], d = 0; d < a.length; d++) {
    f = [];
    for (var h, g = 0; g < b[0].length; g++) {
      h = 0;
      for (var l = 0; l < a[0].length; l++) {
        h += a[d][l] * b[l][g];
      }
      f.push(h);
    }
    c.push(f);
  }
  return c;
}
function matrix_invert(a) {
  if (a.length !== a[0].length)
    return void alert("The matrix is not a square matrix!");
  var b = 0,
    c = 0,
    d = 0,
    f = a.length,
    g = 0,
    l = [],
    n = [];
  for (b = 0; b < f; b += 1) {
    for (l[l.length] = [], n[n.length] = [], d = 0; d < f; d += 1) {
      (l[b][d] = b == d ? 1 : 0), (n[b][d] = a[b][d]);
    }
  }
  for (b = 0; b < f; b += 1) {
    if (((g = n[b][b]), 0 == g)) {
      for (c = b + 1; c < f; c += 1) {
        if (0 != n[c][b]) {
          for (d = 0; d < f; d++) {
            (g = n[b][d]),
              (n[b][d] = n[c][d]),
              (n[c][d] = g),
              (g = l[b][d]),
              (l[b][d] = l[c][d]),
              (l[c][d] = g);
          }
          break;
        }
      }
      if (((g = n[b][b]), 0 == g)) return;
    }
    for (d = 0; d < f; d++) {
      (n[b][d] /= g), (l[b][d] /= g);
    }
    for (c = 0; c < f; c++) {
      if (c != b)
        for (g = n[c][b], d = 0; d < f; d++) {
          (n[c][d] -= g * n[b][d]), (l[c][d] -= g * l[b][d]);
        }
    }
  }
  return l;
}
