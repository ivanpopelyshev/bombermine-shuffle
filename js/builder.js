(function(exports) {
	var CHUNK_SIZE = 8;
	var CHUNK_SIZE_BITS = 3;
	var TILE = 32;
	var TILE_BITS = 5;
	var BITS = CHUNK_SIZE_BITS + TILE_BITS;

	var Builder = function(canvas, game, resources, renderer) {
		this.canvas = canvas;
		this.game = game;
		this.resources = resources;
		this.renderer = renderer;
		this.selection = {
			tileX1: 0,
			tileX2: 0,
			tileY1: 0, 
			tileY2: 0,
			enabled: false
		}
	}
	
	Builder.prototype = {
		renderer: null,
		canvas: null,
		game: null,
		resources: null,
		
		W: 0,
		H: 0,
		
		canvas: null,
		
		selectAt: function(x, y) {
			if (x<0 || y<0 || x>=this.W || y>=this.H) return;
			var editor = this.game.editor
			editor.camSelected = null;
			editor.tileSelected = null;
			x = x/TILE|0
			y = y/TILE|0
			var ind = x + y * this.W / TILE | 0;
			if (ind>=0 && ind<this.game.conf.tiles.length) {
				editor.tileSelected = this.game.conf.tiles[ind];
				if (editor.tileSelected.type == "deep")
					editor.tileSelected = null;
			}
		},

		render: function() {		
			var editor = this.game.editor;
			var conf = this.game.conf;
			this.canvas.width = this.canvas.parentNode.clientWidth;
			this.canvas.height = this.canvas.parentNode.clientHeight;
			
			var COLS = this.canvas.width >> TILE_BITS;
			var ROWS = this.canvas.height >> TILE_BITS;
			var builderW = this.W = COLS*TILE;
			var builderH = this.H = ROWS*TILE;
			var builderCanvas = this.canvas;			
			var tiles = conf.tiles;
			var asset = this.resources.tileset;
			var context = builderCanvas.getContext("2d")
			context.fillStyle = 'black';
			context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			var b = [0, 0, 0, 0, 0, 0, 0, 0, 0], a = [0, 0, 0];
			for (var i=0;i<tiles.length; i++) {
				var x = i % COLS, y = i/COLS|0;
				var tile = tiles[i];
				b[5] = tile.id;
				var t = this.renderer.getTileNumber(b, 2, 5, 8);
				var num = t & 0xff;
				if (num!=255) context.drawImage(asset.image, asset.frames[num].x, asset.frames[num].y, asset.frameWidth, asset.frameHeight,  x*TILE, y*TILE, TILE, TILE);					
				if (tiles[i].surface) {
					num = tiles[i].surface.image & 0xff;
					if (num!=255) context.drawImage(asset.image, asset.frames[num].x, asset.frames[num].y, asset.frameWidth, asset.frameHeight,  x*TILE, y*TILE, TILE, TILE);					
				}
				num = (t>>8)&0xff;					
				if (num!=255) context.drawImage(asset.image, asset.frames[num].x, asset.frames[num].y, asset.frameWidth, asset.frameHeight,  x*TILE, y*TILE, TILE, TILE);
				num = (t>>16)&0xff;
				if (num!=255) context.drawImage(asset.image, asset.frames[num].x, asset.frames[num].y, asset.frameWidth, asset.frameHeight,  x*TILE, y*TILE, TILE, TILE);
				if (tile.type == "deep") {
					context.fillStyle = "rgba(255, 0, 0, 0.5f)";
					context.fillRect(x * TILE, y * TILE, TILE, TILE);
				}
			}
			if (editor.tileSelected != null) {
				var x = editor.tileSelected.id % COLS, y = editor.tileSelected.id / COLS | 0;
				context.strokeStyle = "blue";
				context.lineWidth = 2;
				context.strokeRect(x * TILE, y * TILE, TILE, TILE);				
			}
			var name = editor.tileSelected!=null?editor.tileSelected.name:"undefined";		
			context.fillStyle = "white";
			context.textAlign = "right";
			context.font = "bold 11px Tahoma, Arial";
			context.fillText(name, builderW - 10, builderH - 10);
		}
	}
	
	exports.Builder = Builder;
})(typeof exports === 'undefined' ? window : exports)
