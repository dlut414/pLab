/* interpolation functions */
function pointCloud_2D(type, posX, posY, r){
	if(type.length != posX.length || posX.length != posY.length) {
		alert('Data lengths are different!');
		return;
	}
	if(r <= 0) {
		alert("unavailable 'r'! ");
		return;
	}
	this.hash = function(x, y){
		return (Math.floor(x/this.r) + Math.floor(y/this.r)*199) % 100000;
	};
	this.neighbor_key = function(x, y){
		var ret = [];
		ret.push(this.hash(x-this.r, y+this.r));
		ret.push(this.hash(x, y+this.r));
		ret.push(this.hash(x+this.r, y+this.r));
		ret.push(this.hash(x-this.r, y));
		ret.push(this.hash(x, y));
		ret.push(this.hash(x+this.r, y));
		ret.push(this.hash(x-this.r, y-this.r));
		ret.push(this.hash(x, y-this.r));
		ret.push(this.hash(x+this.r, y-this.r));
		return ret;
	};
	this.neighbor_list = function(x, y){
		var ret = [];
		var key_list = this.neighbor_key(x, y);
		for(var i=0;i<key_list.length;i++){
			var val = this.cell.get(key_list[i]);
			if(!val) continue;
			ret = ret.concat(val);
		}
		return ret;
	};
	this.ww = function(dis){
		var tmp = Math.max(1.0 - dis/this.r, 0.0);
		return tmp* tmp;
	};
	this.poly = function(dr){
		var ret = [0, 0, 0, 0, 0];
		var rr = this.rr;
		ret[0] = dr[0]/this.r, ret[1] = dr[1]/this.r;
		ret[2] = dr[0]* dr[0]/rr, ret[3] = dr[0]* dr[1]/rr, ret[4] = dr[1]* dr[1]/rr;
		return ret;
	};
	this.interp = function(phix, phiy, x, y){
		if(!phix || phix.length != this.np || !phiy || phiy.length != this.np) {
			alert('Length of phi does not match np! Return 0.');
			return;
		}
		var neighbors = this.neighbor_list(x, y);
		if(!neighbors || neighbors.length == 0) return [0,0];
		var id_min = -1;
		var dis_min_square = this.rr;
		for(var i=0;i<neighbors.length;i++) {
			var id = neighbors[i];
			if(Math.abs(type[id]) < EPS) continue;
			var dr = [this.px[id] - x, this.py[id] - y]
			var dis_square = dr[0]*dr[0] + dr[1]*dr[1];
			if(dis_square < dis_min_square){
				dis_min_square = dis_square;
				id_min = id;
			}
		}
		if(id_min == -1) return [0,0];
		neighbors = this.neighbor_list(this.px[id_min], this.py[id_min]);
		var mm = [[0,0,0,0,0],
				  [0,0,0,0,0],
				  [0,0,0,0,0],
				  [0,0,0,0,0],
				  [0,0,0,0,0]], 
			vv = [[0,0,0,0,0],
				  [0,0,0,0,0]];
		for(var i=0;i<neighbors.length;i++) {
			var id = neighbors[i];
			if(Math.abs(type[id]) < EPS) continue;
			var dr = [this.px[id] - this.px[id_min], this.py[id] - this.py[id_min]]
			var dis = Math.sqrt(dr[0]*dr[0] + dr[1]*dr[1]);
			if(dis > this.r) continue;
			var w = this.ww(dis);
			var npq = this.poly(dr);
			var tmpx = w* (phix[id] - phix[id_min]);
			var tmpy = w* (phiy[id] - phiy[id_min]);
			for(var j=0;j<npq.length;j++){
				for(var k=0;k<npq.length;k++){
					mm[j][k] += npq[j] * npq[k];
				}
				vv[0][j] += tmpx* npq[j];
				vv[1][j] += tmpy* npq[j];
			}
		}
		var inv = matrix_invert(mm);
		if(!inv){
			var mini = [[mm[0][0], mm[0][1]], [mm[1][0], mm[1][1]]];
			var tmp = matrix_invert(mini);
			if(!tmp){
				return [0,0];
			}
			else{
				inv = [[tmp[0][0],tmp[0][1],0,0,0],
					   [tmp[1][0],tmp[1][1],0,0,0],
					   [0,0,0,0,0],
					   [0,0,0,0,0],
					   [0,0,0,0,0]];
			}
		}
		var vv_t = transpose(vv);
		var aa = matrix_product(inv, vv_t);
		var Px = [1.0/this.r * aa[0][0], 1.0/this.r * aa[0][1]];
		var Py = [1.0/this.r * aa[1][0], 1.0/this.r * aa[1][1]];
		var Pxx = [2.0/this.rr * aa[2][0], 2.0/this.rr * aa[2][1]];
		var Pxy = [1.0/this.rr * aa[3][0], 1.0/this.rr * aa[3][1]];
		var Pyy = [2.0/this.rr * aa[4][0], 2.0/this.rr * aa[4][1]];
		var dx = x - this.px[id_min];
		var dy = y - this.py[id_min];
		return [phix[id_min] + (dx*Px[0] + dy*Py[0]) + 0.5* (dx*dx*Pxx[0] + 2.0*dx*dy*Pxy[0] + dy*dy*Pyy[0]), 
				phiy[id_min] + (dx*Px[1] + dy*Py[1]) + 0.5* (dx*dx*Pxx[1] + 2.0*dx*dy*Pxy[1] + dy*dy*Pyy[1])];
	};
	this.EPS = 0.001;
	this.np = posX.length;
	this.type = type;
	this.px = posX;
	this.py = posY;
	this.r = r;
	this.rr = r* r;
	this.cell = new Map();
	for(var i=0;i<this.np;i++){
		var key = this.hash(posX[i], posY[i]);
		var val = this.cell.get(key);
		if(!val){
			this.cell.set(key, [i]);
		}
		else{
			val.push(i);
		}
	}
	return this;
}

function dot_product(u, v){
	if(!u || !v || u.length != v.length) {
		alert('Vector not available!');
		return;
	}
	var ret = 0;
	for(var i=0;i<u.length;i++) {
		ret += u[i]* v[i];
	}
	return ret;
}
function transpose(m){
	if(!m) {
		alert('Matrix to transpose not available!');
		return;
	}
	var ret = [];
	for(var j=0;j<m[0].length;j++){
		var row = [];
		for(var i=0;i<m.length;i++){
			row.push(m[i][j]);
		}
		ret.push(row);
	}
	return ret;
}
function transpose_inplace(m){
	if(!m || m.length != m[0].length) {
		alert('Matrix not available!');
		return;
	}
	for(var i=0;i<m.length;i++){
		for(var j=i+1;j<m.length;j++){
			var tmp = m[i][j];
			m[i][j] = m[j][i];
			m[j][i] = tmp;
		}
	}
	return m;
}
function matrix_product(u, v){
	if(!u || !v || u[0].length != v.length) {
		alert('Matrix not available!');
		return;
	}
	var ret = [];
	for(var i=0;i<u.length;i++){
		var row = [];
		for(var j=0;j<v[0].length;j++){
			var tmp = 0;
			for(var k=0;k<u[0].length;k++){
				tmp += u[i][k] * v[k][j];
			}
			row.push(tmp);
		}
		ret.push(row);
	}
	return ret;
}
//code from http://blog.acipo.com/matrix-inversion-in-javascript/
// Returns the inverse of matrix `M`.
function matrix_invert(M){
    // I use Guassian Elimination to calculate the inverse:
    // (1) 'augment' the matrix (left) by the identity (on the right)
    // (2) Turn the matrix on the left into the identity by elemetry row ops
    // (3) The matrix on the right is the inverse (was the identity matrix)
    // There are 3 elemtary row ops: (I combine b and c in my code)
    // (a) Swap 2 rows
    // (b) Multiply a row by a scalar
    // (c) Add 2 rows
    
    //if the matrix isn't square: exit (error)
    if(M.length !== M[0].length){
		alert('The matrix is not a square matrix!');
		return;
	}
    
    //create the identity matrix (I), and a copy (C) of the original
    var i=0, ii=0, j=0, dim=M.length, e=0, t=0;
    var I = [], C = [];
    for(i=0; i<dim; i+=1){
        // Create the row
        I[I.length]=[];
        C[C.length]=[];
        for(j=0; j<dim; j+=1){
            
            //if we're on the diagonal, put a 1 (for identity)
            if(i==j){ I[i][j] = 1; }
            else{ I[i][j] = 0; }
            
            // Also, make the copy of the original
            C[i][j] = M[i][j];
        }
    }
    
    // Perform elementary row operations
    for(i=0; i<dim; i+=1){
        // get the element e on the diagonal
        e = C[i][i];
        
        // if we have a 0 on the diagonal (we'll need to swap with a lower row)
        if(e==0){
            //look through every row below the i'th row
            for(ii=i+1; ii<dim; ii+=1){
                //if the ii'th row has a non-0 in the i'th col
                if(C[ii][i] != 0){
                    //it would make the diagonal have a non-0 so swap it
                    for(j=0; j<dim; j++){
                        e = C[i][j];       //temp store i'th row
                        C[i][j] = C[ii][j];//replace i'th row by ii'th
                        C[ii][j] = e;      //repace ii'th by temp
                        e = I[i][j];       //temp store i'th row
                        I[i][j] = I[ii][j];//replace i'th row by ii'th
                        I[ii][j] = e;      //repace ii'th by temp
                    }
                    //don't bother checking other rows since we've swapped
                    break;
                }
            }
            //get the new diagonal
            e = C[i][i];
            //if it's still 0, not invertable (error)
            if(e == 0){
				return;
			}
        }
        
        // Scale this row down by e (so we have a 1 on the diagonal)
        for(j=0; j<dim; j++){
            C[i][j] = C[i][j]/e; //apply to original matrix
            I[i][j] = I[i][j]/e; //apply to identity
        }
        
        // Subtract this row (scaled appropriately for each row) from ALL of
        // the other rows so that there will be 0's in this column in the
        // rows above and below this one
        for(ii=0; ii<dim; ii++){
            // Only apply to other rows (we want a 1 on the diagonal)
            if(ii==i){
				continue;
			}
            
            // We want to change this element to 0
            e = C[ii][i];
            
            // Subtract (the row above(or below) scaled by e) from (the
            // current row) but start at the i'th column and assume all the
            // stuff left of diagonal is 0 (which it should be if we made this
            // algorithm correctly)
            for(j=0; j<dim; j++){
                C[ii][j] -= e*C[i][j]; //apply to original matrix
                I[ii][j] -= e*I[i][j]; //apply to identity
            }
        }
    }
    
    //we've done all operations, C should be the identity
    //matrix I should be the inverse:
    return I;
}
