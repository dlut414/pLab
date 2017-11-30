function setup(result){
	this.header = new DataView(result, 0, 54);
	this.width = header.getInt32(18, true);
	this.height = header.getInt32(22, true);
	this.rowSize = (this.width* 3 + 3) & (~3);
	this.data = [];
	for(var i=0;i<this.height;i++){
		var offset = 54 + i* this.rowSize;
		var dv = new DataView(result, offset, this.rowSize);
		for(var j=0;j<this.width;j++){
			var r = dv.getUint8(3*j, true);
			var g = dv.getUint8(3*j + 1, true);
			var b = dv.getUint8(3*j + 2, true);
			var color = ((r|0) << 16) + ((g|0) << 8) + (b|0);
			this.data.push(color.toString(16));
		}
	}
}
function make(color2type){
	var output = "";
	var dp = Number($('#point_distance').val());
	for(var i=0;i<this.height;i++){
		for(var j=0;j<this.width;j++){
			var id = i* this.width + j;
			if(!color2type.has(this.data[id])) continue;
			var x = j* dp, y = i* dp;
			output += color2type.get(this.data[id]) + '%20' + x.toExponential(6) + '%20' + y.toExponential(6) + '%0D%0A';
		}
	}
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + output);
	element.setAttribute('download', 'output.txt');
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
$('#button-save').click(function(){
	var color = [], type = [];
	$('.color').each(function(index){
		color.push($(this).val().substr(-6));
	});
	$('.type').each(function(index){
		type.push($(this).val());
	});
	if(color.length != type.length){
		alert('Length of color is different from length of type');
		return;
	}
	this.color2type = new Map();
	color.forEach( (key, i) => this.color2type.set(key, type[i]) );
	make(this.color2type);
});