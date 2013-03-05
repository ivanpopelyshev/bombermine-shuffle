bombermine-shuffle
==================

## [Demo](http://ivanpopelyshev.github.com/bombermine-shuffle/index.html) 

## First step
Copy files to your web-server or start google chrome with "--allow-file-access-from-files" argument.

## Work loop
Open index.html in a browser.
Modify images and index.html. Refresh the page.

## Hints

```javascript
{[
	{
		name: "item", 
		// one sprite per 64 tiles
		density: 64, 
		url: "img/items.png",  
		//add frameHeight if sprite is rectangular
		frameWidth: 32, 
		//real sprite size
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
	}
],
//32 pixels per tile
zoom: 32 
}
```

## License: MIT

## Author:
 * Ivan Popelyshev (ivan.popelyshev@gmail.com)
