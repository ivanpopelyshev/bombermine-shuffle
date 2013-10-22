var app = {
	VERSION : "0.1",
	beforeStart : [],
	afterStart: [],
	conf : new Conf(),
	assets : [],
	resources: null,
	game: null,
	style: "",
	tool: 0, //0 - CURSOR, 1 - PENCIL, 2 - RECT

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
		var canvas=$("#screen")[0], builderCanvas = $("#builder")[0];
		this.map = map;
		var game = app.game = new Game(this.map, this.conf);
		if (rand)
			game.randomize(this.resources.entities);
		var renderer = this.renderer = new Renderer(canvas, this.game, this.resources);
		var builder = this.builder = new Builder(builderCanvas, this.game, this.resources, renderer);
		renderer.renderAll();
		builder.render();
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
			/*$("#builder").resize(function() {
				if (this.builder)
					this.biulder.render();
			});*/
			var loaded = false;
			self.loadSettings();
			if (self.mapName) {
				try {
					self.loadMap(self.mapName, true);
					loaded = true;
				} catch (e) {
					console.log("cant load map "+ localStorage.getItem("mapName"));
				}
			}
			if (!loaded) {
				self.reset(true);
			}
			self.loadSettings();
			resize();
			for (var key in self.afterStart)
				self.afterStart[key](self);
				
			//AUTOSAVE
			setInterval(function() {
				if (self.map.modified)
					self.saveRev();
			}, 5000);
		});
	},
	
	mapName: "default",
	
	newMap: function(size, rand) {
		if (!size) size = 72;
		this.setup(new Map(size, size, this.conf.defaultTile.id), rand);
	},
	
	reset: function(rand) {
		this.setup(new Map(this.conf, this.defaultSave), rand);
	},
	
	loadMap: function(name, rand) {
		var style = this.style
		var key = style + "_"+name;
		if (name && localStorage[key]) {
			var save = JSON.parse(localStorage[key]);
			this.setup(new Map(this.conf, save), rand);
			//this.game.loadJSON(save)
		} else console.log("map '"+name+"' not found");
		this.mapName = name;
		this.saveSettings();
		console.log("map '"+name+"' loaded");
	},
	
	saveSettings: function() {
		localStorage[this.style+"-"+"mapName"] = this.mapName;
		localStorage[this.style+"-"+"clipboard"] = JSON.stringify(this.game.editor.memCopy);
	},
	
	loadSettings: function() {
		if (localStorage["version"] != app.VERSION) {
			localStorage.clear();
			localStorage["version"] = app.VERSION
		}			
		this.mapName = localStorage[this.style+"-mapName"] || "default"
		if (this.game && localStorage[this.style+"-"+"clipboard"]) {
			var sv = JSON.parse(localStorage[this.style+"-"+"clipboard"]);
			if (sv)
				this.game.editor.memCopy = sv
		}
	},
	
	saveRev: function() {
		if (!this.map.modified) return;
		var mapName = this.mapName
		var style = this.style
		this.map.revision++;
		var save = JSON.stringify(this.game.asJSON());
		var key = style+"_"+mapName+"_rev"+this.map.revision
		var key2 = style+"_"+mapName+"_rev"+(this.map.revision-20) 
		var key3 = style+"_"+mapName+"_rev"+(this.map.revision+1) 
		localStorage[key] = save
		localStorage[style+"_"+mapName] = save
		if (localStorage[key2])
			localStorage.removeItem(key2);
		if (localStorage[key3])
			localStorage.removeItem(key3);
		this.saveSettings();
		this.map.modified = false;
		console.log("saved: '"+mapName+"' rev"+this.map.revision);
	},
	
	undo: function() {
		if (this.map.modified)
			this.saveRev();
		var mapName = this.mapName
		var style = this.style
		var key = style+"_"+mapName+"_rev"+(this.map.revision-1);
		if (!localStorage[key]) return;
		var save1;
		var save = JSON.parse(save1 = localStorage[key]);
		this.map.loadJSON(this.game.conf, save);
		localStorage[style+"_"+mapName] = save1
		this.renderer.renderAll();
	},
	
	redo: function() {
		if (!this.map.modified)
			this.saveRev();
		var mapName = this.mapName
		var style = this.style
		var key = style+"_"+mapName+"_rev"+(this.map.revision+1);
		if (!localStorage[key]) return;
		var save1;
		var save = JSON.parse(save1 = localStorage[key]);
		this.map.loadJSON(this.game.conf, save);
		localStorage[style+"_"+mapName] = save1
		this.renderer.renderAll();
	},
	
	saveMap: function(name) {
		if (!name) return;
		this.mapName = name;
		this.map.modified = false;
		this.map.revision = 0;
		console.log("map will be saved as '"+name+"'");
		this.saveRev();
	}
}