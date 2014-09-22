app.addModule({beforeStart:function(app) {
	app.addAssets([{
		name: "player",
		density: 96,
		url: "img/dis2_spider.png",
		frameWidth: 56,
		frameHeight: 54,
		renderWidth: 42,
		animStand: 1,
		framesX: 8,
		framesY: 4,
		animSpeed: 1200,
		animMirrorLeft: true,
		speed: 4,
		row: [0, 1, 2, 1]
	},
	{
		name: "pony",
		density: 96,
		url: "img/pony.png",
		frameWidth: 55,
		frameHeight: 54,
		renderWidth: 45,
		animStand: 1,
		framesX: 6,
		framesY: 4,
		animSpeed: 1800,
		speed: 4,
		row: [0, 1, 2, 3]
	},	
	{
		name: "player",
		// one sprite per 48 tiles
		density: 96,
		url: "img/cbcharactvx1009.png",
		frameWidth: 32,
		frameHeight: 48,
		//entity size
		renderWidth: 24,
		//four frames
		framesX: 4, 
		//four animations
		framesY: 4,
		//animation parameters, animSpeed / speed ms per one cycle
		//default 1200 / 4 = 300ms per one cycle
		animSpeed: 1200,
		//speed/16 tiles per 100ms
		//default value is 4, it means 2.5 tiles per second 
		//max value is 6, NYAN value is 7
		speed: 4,
		//UP, RIGHT, LEFT, DOWN
		row: [3, 2, 0, 1]
	},		
	{
		name: "player",
		// one sprite per 48 tiles
		density: 96,
		url: "img/character.png",
		frameWidth: 34,
		//entity size
		renderWidth: 34,
		//four frames
		framesX: 4, 
		//four animations
		framesY: 4,
		//animation parameters, animSpeed / speed ms per one cycle
		//default 1200 / 4 = 300ms per one cycle
		animSpeed: 1200,
		//speed/16 tiles per 100ms
		//default value is 4, it means 2.5 tiles per second 
		//max value is 6, NYAN value is 7
		speed: 4,
		//UP, RIGHT, LEFT, DOWN
		row: [0, 1, 2, 3]
	},
	{
        name: "character_silver",
		url: "img/character_silver.png",
		density: 96,
        frameWidth: 42,
        renderWidth: 42,
		animSpeed: 1600,
		framesX: 4, 
		framesY: 4,
		speed: 4,
		row: [0, 1, 2, 3]
	},
	{
		name: "bomb",
		density: 64, 
		url: "img/bomb_64x64_2.png", 
		frameWidth: 64, 
		renderWidth: 32, 
		framesX: 1, 
		framesY: 1,
		rndSize: true
	},
	{
		name: "item",
		density: 64, 
		url: "img/items.png",  
		frameWidth: 32, 
		renderWidth: 32, 
		framesX: 3, 
		framesY: 4,
		prob: [1, 1, 0, 
			1, 1, 1, 
			1, 1, 1,
			1, 1, 1,
			1, 0, 0,
			1, 1, 1,
			1, 0, 0]
	}
	])
}});