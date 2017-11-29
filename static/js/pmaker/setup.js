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
			this.data.push(r), this.data.push(g), this.data.push(b);
		}
	}
}
function make(color, type){
	
}
$('#button-save').click(function(){
	var color = [], type = [];
	$('.color').each(function(index){
		color.push($(this).val());
	});
	$('.type').each(function(index){
		type.push($(this).val());
	});
	if(color.length != type.length){
		alert('Length of color is different from length of type');
		return;
	}
	make(color, type);
});