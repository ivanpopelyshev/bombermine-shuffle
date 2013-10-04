// Bombermine JS version 0.0.1 tiles config

(function(exports) {
	var FLOOR = 0, CEILING = 1, SOLID = 2;

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
	
	var SimpleTile = function() {
	}
	
	SimpleTile.prototype = {
		init: false,
		type: "",
		id: -1,
		name: "",
		image: -1
	};
	
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
		this.surface = [];
		this.deep = [];
		this.groups = [];
		this.tileByName = {};
		this.groupByName = {};
	}
	
	function levelByType(name) {
		if (name == "floor" || name=="arrow" || name=="abyss") return FLOOR;
		if (name == "ceiling" || name=="box" || name=="building" || name=="tunnel") return CEILING;
		if (name == "solid" || name=="glass" || name=="hideout") return SOLID;
		return CEILING;
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
			tile.deep = this.getDeep(tile.deep);
			tile.surface = this.getSurface(tile.surface);
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
		newSurface: function(name, map) {
			var tile = this.getSurface(name);
			if (tile.init) throw "Second time creating surface tile";
			tile.init = true;
			if (map) {
				for (var key in map)
					if (map.hasOwnProperty(key))
						tile[key] = map[key];
			}
			return tile;
		},
		getSurface: function(name) {
			if (typeof name != "string") {
				// its not the name!
				return name;
			}
			var id = -1;
			for (var i=0;i<this.surface.length;i++)
				if (this.surface[i].name == name)
					return this.surface[i];
			index = this.surface.length;
			var tile = new SimpleTile();
			tile.id = index;
			tile.name = name;
			this.surface.push(tile);
			if (name!="")
				this.tileByName[name] = tile;
			return tile;
		},
		newDeep: function(name, map) {
			var tile = this.getDeep(name);
			if (tile.init) throw "Second time creating deep tile";
			tile.init = true;
			if (map) {
				for (var key in map)
					if (map.hasOwnProperty(key))
						tile[key] = map[key];
			}
			return tile;
		},
		getDeep: function(name) {
			if (typeof name != "string") {
				// its not the name!
				return name;
			}
			var id = -1;
			for (var i=0;i<this.deep.length;i++)
				if (this.deep[i].name == name)
					return this.deep[i];
			index = this.deep.length;
			var tile = new SimpleTile();
			tile.id = index;
			tile.name = name;
			this.deep.push(tile);
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
					
			group.deep = this.getDeep(group.deep);
			group.surface = this.getSurface(group.surface);
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
			for (var i=0; i<this.surface.length; i++) {
				var tile = this.surface[i];
				tile.image = -1;
			}
			for (var i=0; i<this.deep.length; i++) {
				var tile = this.deep[i];
				tile.image = -1;
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
				tile.floorImg = tile.floor?tile.floor.image:-1;
				tile.ceilingImg = tile.ceiling?tile.ceiling.image:-1;
				tile.ceilingImg2 = tile.ceiling?tile.ceiling.image2:-1;
				if (tile.image != -1) {
					switch (tile.level) {
						case 0: tile.floorImg = tile.image; break;
						case 2: tile.ceilingImg2 = tile.image2; 
						case 1: tile.ceilingImg = tile.image; break;
					}
				}
			}
			console.log(tiles);
		},
		defaultTile: null,
		defaultSurface: null,
		defaultDeep: null,
		setDefaultTile: function(tile) {
			this.defaultTile = tile;
		},
		setDefaultDeep: function(tile) {
			this.defaultDeep = tile;
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
			tiles = this.tiles;
			for (var i=0; i<tiles.length; i++) {
				tile = tiles[i];
				if (!tile.init) {
					throw "no calls of newTile for '"+tile.name+"'"
				}
				if (tile.level == -1) {
					if (tile.type != "")
						tile.level = levelByType(tile.type)
					else {
						tile.type = "floor";
						tile.level = FLOOR; //floor
					}
				}
			}
			for (var i=0; i<tiles.length; i++) {
				tile = tiles[i];
				if (!tile.deep) tile.deep = this.defaultDeep;
				if (!tile.floor && tile.level == CEILING && this.defaultTile.level == FLOOR) {
					tile.floor = this.defaultTile;
				}
			}
		}
	}
	
	exports.Conf = Conf;
})(typeof exports === 'undefined' ? window : exports)