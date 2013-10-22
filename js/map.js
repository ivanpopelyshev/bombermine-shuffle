(function(exports) {
	function createOneDimArray(size, def) {
		var res = [];
		for (var j=0;j<size; j++) {
			res.push(def);
		}
		return res;
	}

	function createTwoDimArray(w, h, def) {
		var res = [];
		for (var j=0;j<h; j++) {
			var a = [];
			for (var i=0;i<w; i++) {
				a.push(def);
			}
			res.push(a);
		}
		return res;
	}
	var CHUNK_SIZE = 8;
	var CHUNK_SIZE_BITS = 3;
	var TILE = 32;
	var TILE_BITS = 5;
	var BITS = CHUNK_SIZE_BITS + TILE_BITS;
	var W2 = CHUNK_SIZE + 2;
	
	var Map = function(w, h, def) {
		if (typeof def !== "undefined"){
			this.width = w;
			this.height = h;
			this.field = createTwoDimArray(w, h, def);
		} else {
			var conf = w, json = h;
			this.width = json.field[0].length;
			this.height = json.field.length;
			this.field = createTwoDimArray(this.width, this.height, 0);
			this.loadJSON(conf, json)
		}
		this.init();
	}
	
	Map.prototype = {
		width: 0,
		height: 0,
		cWidth: 0,
		cHeight: 0,
		revision: 0,
		modified: false,
		chunks: null,
		loadJSON : function(conf, json) {
			if (json.revision)
				this.revision = json.revision;
			if (this.height != json.field.length) throw "wrong map width in previous save";
			if (this.width != json.field[0].length) throw "wrong map height in previous save";
			for (var j=0;j<this.height;j++)
				for (var i=0;i<this.width;i++) {
					var tileName = json.tiles[json.field[j][i] & 0xff];
					var tile = conf.tileByName[tileName];
					var v = 0;
					if (!tile)
						v = conf.defaultTile.id;
					else
						v = tile.id;
							
					if (json.surface) {
						tileName = json.surface[(json.field[j][i] >> 8) &0xff];
						var tile = conf.tileByName[tileName];
						if (!tile)
							v |= conf.defaultSurface.id << 8;
						else
							v |= tile.id << 8;
					}
					if (this.chunks) 
						this.set(i, j, v);
					else 
						this.field[j][i] = v;
				}
			this.modified = false;
		},
		init: function() {
			if (this.width%CHUNK_SIZE!=0 || this.height%CHUNK_SIZE !=0) {
				throw "map size must be divisible by "+CHUNK_SIZE;
			}
			this.cWidth = this.width >> CHUNK_SIZE_BITS;
			this.cHeight = this.height >> CHUNK_SIZE_BITS;
			this.chunks = [];
			for (var y=0; y<this.cHeight; y++) {
				var row = [];
				for (var x=0; x<this.cWidth; x++) {
					row.push(new Chunk(this, x * CHUNK_SIZE, y * CHUNK_SIZE));
				}
				this.chunks.push(row);
			}
		},
		set: function(x, y, value) {
			if (x<0 || y<0 || x>=this.width || y>=this.height) return;
			if (this.field[y][x]==value) return;
			this.modified = true;
			this.field[y][x] = value;
			if (x%CHUNK_SIZE!=0 && x%CHUNK_SIZE!=CHUNK_SIZE-1 &&
				y%CHUNK_SIZE!=0 && y%CHUNK_SIZE!=CHUNK_SIZE-1) {
				this.chunks[y>>CHUNK_SIZE_BITS][x>>CHUNK_SIZE_BITS].touch();
				return;
			}
			for (var dx=-1;dx<=1; dx++)
				for (var dy=-1;dy<=1;dy++) {						
					var x1 = (x+dx+this.width)%this.width >> CHUNK_SIZE_BITS; 
					var y1 = (y+dy+this.height)%this.height >> CHUNK_SIZE_BITS;
					this.chunks[y1][x1].touch();
				}
		},
		setTile: function(x, y, value) {
			if (x<0 || y<0 || x>=this.width || y>=this.height) return;
			this.set(x, y, (this.field[y][x] & ~0xff) | value);
		},
		setSurface: function(x, y, value) {
			if (x<0 || y<0 || x>=this.width || y>=this.height) return;
			this.set(x, y, (this.field[y][x] & ~0xff00) | (value<<8));
		},
		get: function(x, y) {
			if (x<0 || y<0 || x>=this.width || y>=this.height) return 0;
			return this.field[y][x];
		},
		getTile: function(x, y) {
			if (x<0 || y<0 || x>=this.width || y>=this.height) return 0;
			return this.field[y][x] & 0xff;
		},
		getSurface: function(x, y) {
			if (x<0 || y<0 || x>=this.width || y>=this.height) return 0;
			return (this.field[y][x]>>8) & 0xff;
		},
		getChunk: function(chunkX, chunkY) {
			if (chunkX<0 || chunkY<0 || chunkX>=this.cWidth || chunkY>=this.cHeight) return 0;
			return this.chunks[chunkY][chunkX];
		}
	}

	var Chunk = function(map, x, y) {
		this.mem = createOneDimArray(W2*W2);
		this.memSurface = createOneDimArray(W2*W2);
		this.map = map;
		this.x = x;
		this.y = y;
		this.visual = createOneDimArray(CHUNK_SIZE * CHUNK_SIZE);
		this.visual2 = createOneDimArray(CHUNK_SIZE * CHUNK_SIZE);
		this.changes = [];
	}
	
	Chunk.prototype = {
		canvas: null,
		game: null,
		x: 0,
		y: 0,
		dirty: 3, //0 - not dirty, 1 - unknown, 2 - dirty, 3 - VERY DIRTY
		copyFromField : function(helper) {
			var map = this.map;
			var field = map.field, w = map.width, h = map.height;
			var k = 0;
			for (var j=-1;j<=CHUNK_SIZE; j++)
				for (var i=-1;i<=CHUNK_SIZE; i++) {
					var x1 = ((this.x+i)% w + w )%w;
					var y1 = ((this.y+j)% h + h )%h;
					this.mem[k] = field[y1][x1];
					this.memSurface[k++] = helper.getSurfaceByTile(field[y1][x1]);
				}
		},
		calcChanges: function(helper) {
			this.copyFromField(helper);
			var k = 0;
			var changes = this.changes;
			while (changes.length)
				changes.pop();
			for (var j=0;j<CHUNK_SIZE; j++)
				for (var i=0;i<CHUNK_SIZE; i++) {
					var k2 = W2 * (j+1) + (i+1);
					var v = helper.getTileNumber(this.mem, k2 - W2, k2, k2 + W2);
					var mod = 0;
					if (v!=this.visual[k]) {
						this.visual[k] = v;
						if (changes.length<10) {
							mod = 1;
							changes.push(k);
						}
					}
					v = helper.getSurfaceNumber(this.memSurface, k2 - W2, k2, k2 + W2);
					if (v!=this.visual2[k]) {
						this.visual2[k] = v;
						if (changes.length<10 && mod==0) 
							changes.push(k);
					}
					k++;
				}
			if (changes.length == 10)
				this.dirty = 3;
			else
			if (changes.length == 0)
				this.dirty = 0;
			else this.dirty = 2;
		},
		touch: function() {
			if (this.dirty == 0)
				this.dirty = 1;
		},
		clean: function() {
			this.dirty = 0;
		}
	}
	
	var Game = function(map, conf) {
		this.map = map;
		this.conf = conf;
		this.obj = createTwoDimArray(map.width, map.height, null);
		this.editor = new Editor(this);
	}
	
	Game.prototype = {
		getObj: function(x, y) {
			if (x<0 || y<0 || x>=this.map.width || y>=this.map.height) return 0;
			return this.obj[y][x];
		},
		rmObj: function(x, y) {
			if (x<0 || y<0 || x>=this.map.width || y>=this.map.height) return 0;
			this.obj[y][x] = null;
		},
		asJSON: function() {
			var res = {tiles:[], surface: [], field: this.map.field, revision:this.map.revision};
			for (var i=0;i<this.conf.tiles.length;i++)
				res.tiles.push(this.conf.tiles[i].name);
			for (var i=0;i<this.conf.surface.length;i++)
				res.surface.push(this.conf.surface[i].name);
			return res;
		},
		clearEntities: function() {
			for (var i=0;i<this.obj.length;i++)
				for (var j=0;j<this.obj[i].length;j++)
					this.obj[i][j] = null;
		},
		randomize: function(entities) {
			var map = this.map;
			for (var j=0; j<entities.length; j++) {
				var type = entities[j];
				var cnt = (map.width*map.height/type.density + 1) | 0;
				for (var i=0; i<cnt; i++) {
					var x = Math.random()*map.width|0;
					var y = Math.random()*map.height|0;
					var c = 50;
					while (c>0 && (this.conf.tiles[map.field[y][x]&0xff].type != "floor" || this.obj[y][x] != null))
					{
						x = Math.random()*map.width|0;
						y = Math.random()*map.height|0;
						c--;
					}
					//FLOOR
					if (this.obj[y][x] == null) {
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
						this.obj[y][x] = {type:type, 
							sx: sx, sy: sy, 
							dx:x*TILE + TILE/2, dy:y*TILE + TILE/2, 
							size: size};
					}
				}
			}
		},
		setTile: function(x, y, value) {
			if (x<0 || y<0 || x>=this.width || y>=this.height) return;
			var s = this.conf.tiles[value].surface;
			if (s != null && s.type != 1)
				this.map.set(x, y, value | (s.id<<8))
			else {
				this.map.setTile(x, y, value);
			}
		}
	}
	
	exports.Map = Map;
	exports.Game = Game;
})(typeof exports === 'undefined' ? window : exports)