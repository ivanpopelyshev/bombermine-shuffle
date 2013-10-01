app.addModule({afterStart: function (app) {	

	var startX = 0, startY = 0, pressed = false, drag = false;
	$("#screen").mousedown(function(e){
		pressed = true;
		drag = false;
		startX = e.pageX - e.target.offsetLeft;
		startY = e.pageY - e.target.offsetTop;
		app.renderer.renderAll();
	});
	$("#screen").mousemove(function(e) {
		if (!pressed) return;
		var renderer = app.renderer;
		var x = e.pageX - e.target.offsetLeft;
		var y = e.pageY - e.target.offsetTop;
		drag = drag || Math.abs(x-startX)>=5 || Math.abs(y-startY)>=5;
		if (drag) {
			var dx = x - startX, dy = y-startY;
			startX = x;
			startY = y;
			app.renderer.moveCam(-dx, -dy);
		}
		app.renderer.renderAll();
	});
	$("#screen").mouseup(function(e){
		if (!pressed) return;
		pressed = false;
		var x = e.pageX - e.target.offsetLeft;
		var y = e.pageY - e.target.offsetTop;
		drag = drag || Math.abs(x-startX)>=5 || Math.abs(y-startY)>=5;
		if (drag) {
			var dx = x - startX, dy = y-startY;
			app.renderer.moveCam(-dx,-dy);
		} else
			app.renderer.selectAt(x,y);
		app.renderer.renderAll();
	});
	
	var keyUp = false, keyDown = false, keyLeft = false, keyRight = false, 
		keySpace = false, keyEnter = false, redraw = false;
		
	var tick = 1000/60;
	var TILE_BITS = 5;
	setInterval(function() {
		var renderer = app.renderer;
		var game = app.game;
		if (!keyUp && !keyDown && !keyLeft && !keyRight && !keySpace && !keyEnter && !redraw) return;
		var p = renderer.camSelected;
		if (p==null || !p.type.animSpeed) return;
		p.step = p.step || 0;
		p.step += p.type.speed * tick / p.type.animSpeed;
		game.obj[p.dy >> TILE_BITS][p.dx >> TILE_BITS] = null;
		var d = p.type.speed*2 * tick/100;
		if (keyUp) {
			p.sy = p.type.row[0];
			p.dy = Math.max(1, p.dy-d);
		} else if (keyDown) {
			p.sy = p.type.row[2];
			p.dy = Math.min((game.map.height<<TILE_BITS) - 1, p.dy+d);
		}
		p.mirror = false;
		if (keyLeft) {
			if (p.type.animMirrorLeft) {
				p.sy = p.type.row[1]
				p.mirror = true;
			} else 
				p.sy = p.type.row[3];
			p.dx = Math.max(0, p.dx-d);
		} else if (keyRight) {
			p.sy = p.type.row[1];
			p.dx = Math.min((game.map.width<<TILE_BITS) - 1, p.dx+d);
		}
		if (!keyUp && !keyDown && !keyLeft && !keyRight && !keySpace && !keyEnter) {
			p.dx = p.dx | 0;
			p.dy = p.dy | 0;
			p.sx = 0;
			p.step = 0;
			redraw = false;
		} else {
			var oldsx = p.sx;
			p.sx = (p.step * p.type.framesX | 0) % p.type.framesX;
			if(p.type.animStand && p.sx!==oldsx && oldsx>0)
				p.sx++;
			if(keyEnter && p.sx==0 && oldsx!==0)
				keyEnter = false;
			redraw = true;
		}
		game.obj[p.dy >> TILE_BITS][p.dx >> TILE_BITS] = p;
		if (redraw) renderer.renderAll();
	},tick);
	$(document).keydown(function(event){
		switch (event.which) {
			case 39:
			case 68:
				keyRight = true;
				break;
			case 38:
			case 87:
				keyUp = true;
				break;
			case 37:
			case 65:
				keyLeft = true;
				break;
			case 40:
			case 83:
				keyDown = true;
				break;
			case 13:
				keyEnter = true;
				break;						
			case 32:
				keySpace = true;
				break;						
		}
	});
	$(document).keyup(function(event){
		switch (event.which) {
			case 39:
			case 68:
				keyRight = false;
				break;
			case 38:
			case 87:
				keyUp = false;
				break;
			case 37:
			case 65:
				keyLeft = false;
				break;
			case 40:
			case 83:
				keyDown = false;
				break;
			case 13:
				//keyEnter = false;
				break;						
			case 32:
				keySpace = false;
				break;					
		}
	});
}})