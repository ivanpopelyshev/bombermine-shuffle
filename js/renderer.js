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
		this.testSurf = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	}
	
    var xX = [1, 1, 0, -1, -1, -1, 0, 1];
    var xY = [ 0, 1, 1, 1, 0, -1, -1, -1];	
	
	Renderer.prototype = {
		canvas: null,
		game: null,
		resources: null,
		camX: 0,
		camY: 0,
		camScale: 1,
		
		point : function(x, y) {
			x -= this.canvas.width/2;
			y -= this.canvas.height/2;
			x *= this.camScale
			y *= this.camScale
			x += this.camX;
			y += this.camY;
			return {x:x, y:y}
		},
		moveCam: function(dx, dy) {
			var cX = this.camX + dx * this.camScale, cY = this.camY + dy * this.camScale;
			if (cX<0) cX = 0;
			if (cY<0) cY = 0;
			if (cX>this.game.map.width * TILE) cX = this.game.map.width * TILE;
			if (cY>this.game.map.height * TILE) cY = this.game.map.height * TILE;
			this.camX = cX;
			this.camY = cY;
		},
		roundCam: function() {
			this.camX = this.camX | 0;
			this.camY = this.camY | 0;
		},
		getSurfaceByTile: function(tileNum) {
			var conf = this.game.conf;
			if (conf.tiles[tileNum&0xff].level == 2)
				return -1;
			var tile = conf.tiles[tileNum&0xff].surface || conf.surface[tileNum>>8];
			return tile.id;
		},
		getSurfaceNumber: function(buf, line1, line2, line3) {
			var conf = this.game.conf;
			var id = buf[line2];
			if (id==-1) return -1;
			var tile = conf.surface[id];
			if (tile == conf.defaultSurface || tile.type == 2)
				return tile.image;
			//AUTOTILE #1
			var test = this.testSurf;
			var id2;
			id2 = buf[line1-1];
			test[0] = id2 != id && id2!=-1 && conf.surface[id2].type!=2;
			id2 = buf[line1];
			test[1] = id2 != id && id2!=-1 && conf.surface[id2].type!=2;
			id2 = buf[line1+1];
			test[2] = id2 != id && id2!=-1 && conf.surface[id2].type!=2;
			id2 = buf[line2-1];
			test[3] = id2 != id && id2!=-1 && conf.surface[id2].type!=2;
			id2 = buf[line2+1];
			test[5] = id2 != id && id2!=-1 && conf.surface[id2].type!=2;
			id2 = buf[line3-1];
			test[6] = id2 != id && id2!=-1 && conf.surface[id2].type!=2;
			id2 = buf[line3];
			test[7] = id2 != id && id2!=-1 && conf.surface[id2].type!=2;
			id2 = buf[line3+1];
			test[8] = id2 != id && id2!=-1 && conf.surface[id2].type!=2;
			if (!test[0] && !test[1] && !test[2] &&
				!test[3] && !test[5] &&
				!test[6] && !test[7] && !test[8])
				return tile.image;
			var res = tile.image;
			if (res == -1) return res;
			for (var i=0;i<4; i++) {
				var dx = i&1, dy = i>>1;
				var dx2 = dx*2-1, dy2 = dy*2-1;
				var r;
				if (test[4+dx2]) {
					if (test[4+dy2*3]) {
						r = 2;
					} else r = 13 - dx2*2;
				} else if (test[4+dy2*3]) {
					r = 13 - dy2*8;
				} else if (test[4 + dx2 + dy2*3]) {
					r = 13 - dx2*2 - dy2*8;
				} else r = 0;
				r+= dx + dy*4;
				res |= (r<<(8+i*6));
			}
			return res;
		},
		getTileNumber : function(buf, line1, line2, line3) {
			var conf = this.game.conf;
			var tile = conf.tiles[buf[line2]&0xff];
			var U = conf.tiles[buf[line1]&0xff];
			var D = conf.tiles[buf[line3]&0xff];
			var low = (tile.bottomLess && !U.bottomLess)?U.deepImg:-1,
				mid = tile.floorImg, 
				high = (tile.level == 2 && D.level == 2 && tile.ceilingImg2 != -1) ? tile.ceilingImg2 : tile.ceilingImg;
			var shadow = 0;
			if (tile.level != 2) {
				if (conf.tiles[buf[line2+1]&0xff].level == 2) shadow |= 1;
				if (conf.tiles[buf[line3+1]&0xff].level == 2) shadow |= 1<<1;
				if (conf.tiles[buf[line3]&0xff].level == 2) shadow |= 1<<2;
				if (conf.tiles[buf[line3-1]&0xff].level == 2) shadow |= 1<<3;
				if (conf.tiles[buf[line2-1]&0xff].level == 2) shadow |= 1<<4;
				if (conf.tiles[buf[line1-1]&0xff].level == 2) shadow |= 1<<5;
				if (conf.tiles[buf[line1]&0xff].level == 2) shadow |= 1<<6;
				if (conf.tiles[buf[line1+1]&0xff].level == 2) shadow |= 1<<7;
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
			var asset = this.resources.tileset;
			for (var j=0;j<CHUNK_SIZE;j++)
				for (var i=0;i<CHUNK_SIZE;i++) {
					var t = chunk.visual[k];
					var num = t & 0xff;
					if (num!=255) context.drawImage(asset.image, asset.frames[num].x, asset.frames[num].y, asset.frameWidth, asset.frameHeight,  i*TILE, j*TILE, TILE, TILE);					
					var v2 = chunk.visual2[k];
					num = v2&0xff;
					if (num!=0xff) {
					//AUTOTILE #2
						var x, y;
						v2>>>=8;
						if (v2!=0) {
							x = (v2&3)*asset.frameWidth/2; 
							y = ((v2&63)>>2)*asset.frameHeight/2;
							context.drawImage(asset.image, asset.frames[num].x + x, asset.frames[num].y + y, asset.frameWidth/2, asset.frameHeight/2,  i*TILE, j*TILE, TILE/2, TILE/2);					
							v2>>>=6;
							x = (v2&3)*asset.frameWidth/2; 
							y = ((v2&63)>>2)*asset.frameHeight/2;
							context.drawImage(asset.image, asset.frames[num].x + x, asset.frames[num].y + y, asset.frameWidth/2, asset.frameHeight/2,  i*TILE+TILE/2, j*TILE, TILE/2, TILE/2);					
							v2>>>=6;
							x = (v2&3)*asset.frameWidth/2; 
							y = ((v2&63)>>2)*asset.frameHeight/2;
							context.drawImage(asset.image, asset.frames[num].x + x, asset.frames[num].y + y, asset.frameWidth/2, asset.frameHeight/2,  i*TILE, j*TILE+TILE/2, TILE/2, TILE/2);					
							v2>>>=6;
							x = (v2&3)*asset.frameWidth/2; 
							y = ((v2&63)>>2)*asset.frameHeight/2;
							context.drawImage(asset.image, asset.frames[num].x + x, asset.frames[num].y + y, asset.frameWidth/2, asset.frameHeight/2,  i*TILE+TILE/2, j*TILE+TILE/2, TILE/2, TILE/2);					
						} else context.drawImage(asset.image, asset.frames[num].x, asset.frames[num].y, asset.frameWidth, asset.frameHeight,  i*TILE, j*TILE, TILE, TILE);	
					}
					num = (t>>8)&0xff;					
					if (num!=255) context.drawImage(asset.image, asset.frames[num].x, asset.frames[num].y, asset.frameWidth, asset.frameHeight,  i*TILE, j*TILE, TILE, TILE);
					num = (t>>16)&0xff;
					if (num!=255) context.drawImage(asset.image, asset.frames[num].x, asset.frames[num].y, asset.frameWidth, asset.frameHeight,  i*TILE, j*TILE, TILE, TILE);
					k++;
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
						if ((shadow&24) == 24) {
							context.rect(x, y1, t, TILE);
						} else if ((shadow&24) == 16) {
							context.moveTo(x + t, y1);
							context.lineTo(x, y1);
							context.lineTo(x, y2);
							context.lineTo(x + t, y2 - t);
							context.lineTo(x + t, y1);
						}
					}
				}
            context.fill();
			context.beginPath();
			context.strokeStyle="black";
			context.globalAlpha = 0.4;
			context.lineWidth = 1;
			//shadow2
			k = 0;
			for (var j=0;j<CHUNK_SIZE;j++)
				for (var i=0;i<CHUNK_SIZE;i++) {
					var shadow = (chunk.visual[k++]>>24)&0xff;
					if (shadow>0) {
						var x1 = i * TILE, x2 = (i+1)*TILE, y1 = j * TILE, y2 = (j + 1) * TILE;
						if ((shadow&1)!=0) {
							context.moveTo(x2-0.5, y1);
							context.lineTo(x2-0.5, y2);
						}
						if ((shadow&4)!=0) {
							context.moveTo(x1, y2-0.5);
							context.lineTo(x2, y2-0.5);
						}
						if ((shadow&16)!=0) {
							context.moveTo(x1+0.5, y1);
							context.lineTo(x1+0.5, y2);
						}
						if ((shadow&64)!=0) {
							context.moveTo(x1, y1+0.5);
							context.lineTo(x2, y1+0.5);
						}
					}
				}
            context.stroke();
            context.globalAlpha = 1.0;
		},
		renderAll: function() {
			var canvas = this.canvas;
			context = canvas.getContext("2d");
			context.fillStyle = "black";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.save();
			var camX = this.camX, camY = this.camY, camScale = this.camScale;
			var W = (canvas.width >> 1), H = (canvas.height >> 1);
			context.translate(W, H)
			context.scale(1.0/camScale, 1.0/camScale)
			W*=camScale;
			H*=camScale;
			context.translate(-camX, -camY)
			var X1 = (camX-W) >> TILE_BITS, Y1 = (camY-H) >> TILE_BITS, X2 = (camX+W) >> TILE_BITS, Y2 = (camY+H) >> TILE_BITS;
			var CX1 = X1 >> CHUNK_SIZE_BITS, CY1 = Y1 >> CHUNK_SIZE_BITS, CX2 = X2 >> CHUNK_SIZE_BITS, CY2 = Y2 >> CHUNK_SIZE_BITS;
			for (var j=CY1; j<=CY2; j++)
				for (var i=CX1; i<=CX2;i++) {
					var chunk = this.game.map.getChunk(i, j);
					var alpha = 1.0;
					if (!chunk) {
						alpha = 0.5;
						var w = this.game.map.cWidth, h = this.game.map.cHeight;
						chunk = this.game.map.getChunk((i+w)%w, (j+h)%h);
					}
					if (chunk) {
						if (chunk.dirty>0) {
							chunk.calcChanges(this);
							this.renderChunk(chunk);
							chunk.clean();
						}
						context.globalAlpha = alpha;
						context.drawImage(chunk.canvas, i<<BITS, j<<BITS);
						context.globalAlpha = 1.0;
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
			var p = this.game.editor.entity;
			if (p) {
				context.strokeStyle = "lime";
				context.lineWidth = 1;
				context.strokeRect(p.dx - TILE, p.dy - TILE, 2*TILE, 2*TILE);
			}
			var selection = this.game.editor.selection;
			if (selection.enabled) {
				var x1 = Math.min(selection.tileX1, selection.tileX2), x2 = Math.max(selection.tileX1, selection.tileX2) + 1;
				var y1 = Math.min(selection.tileY1, selection.tileY2), y2 = Math.max(selection.tileY1, selection.tileY2) + 1;
				context.globalAlpha = 1;
				context.strokeStyle = "yellow";
				context.lineWidth = 4;
				context.strokeRect(x1*TILE, y1*TILE, (x2-x1)*TILE, (y2-y1)*TILE);
			}
			
			
				
			if (this.debug_chunks) {
				context.strokeStyle = "rgba(255,255,255,0.3)"
				context.lineWidth = 2
				for (var j=CY1; j<=CY2; j++)
					for (var i=CX1; i<=CX2;i++) {
						context.strokeRect(i<<BITS, j<<BITS, 1<<BITS, 1<<BITS);
					}
			}
			
			if (this.debug_zones) {
				context.strokeStyle = "aqua"
				context.lineWidth = 2
				var W1 = (1<<BITS) - 4;
				for (var j=CY1; j<=CY2; j++)
					for (var i=CX1; i<=CX2;i++) {
						if ((j&1)==0 && (i&1) == ((j>>1)&1)) {
							var cX = (2*i+1)<<(BITS-1)
							var cY = (2*j+1)<<(BITS-1)
							context.strokeRect(cX-W1, cY-W1, W1*2,W1*2);
						}
					}
			}
			
			context.restore();
		}
	}
	
	exports.Renderer = Renderer;
})(typeof exports === 'undefined' ? window : exports)
