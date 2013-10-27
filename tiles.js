app.addModule({beforeStart:function(app) {

app.style = "grassfield"

app.addAssets({
	name: "tileset",
	url: "img/tileset.png",
	frameWidth: 32,
	frameHeight: 32,
	rows: [
		["grass", "", "deep", "", "sand", "", "dirt"],
		[],
		[],
		["rocky1", "grass2", "grass3", "field", "hole1", "hole2", "hole3", "hole4"],
		["", "rocky_hole", "", "dirty_hole", "bridge_h", "bridge_v", "bridge_metal_v", "bridge_metal_h"],
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
		["flag_white", "flag_red", "flag_blue", "flag_yellow", "flag_purple"]]
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
newSurface("deep", {type: 1})
newSurface("dirt")
newSurface("sand")
newSurface("tile", {type: 2})
conf.setDefaultSurface(newSurface("rocky1"));

newTile("cactus");

newGroup("basic", {
	type: "floor",
    subTiles: [
        sub("sand1", { surface: "sand" })
    ]
})

newTile("abyss", { surface: "deep", type: "abyss", bottomLess: true });

newGroup("grass", {
    type: "floor",
	surface: "grass",
    subTiles: [
         sub("grass1"),
        sub("grass2"),
        sub("grass3")
    ]
});

newTile("field", { surface: "grass" });

newGroup("hole", {
    type: "floor",
    subTiles: [
        sub("hole1", { surface: "grass" }),
        sub("hole2", { surface: "grass" }),
        sub("hole3", { surface: "rocky1" }),
        sub("hole4", { surface: "rocky1" })
    ]
})
newGroup("rocky", {
    type: "floor",
	surface: "rocky1",
    subTiles: [
        sub("rocky"),
        sub("rocky_hole")
    ]
})
newGroup("dirty", {
    type: "floor",
	surface: "dirt",
    subTiles: [
        sub("dirty"),
        sub("dirty_hole")
    ]
})
newGroup("bridge", {
    type: "floor",
	surface: "deep",
    deep: "deep_bridge",
    subTiles: [
        sub("bridge_h"),
        sub("bridge_v")
    ]
})
newGroup("bridge_metal", {
    type: "floor",
	surface: "deep",
    deep: "deep_bridge",
    subTiles: [
        sub("bridge_metal_v"),
        sub("bridge_metal_h")
    ]
})
newGroup("tile", {
    type: "floor",
	surface: "tile",
    subTiles: [
        sub("tile1"),
        sub("tile2"),
        sub("tile3"),
        sub("tile4")
    ]
})
newGroup("arrow", {
    type: "arrow",
	surface: "tile",
    deep: "deep_bridge",
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

newGroup("rock", {
    type: "solid",
    subTiles: [
        sub("rock3"),
        sub("rock2"),
        sub("rock1"),
        sub("rock0"),
        sub("silver3"),
        sub("silver2"),
        sub("silver1"),
        sub("silver0"),
        sub("gold3"),
        sub("gold2"),
        sub("gold1"),
        sub("gold0"),
        sub("diamond3"),
        sub("diamond2"),
        sub("diamond1"),
        sub("diamond0")
    ]
})
newGroup("tough", {
    type: "solid",
    subTiles: [
        sub("tough9"),
        sub("tough8"),
        sub("tough7"),
        sub("tough6"),
        sub("tough5"),
        sub("tough4"),
        sub("tough3"),
        sub("tough2"),
        sub("tough1")
    ]
})
newGroup("wall", {
    type: "solid",
    subTiles: [
        sub("wall6"),
        sub("wall5"),
        sub("wall4"),
        sub("wall3"),
        sub("wall2"),
        sub("wall1")
    ]
})
newTile("chest_in_rock", {
    type: "solid"
})
newTile("metal", {
    type: "solid"
})
newGroup("tunnel", {
    type: "tunnel",
	subTiles: [
		sub("tunnel", {surface: "rocky1"}),
		sub("tunnel_tile", {surface: "tile"})
	]
})
newGroup("chest", {
    type: "box",
	subTiles: [
		sub("chest"),
		sub("gold_chest"),
		sub("gold_chest_tile", {surface: "tile"}),
		sub("metal_chest"),
		sub("metal_chest_tile", {surface: "tile"}),
		sub("diamond_chest")
	]
})

newGroup("box", {
    type: "box",
    surface: "tile",
    subTiles: [
        sub("box1"),
        sub("box2")
    ]
})

newGroup("box_bombs", {
    type: "box",
    subTiles: [
        sub("box_with_bombs"),
        sub("box_with_bombs_tile", {surface: "tile"})
    ]
})

newTile("goal", {
    type: "building",
    floor: "field",
})

newTile("wc", {
    type: "building"
})
newGroup("bush", {
    subTiles: [
        sub("bush", {type:"glass"}),
        sub("bush_hollow", {type:"hideout"})
    ]
})
newGroup("gate", {
    surface: "rocky1",
    subTiles: [
        sub("gate_closed", {type: "box"}),
        sub("gate_opened", {type: "building"}) 
    ]
})
newGroup("button", {
    surface: "tile",
    type: "floor",
    subTiles: [    
        sub("button_off"),
        sub("button_on"),
        sub("button_fake")
    ]
})
newGroup("button_toggle", {
    surface: "tile",
    type: "floor",
    subTiles: [    
        sub("button2_off", {floor:"button_off"}),
        sub("button2_on", {floor:"button_on"}) 
    ]
})
newGroup("bridge_toggle", {
    surface: "deep",
	bottomLess : true,
    subTiles: [
        sub("bridge_off", {type: "abyss"}),
        sub("bridge_on", {type: "floor"})
    ]
})

newGroup("flag", {
	type: "building",
	subTiles: [
		sub("flag_white"),
		sub("flag_red"),
		sub("flag_blue"),
		sub("flag_yellow"),
		sub("flag_purple")
	]
})

newGroup("tubes", {
	type: "box",
	surface: "tile",
	deep: "deep_bridge",
	subTiles: [
		sub("tube1"),
		sub("tube2"),
		sub("tube3"),
		sub("tube4")
	]
})
	
conf.link();
}})