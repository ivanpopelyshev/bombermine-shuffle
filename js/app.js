var app = {
	beforeStart : [],
	afterStart: [],
	conf : new Conf(),
	assets : [],
	resources: null,
	game: null,

	addAssets: function(asset) {
		if (asset instanceof Array) {
			for (var i=0;i<asset.length;i++)
				this.assets.push(asset[i]);
		} else this.assets.push(asset);
	},
	
	addModule: function(module) {
		if (module.beforeStart)
			this.beforeStart.push(module.beforeStart);
		if (module.afterStart)
			this.afterStart.push(module.afterStart);
	},
	
	setup: function(map, rand) {
		var canvas=$("#screen")[0];
		this.map = map;
		var game = app.game = new Game(this.map, this.conf);
		if (rand)
			game.randomize(this.resources.entities);
		var renderer = this.renderer = new Renderer(canvas, this.game, this.resources);
		renderer.renderAll();
	},
	
	start: function() {
		var self = this;
		for (var key in self.beforeStart)
			self.beforeStart[key](self);
		this.resources = new Resources(this.assets, function() {
			self.resources.processTiles(self.conf);	
			var canvas=$("#screen")[0];
			var resize = function() {
				canvas.width = window.innerWidth-20;
				canvas.height = window.innerHeight-20;
				self.renderer.renderAll();
			}
			$(window).resize(resize);
			var loaded = false;
			if (localStorage["mapName"]) {
				try {
					self.loadMap(localStorage["mapName"], true);
					loaded = true;
				} catch (e) {
					console.log("cant load map "+ localStorage.getItem("mapName"));
				}
			} 
			if (!loaded)
				self.reset(true);
			resize();
			for (var key in self.afterStart)
				self.afterStart[key](self);
				
			//AUTOSAVE
			setInterval(function() {
				if (self.map.modified)
					self.saveMap();
			}, 5000);
		});
	},
	
	mapName: "default",
	
	newMap: function() {
		this.map = new Map(72, 72, this.conf.defaultTile.id);
		var game = this.game = new Game(this.map, this.conf);
	},
	
	reset: function(rand) {
		this.setup(new Map(this.conf, this.defaultSave), rand);
	},
	
	loadMap: function(name, rand) {
		if (name && localStorage[name]) {
			this.setup(new Map(this.conf, JSON.parse(localStorage[name])), rand);
		} else console.log("map '"+name+"' not found");
		this.mapName = localStorage["mapName"] = name;
		console.log("map '"+name+"' loaded");
	},
	
	saveMap: function(name) {
		name = name || this.mapName;
		this.map.modified = false;
		localStorage[name] = JSON.stringify(this.game.asJSON());
		localStorage["mapName"] = name;
		console.log("map saved as '"+name+"'");
	}
}