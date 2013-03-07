(function(exports) {
	var Map = function() {	
		this.width = 0;
		this.height = 0;
		this.screenWidth = 64;
		this.screenHeight = 64;
		this.obj = [];
		this.tiles = [];
		this.map = [];
		this.dataString;
		this.zoom = 32;
		this.bufWidth = 0;
		this.bufHeight = 0;
		this.selected = null;
	}
	
	Map.prototype.load = function(params) {
		var self = this;
		var count = 2;
		
		var done = function() {
			count--;
			if (count==0) {
				self.randomize();
				if (params.callback)
					params.callback();
			}
		}
		
		this.tileImage = new Image();
		this.tileImage.onload = done;
		this.tileImage.src = params.tilesUrl;
		this.things = params.things || [];
		count += this.things.length;
		for (var i=0; i<this.things.length; i++) {
			var img = new Image();
			img.onload = done;
			img.src = this.things[i].url;
			this.things[i].image = img;
		}
		this.zoom = params.zoom || this.zoom;
		if (params.widthPx)
			this.screenWidth = (params.widthPx / this.zoom) | 0;
		if (params.heightPx)
			this.screenHeight = (params.heightPx / this.zoom) | 0;
		$.ajax({
			url: params.mapUrl,
			success: function(data) {
				self.dataString = data;
				done();
			}
		});
	}
	
	Map.prototype.drawCeiling = function(canvas) {
	var FLOOR = 0, BUILDING = 1, ARROW = 2, ABYSS = 3, TUNNEL = 4, SOLID = 5, BOX = 6;
		var tW = 32;
		var tH = 40;
		var zoom = this.zoom;
		var fX = this.tileImage.width/tW;
		var context = canvas.getContext("2d");
		var W = Math.min(this.width, (canvas.width/zoom+2) | 0), 
		    H = Math.min(this.height, (canvas.height/zoom+2) | 0);
		context.save();
		context.scale(zoom, zoom);
		context.translate(0, -1.0);
		var t = 0.125;
		//LAYER #3 (ceiling): -t;
		for (var j=0; j<H; j++) {
			for (var i=0; i<W; i++) {
				var tile = this.tiles[this.map[j][i]];
				var type = tile.type;
				if (type!=ABYSS && type!=FLOOR && type!=ARROW) {
					var s = -t;
					if (type==BUILDING || type==BOX) s = 0;
					context.drawImage(this.tileImage, tW * (tile.image%fX), tH * (tile.image/fX | 0), tW, tW, i, j+s, 1, 1); 
				}
			}
		}
		context.restore();
	}
	
	Map.prototype.drawFloor = function(canvas) {
		var FLOOR = 0, BUILDING = 1, ARROW = 2, ABYSS = 3, TUNNEL = 4, SOLID = 5, BOX = 6;
		var tW = 32;
		var tH = 40;
		var zoom = this.zoom;
		var fX = this.tileImage.width/tW;
		var context = canvas.getContext("2d");
		var W = Math.min(this.width, (canvas.width/zoom+2) | 0), 
		    H = Math.min(this.height, (canvas.height/zoom+2) | 0);
		context.fillStyle = "black";
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.save();
		context.scale(zoom, zoom);
		context.translate(0, -1.0);
		var t = 0.125;
		//LAYER #1 (floor) : +t
		for (var j=0; j<H; j++) {
			for (var i=0; i<W; i++) {
				var tile = this.tiles[this.map[j][i]];
				var type = tile.type;
				if (type==ABYSS) {
					var tile2 = j>0?this.tiles[this.map[j-1][i]]:this.tiles[0];					
					if (tile2.type!=ABYSS) 
						context.drawImage(this.tileImage, tW * (tile.image%fX), tH * (tile.image/fX | 0), tW, tW, i, j+t, 1, 1); 
				} else if (type!=SOLID) {
					var floor = tile.image;
					if (type==BUILDING || type==BOX || type==TUNNEL) {
						floor = tile.background;
					}
					context.drawImage(this.tileImage, tW * (floor%fX), tH * (floor/fX | 0), tW, tW, i, j+t, 1, 1);
				}
			}
		}
		
		//SHADOWS +t
		context.globalAlpha = 0.3;
		context.beginPath();
		for (var j=0; j<H; j++) {
			for (var i=0; i+1<W; i++) {
				var x = i+1, y1 = j+t, y2 = y1+1;
				var tile = this.tiles[this.map[j][i]];
				if (tile.type == SOLID || tile.type==ABYSS) continue;
				//SHADOW:
				var solid1 = this.tiles[this.map[j][i+1]].type==SOLID;
				var solid2 = j+1<H && this.tiles[this.map[j+1][i+1]].type==SOLID;
				if (solid2) {
					if (solid1) {
						context.rect(x-t, y1, t, 1);
					} else {
						context.rect(x - t, y2 - t, t, t);
					}
				} else if (solid1) {
					context.moveTo(x - t, y1);
					context.lineTo(x, y1);
					context.lineTo(x, y2);
					context.lineTo(x - t, y2 - t);
					context.lineTo(x - t, y1);
				}
			}
		}
		context.fill();
		context.globalAlpha = 1.0;

		//WALLS: -t;
		for (var j=0; j<H; j++) {
			for (var i=0; i<W; i++) {
				var tile = this.tiles[this.map[j][i]];
				var type = tile.type;
				if (type==SOLID || type==TUNNEL) {
					context.drawImage(this.tileImage, tW * (tile.image%fX), tH * (tile.image/fX | 0) + tW, tW, tH-tW, i, j+1-t, 1, 0.25); 
				}
			}
		}
		context.restore();
	}
	
	Map.prototype.drawObjects = function(canvas) {
		var zoom = this.zoom;
		var context = canvas.getContext("2d");
		var W = Math.min(this.width, (canvas.width/zoom+2) | 0), 
		    H = Math.min(this.height, (canvas.height/zoom+2) | 0);
		context.save();
		context.scale(zoom, zoom);
		context.translate(0, -1.0);
		var now = Date.now()%100000;
		if (now<0) now+=100000;
		//LAYER #2 OBJECTS: 0
		for (var j=0; j<H; j++)
			for (var i=0; i<W; i++) {
				var p = this.obj[j][i];
				if (p) {
					var sW = p.type.frameWidth, dW = p.type.renderWidth / 32 * p.size;
					context.drawImage(p.type.image, p.sx*sW, p.sy*sW, sW, sW, p.dx+0.5 - dW/2, p.dy+0.5 -dW/2, dW, dW);
				}
			}
		context.restore();
	}
	
	Map.prototype.drawSelected = function(canvas) {
		var zoom = this.zoom;
		var context = canvas.getContext("2d");
		context.save();
		context.scale(zoom, zoom);
		context.translate(0, -1.0);
		if (this.selected != null) {
			var p = this.selected;
			context.strokeStyle = "lime";
			context.lineWidth = 0.05;
			context.strokeRect(p.dx - 0.5, p.dy - 0.5, 2, 2);
		}
		context.restore();
	}
	
	Map.prototype.selectAt = function(x, y) {
		x/=this.zoom;
		y/=this.zoom;
		y+=1.0;
		x|=0;
		y|=0;
		if (x>=0 && y>=0 && x<this.width && y<this.height)
			this.selected = this.obj[y][x];
		else this.selected = null;
	}
	
	Map.prototype.draw = function(canvas) {	
		if (this.width==0) return;
		var context = canvas.getContext("2d");
		if (this.bufWidth != canvas.width || this.bufHeight != canvas.height) {
			if (this.bufFloor === undefined) {
				this.bufFloor = document.createElement("canvas");
				this.bufCeiling = document.createElement("canvas");
			}
			this.bufWidth = canvas.width;
			this.bufHeight = canvas.height;
			this.bufFloor.width = canvas.width;
			this.bufFloor.height = canvas.height;
			this.drawFloor(this.bufFloor);
			this.bufCeiling.width = canvas.width;
			this.bufCeiling.height = canvas.height;
			this.drawCeiling(this.bufCeiling);
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(this.bufFloor, 0, 0);
		this.drawObjects(canvas);
		context.drawImage(this.bufCeiling, 0, 0);
		this.drawSelected(canvas);
	}
	
	Map.prototype.randomize = function() {
		var FLOOR = 0, BUILDING = 1, ARROW = 2, ABYSS = 3, TUNNEL = 4, SOLID = 5, BOX = 6;
		var pos = 0;
		this.tiles = [];
		var data = this.data;
		if (this.dataString!=null) {
			var s = this.dataString;
			this.dataString = null;
			data = this.data = [];
			for (var i=0; i<s.length; i++)
				data.push(s.charCodeAt(i)&0xff);
		}
		var version = data[pos++];
		pos+=3;
		var tilesCount = data[pos++];
		while (tilesCount-->0) {
			var tile = {type : data[pos++], image: data[pos++], background: data[pos++] }
			this.tiles.push(tile);
		}
		var W = data[pos++];
		W += data[pos++]<<8;
		var H = data[pos++];
		H += data[pos++]<<8;
		this.width = Math.min(this.screenWidth*2 | 0, W);
		this.height = Math.min(this.screenHeight*2 | 0, H);
		console.log(this.width+" "+this.height);
		var x = (Math.random() * W)|0,
			y = (Math.random() * H)|0;
		this.map = [];
		this.obj = [];
		for (var j=0; j<this.height; j++) {
			var a = [], b = [];
			for (var i=0; i<this.width; i++) {
				var x1 = (x+i)%W;
				var y1 = (y+j)%H;
				a.push(data[pos+y1*W+x1]);
				b.push(null);
			}
			this.map.push(a);
			this.obj.push(b);
		}
		
		for (var j=0; j<this.things.length; j++) {
			var type = this.things[j];
			var cnt = (this.width*this.height/type.density + 1) | 0;
			for (var i=0; i<cnt; i++) {
				var x = Math.random()*this.width|0;
				var y = Math.random()*this.height|0;
				var c = 50;
				while (c>0 && (this.tiles[this.map[y][x]].type != FLOOR || this.obj[y][x] != null))
				{
					x = Math.random()*this.width|0;
					y = Math.random()*this.height|0;
					c--;
				}
				if (this.tiles[this.map[y][x]].type == FLOOR && this.obj[y][x] == null) {
					var sx = Math.random()*type.framesX | 0;
					var sy = Math.random()*type.framesY | 0;
					if (type.prob) {
						var s = 0;
						for (var k=0;k<type.prob.length; k++)
							s+=type.prob[k];
						s = Math.random()*s|0;
						for (var k=0;k<type.prob.length; k++) 
							if (s>=type.prob[k])
								s-=type.prob[k];
							else {
								sx = k%type.framesX;
								sy = k/type.framesY|0;
								break;
							}
					}					
					var size = type.rndSize?(Math.random()*0.5 + 0.75) : 1.0;
					this.obj[y][x] = {type:type, sx: sx, sy: sy, dx:x, dy:y, size: size};
				}
			}
		}
	}
	
	exports.Map = Map;
})(typeof exports === 'undefined' ? window : exports)