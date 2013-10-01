(function(exports) {
	var Resources = function(assets, callback) {
		var self = this;
		var count = 1;
		
		var done = function() {
			count--;
			if (count==0) {
				if (callback)
					callback();
			}
		}
		this.assets = assets;
		this.assetByName = {};
		for (var i=0;i<assets.length; i++) {
			var asset = assets[i];
			if (asset.url) {
				count++;
				var img = new Image();
				img.onload = done;
				img.src = asset.url;
				asset.image = img;
			}
		}
		done();
	}
	
	Resources.prototype = {	
		processTiles: function(conf) {
			this.entities = [];
			for (var i=0;i<this.assets.length; i++) {
				var asset = this.assets[i];
				if (asset.name=="tileset") {
					//TODO: multiple tilesets
					this.tileset = asset;
				} else this.entities.push(asset);
			}
			
			var asset = this.tileset;
			if (asset == null) return;
			asset.frames = [];
			asset.childList = [];
			for (var i=0;i<asset.rows.length;i++)
				for( var j=0;j<asset.rows[i].length;j++) {
					var name = asset.rows[i][j];
					if (name!="") {
						asset.frames.push({x:asset.frameWidth * j, y: asset.frameHeight * i});
						asset.childList.push(name);
					}
				}
			conf.bindSprite(asset.childList);
		}
	}
	
	exports.Resources = Resources;
})(typeof exports === 'undefined' ? window : exports)
