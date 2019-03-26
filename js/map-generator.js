const fs = require('fs');
const SquareHexGrid = require('./data-structures/hex-grid');

const elevColorKey = {

};
const DIRECTIONS = ['n', 'ne', 'se', 's', 'sw', 'nw'];

class MapGenerator {
	constructor() {
		this.grid = false;
		this.height = 0;
		this.width = 0;

		this.gridData = {};
	}
	static countNeighbors(cell, minElev) {
		let count = 0;

		DIRECTIONS.forEach(dir => {
			const nghbr = cell[dir]
			if( nghbr.elevation.value >= minElev ) {
				count++;
			}
		});

		return count;
	}
	generate(width, height) {
		this.height = height;
		this.width = width;
		this.grid = new SquareHexGrid(width, height);

		this.print();

		return this.grid;
	}
	seedContinents() {
		
	}
	print() {
		const VIS_TILE_SIZE = 16;
		const CALC_DOC_WIDTH = this.width * VIS_TILE_SIZE * 0.75 + VIS_TILE_SIZE;
		const CALC_DOC_HEIGHT = this.height * VIS_TILE_SIZE + this.height + VIS_TILE_SIZE / 2;

		if( !fs.existsSync('z_htmlMap.html') ) {
			fs.createWriteStream('z_htmlMap.html');
		}

		const htmlMap = fs.openSync('z_htmlMap.html', 'w');

		fs.writeSync(htmlMap, `<html><header><title>Visual Map</title><style type="text/css">body { width: ${CALC_DOC_WIDTH}; } .box { width: ${VIS_TILE_SIZE}px; height: ${VIS_TILE_SIZE}px; float: left; }</style></header><body>`);
		fs.writeSync(htmlMap, `<canvas id="canvas" width="${CALC_DOC_WIDTH}" height="${CALC_DOC_HEIGHT}"></canvas>`);
		fs.writeSync(htmlMap, '<script type="text/javascript">');

		let varData = '';

		this.grid.eachCell((cell, x, y) => {
			const hex = '#bb77aa';

			varData += `{'color': '${hex}', x: ${x}, y: ${y}},`;
		});

		fs.writeSync(htmlMap, `var data = [${varData}];`);
		fs.writeSync(htmlMap, `var tileSize = [${VIS_TILE_SIZE}];`);
		fs.writeSync(htmlMap, "(function() {");
		fs.writeSync(htmlMap, "var canvasElem = document.getElementById('canvas');");
		fs.writeSync(htmlMap, "var context = canvasElem.getContext('2d');");
		const writeHex = `
			var corner = {
				x: datum.x * tileSize,
				y: datum.y * tileSize + datum.y
			};
			var halfTizeSize = tileSize / 2;
			var thirdTileSize = tileSize / 3;
			var quarterTileSize = tileSize / 4;

			if(datum.x % 2 == 1) {
				corner.y += halfTizeSize;
			}

			corner.x -= quarterTileSize * datum.x;

			context.save();
			context.translate(corner.x, corner.y)
			context.beginPath();
			context.moveTo(0, halfTizeSize);
			context.lineTo(thirdTileSize, 0);
			context.lineTo(2 * thirdTileSize, 0);
			context.lineTo(tileSize, halfTizeSize);
			context.lineTo(2 * thirdTileSize, tileSize);
			context.lineTo(thirdTileSize, tileSize);
			context.lineTo(0, halfTizeSize);
			context.fill();
			context.restore();
		`;
		//fs.writeSync(htmlMap, "data.forEach(function(datum) { context.fillStyle = datum.color; context.fillRect(datum.x * tileSize, datum.y * tileSize, tileSize, tileSize); });");
		fs.writeSync(htmlMap, `data.forEach(function(datum) { context.fillStyle = datum.color; ${writeHex} });`);
		fs.writeSync(htmlMap, "}());");
		fs.writeSync(htmlMap, '</script>');
		fs.writeSync(htmlMap, '</body></html>');
		fs.closeSync(htmlMap);
	}
};

module.exports = new MapGenerator();
