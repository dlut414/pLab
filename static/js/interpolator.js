/* interpolation functions */
function point_2D(posX, posY, r){
	if(posX.length != posY.length) {
		alert('Data lengths are different!');
		return;
	}
	this.np = posX.length;
	this.cell = new Map();
	for(var i=0;i<np;i++){
		var key = this.hash(posX[i], posY[i]);
		var val = this.cell.get(hs);
		if(!val){
			this.cell.set(hs, [i]);
		}
		else{
			val.push(i);
		}
	}
	this.hash = function(x, y){
		return (x/r + y/r*17) % 1000;
	}
	this.neightbor_key = function(x, y){
		var ret = [];
		ret.push(this.hash(x-r, y+r));
		ret.push(this.hash(x, y+r));
		ret.push(this.hash(x+r, y+r));
		ret.push(this.hash(x-r, y));
		ret.push(this.hash(x, y));
		ret.push(this.hash(x+r, y));
		ret.push(this.hash(x-r, y-r));
		ret.push(this.hash(x, y-r));
		ret.push(this.hash(x+r, y-r));
		return ret;
	}
}


function interp_2D(posX, posY, phi, px, py){
	
}