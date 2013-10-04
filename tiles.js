app.addModule({beforeStart:function(app) {

app.addAssets({
	name: "tileset",
	url: "img/tileset.png",
	frameWidth: 32,
	frameHeight: 32,
	rows: [
		["grass", "", "abyss", "", "sand"],
		[],
		[],
		["dirt", "grass2", "grass3", "field", "hole1", "hole2", "hole3", "hole4"],
		["rocky", "rocky_hole", "dirty", "dirty_hole", "bridge_h", "bridge_v", "bridge_metal_v", "bridge_metal_h"],
		["tile", "tile2", "tile3", "tile4", "left", "up", "right", "down"],
		["button_off", "button_on", "bridge_off", "bridge_on", "tile_blue", "tile_red", "tile_yellow", "tile_purple"],
		["deep_default", "deep_bridge", "", "", "", "well"],
		["rock3-plain", "rock3", "rock2-plain", "rock2", "rock1-plain", "rock1", "rock0-plain", "rock0"],
		["chest_in_rock-plain", "chest_in_rock", "silver2-plain", "silver2", "silver1-plain", "silver1", "silver0-plain", "silver0"],
		["tough9", "tough6", "gold2-plain", "gold2", "gold1-plain", "gold1", "gold0-plain", "gold0"],
		["tough4", "tough2", "diamond2-plain", "diamond2", "diamond1-plain", "diamond1", "diamond0-plain", "diamond0"],
		["wall6-plain", "wall6", "wall4-plain", "wall4", "wall2-plain", "wall2", "metal"],
		["brick-plain", "brick", "bush-plain", "bush", "box_block", "logs", "cactus"],
		["chest", "gold_chest", "diamond_chest", "metal_chest"],
		["box1", "box_with_bombs", "goal", "wc"],
		["gate_closed", "tunnel", "gate_opened"],
		["tube1", "tube2", "tube3", "tube4", "spike_off", "spike_on", "jumppad_off", "jumppad_on"],
		["flag_blue", "flag_red", "flag_yellow", "flag_purple"]]
});

var conf = app.conf, 
	newTile = conf.newTile.bind(conf), 
	newGroup = conf.newGroup.bind(conf), 
	newSurface = conf.newSurface.bind(conf), 
	newDeep = conf.newDeep.bind(conf), 
	getDeep = conf.getDeep.bind(conf), 
	getSurface = conf.getSurface.bind(conf), 
	sub = conf.newTile.bind(conf),
	getTile = conf.getTile.bind(conf);

conf.setDefaultTile(newTile("nothing"))

conf.setDefaultDeep(newDeep("deep_default"))
newDeep("deep_bridge");

newSurface("grass")
newSurface("abyss", {type: 1})
newSurface("sand")
newSurface("tile", {type: 2})
conf.setDefaultSurface(newSurface("dirt"));

newGroup("basic", {
	type: "floor",
    subTiles: [
        sub("grass1", { surface: "grass" }),
        sub("sand1", { surface: "sand" }),
		sub("dirt1", { surface: "dirt" }),
		sub("tile1", { surface: "tile" }),
    ]
})

newTile("abyss1", { surface: "abyss", type: "abyss", bottomLess: true });

newGroup("boxes", {
	type: "box",
	subTiles: [
		sub("logs"),
		sub("cactus"),
		sub("box1"),
		sub("box_with_bombs")
	]
});

newGroup("special", {
	type: "building",
	subTiles: [
		sub("goal"),
		sub("wc"),
		sub("flag_blue"), 
		sub("flag_red"), 
		sub("flag_yellow"), 
		sub("flag_purple")
	]
})

newGroup("jumppad", {
	type: "building",
	subTiles: [
		sub("jumppad_on"),
		sub("jumppad_off")
	]
})
newGroup("bridge", {
    type: "floor",
	surface: "abyss",
    deep: getDeep("deep_bridge"),
    subTiles: [
        sub("bridge_h"),
        sub("bridge_v")
    ]
})
newGroup("bridge_metal", {
    type: "floor",
	surface: "abyss",
    deep: getDeep("deep_bridge"),
    subTiles: [
        sub("bridge_metal_v"),
        sub("bridge_metal_h")
    ]
})
newGroup("tile", {
    type: "floor",
    subTiles: [
        sub("tile2"),
        sub("tile3"),
        sub("tile4")
    ]
})
newGroup("arrow", {
    type: "arrow",
    deep: getDeep("deep_bridge"),
    subTiles: [
        sub("left"),
        sub("up"),
        sub("right"),
        sub("down")
    ]
})
newTile("brick", {
    type: "solid"
})

newTile("metal", {
    type: "solid"
})
newGroup("chest", {
    type: "box",
	subTiles: [
		sub("chest"),
		sub("gold_chest"),
		sub("metal_chest"),
		sub("diamond_chest")
	]
})

newGroup("bush", {
    subTiles: [
        sub("bush", {type:"glass"}),
        sub("bush_hollow", {type:"hideout"})
    ]
})
newGroup("gate", {
    subTiles: [
        sub("gate_closed", {type: "box"}),
        sub("gate_opened", {type: "building"}) 
    ]
})
	
conf.link();
}})