module.exports = class Renderer {
	static clearCanvas(elem, ctx) {
		ctx.globalCompositeOperation = 'source-in';
		ctx.fillStyle = 'transparent';
		ctx.fillRect(0, 0, elem.width, elem.height);
		ctx.globalCompositeOperation = 'source-over';

		//// TEMP
		ctx.fillStyle = '#202020';
		ctx.fillRect(0, 0, elem.width, elem.height);
		////
	}

	static drawViewport(elem, ctx, viewport) {
		ctx.fillStyle = '#001050';
		ctx.fillRect(viewport.bounds.aabb[0].x, viewport.bounds.aabb[0].y, viewport.width, viewport.height);

		const bodies = viewport.world.getBodies();

		bodies.forEach((body) => {
			if(body.visible) {
				if( viewport.view.bounds.intersect(body.bounds) ) {
					const position = {
						x: body.position.x + viewport.position.x - viewport.view.position.x,
						y: body.position.y + viewport.position.y - viewport.view.position.y
					};

					const vportPosition = {
						x: viewport.position.x - viewport.view.position.x,
						y: viewport.position.y - viewport.view.position.y
					};

					body.display.render(ctx, vportPosition, {width: viewport.width, height: viewport.height}, viewport.view.bounds);

					// trim from left/right/top/bottom
					/*
					const left = viewport.view.bounds.aabb[0].x - body.bounds.aabb[0].x;
					const trimLeft = left > 0 ? left : 0;
					*/

					/*
					ctx.fillStyle = 'pink';
					ctx.translate(position.x, position.y);
					ctx.fillRect(-body.width / 2, -body.height / 2, body.width, body.height);
					ctx.translate(-position.x, -position.y);
					*/
				}
			}
		});
	}

	static drawBuffer(canvas) {
		const ctx = canvas.context;

		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(canvas.buffer.elem, 0, 0, canvas.elem.width, canvas.elem.height);
	}

	render(canvas, viewports) {
		// assemble bodies that need rendering and divide into layer buckets
		// World.getBodies(); // world is a List
		//console.log('renderer is rendering');

		// determine when to group bodies, then render viewports in layer order

		this.constructor.clearCanvas(canvas.elem, canvas.context);
		this.constructor.clearCanvas(canvas.buffer.elem, canvas.buffer.context);

		viewports.forEach((viewport) => this.constructor.drawViewport(canvas.buffer.elem, canvas.buffer.context, viewport));

		this.constructor.drawBuffer(canvas);
	}
}
