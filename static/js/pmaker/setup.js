var doc = document;
function setup(result){
	doc.header = new DataView(result, 0, 54);
	doc.width = doc.header.getInt32(18, true);
	doc.height = doc.header.getInt32(22, true);
	doc.rowSize = (doc.width* 3 + 3) & (~3);
	doc.data = [];
	for(var i=0;i<doc.height;i++){
		var offset = 54 + i* doc.rowSize;
		var dv = new DataView(result, offset, doc.rowSize);
		for(var j=0;j<doc.width;j++){
			//order: b-g-r
			var b = dv.getUint8(3*j);
			var g = dv.getUint8(3*j + 1);
			var r = dv.getUint8(3*j + 2);
			var color = ((r|0) << 16) + ((g|0) << 8) + (b|0);
			doc.data.push(color);
		}
	}
}
function make(color2type, color2vel){
	var output = "";
	var dp = Number($('#point_distance').val());
	for(var i=0;i<doc.height;i++){
		for(var j=0;j<doc.width;j++){
			var id = i* doc.width + j;
			if(!color2type.has(doc.data[id])) continue;
			var type = color2type.get(doc.data[id]);
			var x = j* dp, y = i* dp;
			var vx = 0, vy = 0;
			if(!color2vel.has(doc.data[id])) vx = vy = 0;
			else{
				vx = eval(color2vel.get(doc.data[id])[0]);
				vy = eval(color2vel.get(doc.data[id])[1]);
				vx = vx ? vx : 0;
				vy = vy ? vy : 0;
			}
			var line = type + ' ' + x.toExponential(6) + ' ' + y.toExponential(6) + ' '
					+ vx.toExponential(6) + ' ' + vy.toExponential(6);
			for(var p=0;p<$('#trailing_zero').val();p++) line += ' ' + 0;
			line += '\r\n';
			output += line;
		}
	}
	download('output.txt', output);
}
function download(filename, text){
	var blob = new Blob([text], {type : 'text/plain'});
	var element = doc.createElement('a');
	// element.setAttribute('href', 'data:text/plain;charset=utf-8,' + output); //need to use percent encoding
	element.setAttribute('href', window.URL.createObjectURL(blob));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	doc.body.appendChild(element);
	element.click();
	doc.body.removeChild(element);
}
$('#button-save').click(function(){
	//color -> type
	var color = [], type = [];
	$('.color').each(function(index){
		color.push(parseInt($(this).val().substr(-6), 16));
	});
	$('.type').each(function(index){
		type.push($(this).val());
	});
	if(color.length != type.length){
		alert('Length of color is different from length of type');
		return;
	}
	doc.color2type = new Map();
	color.forEach( (key, i) => doc.color2type.set(key, type[i]) );
	//color -> vx, vy
	var color_vel = [], string_vx = [], string_vy = [];
	$('.color-vel').each(function(index){
		color_vel.push(parseInt($(this).val().substr(-6), 16));
	});
	$('.string-vx').each(function(index){
		string_vx.push($(this).val());
	});
	$('.string-vy').each(function(index){
		string_vy.push($(this).val());
	});
	doc.color2vel = new Map();
	color_vel.forEach( (key, i) => doc.color2vel.set(key, [string_vx[i], string_vy[i]]) );
	make(doc.color2type, doc.color2vel);
});