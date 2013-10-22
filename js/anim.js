app.addModule({afterStart: function (app) {	

	var startX = 0, startY = 0, pressed = false, drag = false, dragSel = false;
	var TILE = 32;
	$("#builder").mousedown(function(e) {
		var x = e.pageX - e.target.offsetLeft - e.target.parentNode.offsetLeft- e.target.parentNode.parentNode.offsetLeft;
		var y = e.pageY - e.target.offsetTop - e.target.parentNode.offsetTop- e.target.parentNode.parentNode.offsetTop;
		app.builder.selectAt(x, y);
		app.builder.render();
		e.preventDefault();
		e.stopPropagation();
	});
	$("#screen").mousedown(function(e){
		pressed = true;
		drag = false;
		var renderer = app.renderer;
		var editor = app.game.editor;
		startX = e.pageX - e.target.offsetLeft;
		startY = e.pageY - e.target.offsetTop;
		dragSel = editor.selectionHasPoint(app.renderer.point(startX, startY));
		if (app.tool == 1)
			editor.pencilAt(renderer.point(startX, startY), 0);
		else if (app.tool == 2)
			editor.selectAt(renderer.point(startX, startY), 0);
		renderer.renderAll();
	});
	function doDrag(x, y) {
		var renderer = app.renderer;
		var editor = app.game.editor;
		if (!drag && (Math.abs(x-startX)>=5 || Math.abs(y-startY)>=5)) {
			drag = true;
		}
		if (drag) {
			var dx = x - startX, dy = y-startY;
			if (dragSel) {
				var tileDx = (dx/TILE) | 0, tileDy = (dy/TILE) | 0;
				if (tileDx!=0||tileDy!=0) {
					editor.moveSelection(tileDx, tileDy);
					startX += tileDx * TILE;
					startY += tileDy * TILE;
				}
			} else {
				startX = x;
				startY = y;
				renderer.moveCam(-dx, -dy);
			}
		}
		return drag;
	}
	
	$("#screen").mousemove(function(e) {
		if (!pressed) return;
		var renderer = app.renderer;
		var editor = app.game.editor;
		var x = e.pageX - e.target.offsetLeft;
		var y = e.pageY - e.target.offsetTop;
		if (app.tool == 0) {
			doDrag(x, y);
		} else if (app.tool == 1) {
			editor.pencilAt(renderer.point(x, y), 1);
		} else if (app.tool == 2) {
			editor.selectAt(renderer.point(x, y), 1);
		}
		renderer.renderAll();
	});
	$("#screen").mouseup(function(e){
		if (!pressed) return;
		var renderer = app.renderer;
		var editor = app.game.editor;
		pressed = false;
		var x = e.pageX - e.target.offsetLeft;
		var y = e.pageY - e.target.offsetTop;
		if (app.tool == 0) {
			if (!doDrag(x, y))
				editor.cursorAt(renderer.point(x,y));
		} else if (app.tool == 1) {
			editor.pencilAt(renderer.point(x, y), 2);
		} else if (app.tool == 2) {
			editor.selectAt(renderer.point(x, y), 2);
		}
		renderer.renderAll();
		renderer.roundCam();
	});
	var keyUp = false, keyDown = false, keyLeft = false, keyRight = false, 
		keySpace = false, keyEnter = false, redraw = false;
		
	var tick = 1000/60;
	var TILE_BITS = 5;
	setInterval(function() {
		var renderer = app.renderer;
		var game = app.game;
		if (!keyUp && !keyDown && !keyLeft && !keyRight && !keySpace && !keyEnter && !redraw) return;
		var p = game.editor.entity;
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