window.init = function() {
	window.map = new Map();
	var canvas=$("#screen")[0];
	var resize = function() {
		canvas.width = window.innerWidth-20;
		canvas.height = window.innerHeight-20;
		window.map.draw(canvas);
	}
	$(window).resize(resize);
	resize();	
	window.setupAnim = function() {
		window.map.draw(canvas);
		$("#screen").click(function(e){
			var x = e.pageX - e.target.offsetLeft;
			var y = e.pageY - e.target.offsetTop;
			map.selectAt(x,y);
			window.map.draw(canvas);
		});
		var keyUp = false, keyDown = false, keyLeft = false, keyRight = false, redraw = false;
		
		var tick = 1000/60;
		setInterval(function() {
			if (!keyUp && !keyDown && !keyLeft && !keyRight && !redraw) return;
			if (map.selected==null || !map.selected.type.animSpeed) return;
			var p = map.selected;
			p.step = p.step || 0;
			p.step += p.type.speed * tick / p.type.animSpeed;
			map.obj[p.dy+0.5|0][p.dx+0.5|0] = null;
			var d = p.type.speed/16 * tick/100;
			if (keyUp) {
				p.sy = p.type.row[0];
				p.dy = Math.max(0, p.dy-d);
			} else if (keyDown) {
				p.sy = p.type.row[2];
				p.dy = Math.min(canvas.height/map.zoom, p.dy+d);
			}
			if (keyLeft) {
				p.sy = p.type.row[3];
				p.dx = Math.max(0, p.dx-d);
			} else if (keyRight) {
				p.sy = p.type.row[1];
				p.dx = Math.min(canvas.width/map.zoom, p.dx+d);
			}
			if (!keyUp && !keyDown && !keyLeft && !keyRight) {
				p.dx = (p.dx * map.zoom | 0) / map.zoom
				p.dy = (p.dy * map.zoom | 0) / map.zoom
				p.sx = 0;
				p.step = 0;
				redraw = false;
			} else {
				p.sx = (p.step * p.type.framesX | 0) % p.type.framesX;
				redraw = true;
			}
			map.obj[p.dy+0.5|0][p.dx+0.5|0] = p;
			window.map.draw(canvas);
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
			}
		});
	}
}