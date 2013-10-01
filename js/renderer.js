(function(exports) {
	var CHUNK_SIZE = 8;
	var CHUNK_SIZE_BITS = 3;
	var TILE = 32;
	var TILE_BITS = 5;
	var BITS = CHUNK_SIZE_BITS + TILE_BITS;
	var SHADOW = TILE/8;

	var Renderer = function(canvas, game, resources) {
		this.canvas = canvas;
		this.game = game;
		this.resources = resources;
		this.camX = game.map.width << (TILE_BITS-1);
		this.camY = game.map.height << (TILE_BITS-1);
	}
	
	Renderer.prototype = {
		canvas: null,
		game: null,
		resources: null,
		enableBuilder: true,
		builderX: 0,
		builderY: 0,
		builderW: 0, 
		builderH: 0,
		builderCanvas: null,
		buidlerRedraw: true,
		camX: 0,
		camY: 0,
		camSelected: null,
		tileSelected: null,
		selectAt : function(x, y) {
			if (this.enableBuilder) {
				if (x>=this.builderX && x<=this.builderX + this.builderW &&
					y>=this.builderY && y<=this.builderY + this.builderH) {
					this.camSelected = null;
					this.tileSelected = null;
					x -= this.builderX;
					y -= this.builderY;
					x = x/TILE|0
					y = y/TILE|0
					var ind = x + y * this.builderW / TILE | 0;
					if (ind>=0 && ind<this.game.conf.tiles.length) {
						this.tileSelected = this.game.conf.tiles[ind];
						if (this.tileSelected.type == "deep")
							this.tileSelected = null;
					}
					this.builderRedraw = true;
					return;
				} else if (this.tileSelected != null) {
					x -= this.canvas.width/2 - this.camX;
					y -= this.canvas.height/2 - this.camY;
					x = x/TILE|0
					y = y/TILE|0
					this.game.map.set(x, y, this.tileSelected.id)
					this.game.rmObj(x, y);
					this.builderRedraw = true;
					return;
				}
			}
		
			x -= this.canvas.width/2 - this.camX;
			y -= this.canvas.height/2 - this.camY;
			this.camSelected = this.game.getObj(x >> TILE_BITS, y >> TILE_BITS);
		},
		moveCam: function(dx, dy) {
			var cX = this.camX + dx, cY = this.camY + dy;
			if (cX<0) cX = 0;
			if (cY<0) cY = 0;
			if (cX>this.game.map.width * TILE) cX = this.game.map.width * TILE;
			if (cY>this.game.map.height * TILE) cY = this.game.map.height * TILE;
			this.camX = cX;
			this.camY = cY;
		},
		getTileNumber : function(buf, line1, line2, line3) {
			var conf = this.game.conf;
			var tile = conf.tiles[buf[line2]];
			var U = conf.tiles[buf[line1]];
			var D = conf.tiles[buf[line3]];
			var low = (tile.bottomLess && !U.bottomLess)?U.deepImg:-1,
				mid = tile.floorImg, 
				high = (tile.level == 4 && D.level == 4 && tile.ceilingImg2 != -1) ? tile.ceilingImg2 : tile.ceilingImg;
			var shadow = 0;
			if (tile.level != 4) {
				var L = conf.tiles[buf[line2-1]];
				var DL = conf.tiles[buf[line3-1]];
				if (DL.level == 4) {
					if (L.level == 4) 
						shadow = 1;
					else shadow = 2;
				} else if (L.level == 4) {
					shadow = 3;
				}
			}
			return (low&0xff) + ((mid&0xff)<<8) + ((high&0xff)<<16) + ((shadow&0xff)<<24);
		},		
		renderChunk: function(chunk) {
			var canvas = chunk.canvas;
			if (canvas == null) {
				canvas = chunk.canvas = document.createElement("canvas");
				canvas.width = TILE*CHUNK_SIZE;
				canvas.height = TILE*CHUNK_SIZE;
			}
			var context = canvas.getContext("2d");
			//TODO: partial render
			context.clearRect(0, 0, TILE*CHUNK_SIZE, TILE*CHUNK_SIZE);
			var k = 0;
			var a = [0, 0, 0];
			var asset = this.resources.tileset;
			for (var j=0;j<CHUNK_SIZE;j++)
				for (var i=0;i<CHUNK_SIZE;i++) {
					var t = chunk.visual[k++];
					a[0] = t & 0xff;
					a[1] = (t>>8)&0xff;
					a[2] = (t>>16)&0xff;
					for (var s=0;s<3; s++) if (a[s]!=-1) {
						var num = a[s];
						if (num!=255) context.drawImage(asset.image, asset.frames[num].x, asset.frames[num].y, asset.frameWidth, asset.frameHeight,  i*TILE, j*TILE, TILE, TILE);
					}
				}
			context.fillStyle = "black";
            context.globalAlpha = 0.3;
            context.beginPath();
			k = 0;
			for (var j=0;j<CHUNK_SIZE;j++)
				for (var i=0;i<CHUNK_SIZE;i++) {
					var shadow = (chunk.visual[k++]>>24)&0xff;
					if (shadow>0) {
					    var x = i * TILE, y1 = j * TILE, y2 = (j + 1) * TILE, t = SHADOW;
						if (shadow == 1) {
							context.rect(x, y1, t, TILE);
						} else if (shadow == 3) {
							context.moveTo(x + t, y1);
							context.lineTo(x, y1);
							context.lineTo(x, y2);
							context.lineTo(x + t, y2 - t);
							context.lineTo(x + t, y1);
						}
					}
				}
            context.fill();
            context.globalAlpha = 1.0;
		},
		renderAll: function() {
			var canvas = this.canvas;
			context = canvas.getContext("2d");
			context.fillStyle = "black";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.save();
			var camX = this.camX, camY = this.camY;
			var W = canvas.width >> 1, H = canvas.height >> 1;
			context.translate(W-camX, H-camY);
			var X1 = (camX-W) >> TILE_BITS, Y1 = (camY-H) >> TILE_BITS, X2 = (camX+W) >> TILE_BITS, Y2 = (camY+H) >> TILE_BITS;
			var CX1 = X1 >> CHUNK_SIZE_BITS, CY1 = Y1 >> CHUNK_SIZE_BITS, CX2 = X2 >> CHUNK_SIZE_BITS, CY2 = Y2 >> CHUNK_SIZE_BITS;
			for (var j=CY1; j<=CY2; j++)
				for (var i=CX1; i<=CX2;i++) {
					var chunk = this.game.map.getChunk(i, j);
					if (chunk) {
						if (chunk.dirty>0) {
							chunk.calcChanges(this);
							this.renderChunk(chunk);
							chunk.clean();
						}
						context.drawImage(chunk.canvas, i<<BITS, j<<BITS);
					}
				}
			for (var j=Y1; j<=Y2; j++)
				for (var i=X1; i<=X2;i++) {
					var p = this.game.getObj(i, j);
					if (p) {
						var frameHeight = p.type.frameHeight ? p.type.frameHeight : p.type.frameWidth;
						var sW = p.type.frameWidth, dW = p.type.renderWidth * p.size;
						var renderHeight = p.type.renderWidth * frameHeight / p.type.frameWidth;
						var sH = frameHeight, dH = renderHeight * p.size;
						if (p.mirror) {
							context.save();
							context.translate(p.dx, p.dy);
							context.scale(-1, 1);
							context.drawImage(p.type.image, 
								p.sx*sW, p.sy*sH, // skin coord
								sW, sH, // skin crop
								-dW/2, -dH/2, // screen coord
								dW, dH); // screeen size
							context.restore();
						} else
							context.drawImage(p.type.image, 
								p.sx*sW, p.sy*sH, // skin coord
								sW, sH, // skin crop
								p.dx - dW/2, p.dy -dH/2, // screen coord
								dW, dH); // screeen size
					}
				}
			var p = this.camSelected;
			if (p) {
				context.strokeStyle = "lime";
				context.lineWidth = 1;
				context.strokeRect(p.dx - TILE, p.dy - TILE, 2*TILE, 2*TILE);
			}
			context.restore();	
			if (this.enableBuilder)
				this.renderBuilder(context);
			//TODO: draw builder
		},	
		//TODO: RENDER BUILDER IN CANVAS CACHE
		renderBuilder: function(context2) {		
			var conf = this.game.conf;
			var COLS = 10;
			var ROWS = ((conf.tiles.length+3) / COLS | 0) + 1;
			var builderX = this.builderX = 16;
			var builderY = this.builderY = this.canvas.height - 16 - ROWS * TILE;
			var builderW = this.builderW = COLS*TILE;
			var builderH = this.builderH = ROWS*TILE;
			var builderCanvas = this.builderCanvas;
			if (builderCanvas == null) {
				builderCanvas = this.builderCanvas = document.createElement("canvas");
				this.builderRedraw = true;
			}
			if (builderCanvas.width != builderW || builderCanvas.height != builderH) {
				builderCanvas.width = builderW;
				builderCanvas.height = builderH;
				this.builderRedraw = true;
			}
			
			var tiles = conf.tiles;
			var asset = this.resources.tileset;
			if (this.builderRedraw) {
				this.builderRedraw = false;
				var context = builderCanvas.getContext("2d")
				context.fillStyle = 'black';
				context.fillRect(0, 0, builderW, builderH);
				var b = [0, 0, 0, 0, 0, 0, 0, 0, 0], a = [0, 0, 0];
				for (var i=0;i<tiles.length; i++) {
					var x = i % COLS, y = i/COLS|0;
					var tile = tiles[i];
					b[5] = tile.id;
					var t = this.getTileNumber(b, 2, 5, 8);
					a[0] = t & 0xff;
					a[1] = (t>>8)&0xff;
					a[2] = (t>>16)&0xff;
					for (var s=0;s<3; s++) if (a[s]!=-1) {
						var num = a[s];
						if (num!=255) context.drawImage(asset.image, asset.frames[num].x, asset.frames[num].y, asset.frameWidth, asset.frameHeight,  x*TILE, y*TILE, TILE, TILE);
					}				
					if (tile.type == "deep") {
						context.fillStyle = "rgba(255, 0, 0, 0.5f)";
						context.fillRect(x * TILE, y * TILE, TILE, TILE);
					}
				}
				if (this.tileSelected != null) {
					var x = this.tileSelected.id % COLS, y = this.tileSelected.id / COLS | 0;
					context.strokeStyle = "blue";
					context.lineWidth = 2;
					context.strokeRect(x * TILE, y * TILE, TILE, TILE);				
				}
				var name = this.tileSelected!=null?this.tileSelected.name:"undefined";		
				context.fillStyle = "white";
				context.textAlign = "right";
				context.font = "bold 11px Tahoma, Arial";
				context.fillText(name, builderW - 10, builderH - 10);
			}
			context2.drawImage(builderCanvas, 0, 0, builderW, builderH, builderX, builderY, builderW, builderH);
			context2.strokeStyle = "white";
			context2.lineWidth = 2;
			context2.strokeRect(builderX, builderY, builderW, builderH);
		}
	}
	
	exports.Renderer = Renderer;
})(typeof exports === 'undefined' ? window : exports)
