(function(exports) {
	var CHUNK_SIZE = 8;
	var CHUNK_SIZE_BITS = 3;
	var TILE = 32;
	var TILE_BITS = 5;
	var BITS = CHUNK_SIZE_BITS + TILE_BITS;

	var Editor = function(game) {
		this.game = game;
		this.selection = {
			tileX1: 0,
			tileX2: 0,
			tileY1: 0, 
			tileY2: 0,
			enabled: false,
			mem: null
		}
		this.memCopy = null;
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
	
	function memcpy(b) {
		var res = [];
		for (var j=0;j<b.length; j++) {
			var a = [];
			for (var i=0;i<b[j].length; i++) {
				a.push(b[j][i]);
			}
			res.push(a);
		}
		return res;
	}
	
	Editor.prototype = {
		canvas: null,
		game: null,
		resources: null,
		entity: null,
		tileSelected: null,
		
		cursorAt : function(p, mode) {
			this.entity = this.game.getObj(p.x >> TILE_BITS, p.y >> TILE_BITS);
			this.selection.enabled = 0
		},
		pencilAt: function(p, mode) {
			if (this.tileSelected == null) return;
			this.selection.enabled = 0
			var x = p.x >> TILE_BITS
			var y = p.y >> TILE_BITS
			var w = this.game.map.width, h = this.game.map.height;
			x = (x%w+w)%w;
			y = (y%h+h)%h;
			this.game.setTile(x, y, this.tileSelected.id)
			this.game.rmObj(x, y);
		},
		selectAt: function(p, mode) {
			var selection = this.selection;
			var x = p.x >> TILE_BITS;
			var y = p.y >> TILE_BITS;
			if (mode==0) {
				selection.tileX1 = x;
				selection.tileY1 = y;
			}
			selection.tileX2 = x;
			selection.tileY2 = y;
			selection.enabled = 1
			if (mode==2) {
				if (selection.tileX1>selection.tileX2) {
					var t = selection.tileX1;
					selection.tileX1 = selection.tileX2;
					selection.tileX2 = t;
				}
				if (selection.tileY1>selection.tileY2) {
					var t = selection.tileY1;
					selection.tileY1 = selection.tileY2;
					selection.tileY2 = t;
				}
				selection.enabled = 2
				selection.w = selection.tileX2 - selection.tileX1 + 1;
				selection.h = selection.tileY2 - selection.tileY1 + 1;
				selection.mem = createTwoDimArray(selection.w, selection.h, this.tileSelected?this.tileSelected.id:this.game.conf.defaultTile.id);
			}
		},
		swapSelection: function() {
			var selection = this.selection;
			var x1 = selection.tileX1;
			var y1 = selection.tileY1;
			var x2 = selection.tileX2;
			var y2 = selection.tileY2;
			var w = selection.w, h = selection.h;
			var W = this.game.map.width, H = this.game.map.height;
			for (var i=0;i<w; i++)
				for (var j=0;j<h; j++) {
					var x = ((i+x1)%W+W)%W
					var y = ((j+y1)%H+H)%H
					var tileId = this.game.map.get(x, y);
					this.game.map.set(x, y, selection.mem[j][i]);
					selection.mem[j][i] = tileId;
				}
		},
		selectionHasPoint: function(p) {
			var selection = this.selection;
			return selection.enabled==2 && 
				selection.tileX1*TILE<=p.x && selection.tileX2*TILE+TILE>=p.x &&
				selection.tileY1*TILE<=p.y && selection.tileY2*TILE+TILE>=p.y;
		},
		moveSelection: function(dx, dy, mode) {
			var selection = this.selection;
			if (selection.enabled!=2)
				return;
			this.swapSelection();
			selection.tileX1 += dx;
			selection.tileY1 += dy;
			selection.tileX2 += dx;
			selection.tileY2 += dy;
			this.swapSelection();
		},
		fill: function() {
			if (this.selection.enabled!=2)
				return false;
			if (!this.tileSelected)
				return false;
			var x1 = this.selection.tileX1;
			var y1 = this.selection.tileY1;
			var x2 = this.selection.tileX2;
			var y2 = this.selection.tileY2;
			var w = this.game.map.width, h = this.game.map.height;
			for (var x=x1;x<=x2;x++)
				for (var y=y1;y<=y2;y++) {
					this.game.setTile((x%w+w)%w, (y%h+h)%h, this.tileSelected.id);
				}
		},
		copy: function() {
			if (this.selection.enabled!=2)
				return false;
			this.swapSelection();
			this.memCopy= memcpy(this.selection.mem);
			this.swapSelection();
		},
		paste: function(p) {
			var selection = this.selection;
			var memCopy = this.memCopy;
			if (!memCopy) return;
			selection.enabled = 2;
			var w = selection.w = memCopy[0].length
			var h = selection.h = memCopy.length
			selection.tileX1 = (p.x >> TILE_BITS) - (w>>1);
			selection.tileY1 = (p.y >> TILE_BITS) - (h>>1);
			selection.tileX2 = selection.tileX1+w-1;
			selection.tileY2 = selection.tileY1+h-1;
			selection.mem = memcpy(memCopy)
			this.swapSelection();
		}
	}
	
	exports.Editor = Editor
})(typeof exports === 'undefined' ? window : exports)
