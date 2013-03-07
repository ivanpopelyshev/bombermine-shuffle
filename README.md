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
			//animation parameters. animSpeed x speed = 30 * 2.5 = one frame per 75ms.
			animSpeed: 30,
			//tiles per 100ms, 2.5 = low speed, 3.75 = high speed, 4.375 = NYAN!
			speed: 2.5,
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
