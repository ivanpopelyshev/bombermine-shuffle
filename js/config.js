// Bombermine JS version 0.0.1 tiles config

(function(exports) {
	var Tile = function() {
	}
	
	Tile.prototype = {
		init: false,
		//basic part
		id: -1,
		name: "",
		type: "",
		
		//sprite part
		image: -1,
		imagePlain: -1,
		deepImg: -1,
		surfaceImg: -1,
		floorImg: -1,
		ceilingImg: -1,	
		ceilingImg2: -1,
		
		//tile part
		level: -1,
		bottomLess: false,
		deep: null,
		surface: null,
		floor: null,
		ceiling: null
		//levels: 0 - deep, 1 - surface, 2 - floor, 3- ceiling 4-ceiling+use plain
	}
	
	var TileGroup = function() {
		this.tiles = []
	}
	
	TileGroup.prototype = {
		id: -1,
		name: "",
		type: "",
		level: -1,
		deep: null,
		surface: null,
		floor: null,
		ceiling: null
	}
	
	Conf = function() {
		this.tiles = [];
		this.groups = [];
		this.tileByName = {};
		this.groupByName = {};
	}
	
	function floorByType(name) {
		if (name == "deep") return 0;
		if (name == "surface") return 1;
		if (name == "floor" || name=="arrow" || name=="abyss") return 2;
		if (name == "ceiling" || name=="box" || name=="building" || name=="tunnel") return 3;
		if (name == "solid" || name=="glass" || name=="hideout") return 4;
		return 1;
	}
	
	Conf.prototype = {
		newTile: function(name, map) {
			var tile = this.getTile(name);
			if (tile.init) throw "Second time creating tile";
			tile.init = true;
			if (map) {
				for (var key in map)
					if (map.hasOwnProperty(key))
						tile[key] = map[key];
			}
			tile.deep = this.getTile(tile.deep);
			tile.surface = this.getTile(tile.surface);
			tile.floor = this.getTile(tile.floor);
			tile.ceiling = this.getTile(tile.ceiling);
			return tile;
		},
		getTile: function(name) {
			if (typeof name != "string") {
				// its not the name!
				return name;
			}
			var id = -1;
			for (var i=0;i<this.tiles.length;i++)
				if (this.tiles[i].name == name)
					return this.tiles[i];
			index = this.tiles.length;
			var tile = new Tile();
			tile.id = index;
			tile.name = name;
			this.tiles.push(tile);
			if (name!="")
				this.tileByName[name] = tile;
			return tile;
		},
		newGroup: function(name, map) {
			if (this.groupByName.hasOwnProperty(name))
				throw "Second time creating group '"+name+"'";
			var group = new TileGroup();
			group.id = this.groups.length;
			group.name = name;
			this.groups.push(group);
			if (name!="")
				this.groupByName[name] = group;
			for (var key in map)
				if (map.hasOwnProperty(key))
					group[key] = map[key];
					
			group.deep = this.getTile(group.deep);
			group.surface = this.getTile(group.surface);
			group.floor = this.getTile(group.floor);
			group.ceiling = this.getTile(group.ceiling);
					
			for (var i=0;i<map.subTiles.length;i++) {
				var tile = this.getTile(map.subTiles[i]);
				if (!tile) throw "subtile is null";
				group.tiles.push(tile);
			}
		},
		bindSprite : function(childList) {
			var tiles = this.tiles;
			for (var i=0; i<tiles.length; i++) {
				var tile = tiles[i];
				tile.image = tile.image2 = -1;
			}
			//TODO: multiple sprites	
			//TODO: surfaces
			//TODO: box level, ceilings
			var byName = this.tileByName;
			for (var i=0;i<childList.length; i++) {
				var name = childList[i];
				if (byName.hasOwnProperty(name))
					byName[name].image = i;
				if (name.substring(name.length - 6, name.length) == "-plain") {
					var name2 = name.substring(0, name.length-6);
					if (byName.hasOwnProperty(name2))
						byName[name2].image2 = i;
				}
			}
			var groups = this.groups;
			for (var i=0;i<groups.length; i++) {
				var group = groups[i];
				tiles = group.tiles;
				var img = -1, img2 = -1;
				for (var j=0; j<tiles.length; j++) {
					var tile = tiles[j];
					if (tile.image!=-1) {
						img = tile.image;
						img2 = tile.image2;
					} else {
						tile.image = img;
						tile.image2 = img2;
					}
				}
			}
			tiles = this.tiles;
			for (var i=0; i<tiles.length; i++) {
				var tile = tiles[i];
				tile.deepImg = tile.deep?tile.deep.image:-1;
				tile.surfaceImg = tile.surface?tile.surface.image:-1;
				tile.floorImg = tile.floor?tile.floor.image:-1;
				tile.ceilingImg = tile.ceiling?tile.ceiling.image:-1;
				tile.ceilingImg2 = tile.ceiling?tile.ceiling.image2:-1;
				if (tile.image != -1) {
					switch (tile.level) {
						case 0: tile.deepImg = tile.image; break;
						case 1: tile.surfaceImg = tile.image; break;
						case 2: tile.floorImg = tile.image; break;
						case 4: tile.ceilingImg2 = tile.image2; 
						case 3: tile.ceilingImg = tile.image; break;
					}
				}
			}
			console.log(tiles);
		},
		defaultTile: null,
		defaultSurface: null,
		defaultDeepTile: null,
		setDefaultTile: function(tile) {
			this.defaultTile = tile;
		},
		setDefaultDeepTile: function(tile) {
			this.defaultDeepTile = tile;
		},
		setDefaultSurface: function(tile) {
			this.defaultSurface = tile;
		},
		link: function() {		
			if (this.defaultTile == null)
				this.defaultTile = this.tiles[0];
			var tiles, tile;
			var groups = this.groups;
			//1. pass things from group to tile
			for (var i=0;i<groups.length; i++) {
				var group = groups[i];
				tiles = group.tiles;
				for (var j=0; j<tiles.length; j++) {
					tile = tiles[j];
					if (group.type!="" && tile.type == "") tile.type = group.type;
					if (group.level!=-1 && tile.level == -1) tile.level = group.level;
					if (group.deep && !tile.deep) tile.deep = group.deep;
					if (group.surface && !tile.surface) tile.surface = group.surface;
					if (group.floor && !tile.floor) tile.floor = group.floor;
					if (group.ceiling && !tile.ceiling) tile.ceiling = group.ceiling;
					if (group.hasOwnProperty("bottomLess") && !tile.hasOwnProperty("bottomLess"))
						tile.bottomLess = group.bottomLess;
									//2. set tile image to tile
				}
			}
			//3. set tile deep = default deep if tile deep is -1. Set tile deep to -1 if it points to bad tile
			tiles = this.tiles;
			for (var i=0; i<tiles.length; i++) {
				tile = tiles[i];
				if (!tile.init) {
					throw "no calls of newTile for '"+tile.name+"'"
				}
				if (tile.level == -1) {
					if (tile.type != "")
						tile.level = floorByType(tile.type)
					else {
						tile.type = "floor";
						tile.level = 2; //floor
					}
				}
			}
			var defTile = this.defaultTile;
			for (var i=0; i<tiles.length; i++) {
				tile = tiles[i];
				if (!tile.deep) tile.deep = this.defaultDeepTile;
				if (!tile.floor && tile.level == 3 && defTile.level == 2) {
					tile.floor = defTile;
				}
				if (tile.level == 1)
					tile.surface = tile;
				if (!tile.surface && tile.level >= 2 && defTile.level == 1) {
					tile.surface = defTile;
				}
			}
		}
	}
	
	exports.Conf = Conf;
})(typeof exports === 'undefined' ? window : exports)