bombermine-shuffle
==================

## [Demo](http://ivanpopelyshev.github.com/bombermine-shuffle/index.html) 
Click on a character, move it with keyboard.

## First step
Copy files to your web-server or start google chrome with "--allow-file-access-from-files" argument.

## Work loop
Open index.html in a browser.
Modify images and index.html. Refresh the page.

## Hints

```javascript
{
	tilesUrl: "img/tileset_02_03.png",
	//shuffle takes random rectangle from that map
	mapUrl: "save/firstmap.bin",
	//32 pixels per tile
	zoom: 32,
	things: [
		{
			name: "player",
			// one sprite per 48 tiles
			density: 48,
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
			name: "item", 
			// one sprite per 64 tiles
			density: 64, 
			url: "img/items.png",
			frameWidth: 32, 
			//how to draw sprite
			renderWidth: 32, 
			//number of frames per row and col
			framesX: 3, 
			framesY: 4,
			//probabilities of frames.
			//0 means that it won't appear at all.
			prob: [1, 1, 0, 
				1, 1, 1, 
				1, 1, 1,
				1, 1, 1,
				1, 0, 0,
				1, 1, 1,
				1, 0, 0]
		}
	]
}
```

## License: MIT

## Author:
 * Ivan Popelyshev (ivan.popelyshev@gmail.com)
