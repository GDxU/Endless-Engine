const fs = require('fs');
const HexGrid = require('./data-structures/hex-grid');

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
		this.grid = new HexGrid(width, height, {
			data: true,
			meta: true,
			scratch: true,
			wrap: true
		});

		this.seedContinents();
		this.setWaterElevations(-1);
		this.setWaterElevations(-2);
		this.setWaterElevations(-3);
		this.setWaterElevations(-4);
		this.setWaterElevations(-5);
		// NOTE: for 2-wide sea shelf, do half increments, then once finished go back and either round down/up them or round them at random

		this.print();

		return this.grid;
	}
	seedContinents() {
		/*
		const tempGrid = new HexGrid(150, 150, {wrap: true, meta: true});
		const path = tempGrid.getThreadPath(75, 75, 350);
		path.forEach(({x, y}) => {
			tempGrid.setPoint(x, y, 1);
		});
		tempGrid.refresh().grow().refresh().grow().refresh().grow().refresh().grow().refresh();
		const edges = [];
		tempGrid.eachMetaPoint((metaPoint, x, y) => {
			if(metaPoint.edge) {
				edges.push({x, y});
			}
		});
		console.log(edges)

		edges.forEach(({x, y}) => {
			this.grid.setPoint(x, y, 1);
		});
		this.grid.refresh();
		*/

		// Path testing
		for(let i = 0; i < 3; i++) {
			const randStart = this.grid.getRandomPoint();
			const randLength = 400;

			const path = this.grid.getThreadPath(randStart.x, randStart.y, randLength);
			path.forEach(({x, y}) => {
				this.grid.setPoint(x, y, 1);
			});
		}

		/*
		// One large continent
		const path = this.grid.getThreadPath(150, 100, 750);
		path.forEach(({x, y}) => {
			this.grid.setPoint(x, y, 1);
		});
		this.grid.refresh().grow(75).refresh().grow().refresh().grow().refresh().grow().refresh();

		this.grid.eachPoint((point, x, y, self) => {
			if(point) {
				self.setDataPoint(x, y, {
					elevation: {
						bodies: [],
						value: 1
					}
				})
			}
		});
		*/

		//this.grid.refresh().grow().refresh();


		/*
		// World v1
		this.grid.populate(6).refresh();

		for(let i = 0; i < 20; i++) {
			const randStart = this.grid.getRandomPoint();
			const randLength = 100 + Math.floor(Math.random() * 600);

			const path = this.grid.getThreadPath(randStart.x, randStart.y, randLength);
			path.forEach(({x, y}) => {
				this.grid.setPoint(x, y, 1);
			});
		}
		this.grid.refresh().grow(8).refresh().winnow(4);

		this.grid.refresh().grow().refresh().grow().refresh().grow().refresh().grow().refresh();
		this.grid.eachPoint((point, x, y, self) => {
			if(point) {
				self.setDataPoint(x, y, {
					elevation: {
						bodies: [],
						value: 1
					}
				})
			}
		});
		*/
	}
	setWaterElevations(elev) {
		const sinkPoints = [];

		this.grid.eachDataPoint((dataPoint, x, y, self) => {
			if(dataPoint.elevation.value === elev + 1) {
				let valid = true;
				const metaPoint = self.getMetaPoint(x, y);

				for(let i = 0, len = DIRECTIONS.length; i < len; i++) {
					const dir = DIRECTIONS[i];
					const nghbrCoords = metaPoint[dir];

					if(nghbrCoords) {
						const nghbrData = self.getDataPoint(nghbrCoords.x, nghbrCoords.y);

						if(nghbrData.elevation.value !== elev + 1) {
							valid = false;
							break;
						}
					}
				}

				if(valid) {
					sinkPoints.push({x, y});
				}
			}
		});

		sinkPoints.forEach(({x, y}) => {
			this.grid.setDataPoint(x, y, {
				elevation: {
					bodies: [],
					value: elev
				}
			})
		});
	}
	print() {
		const VIS_TILE_SIZE = 5;
		const CALC_DOC_WIDTH = this.width * VIS_TILE_SIZE * 0.75 + VIS_TILE_SIZE;
		const CALC_DOC_HEIGHT = this.height * VIS_TILE_SIZE + this.height + VIS_TILE_SIZE / 2;

		if( !fs.existsSync('z_htmlMap.html') ) {
			fs.createWriteStream('z_htmlMap.html');
		}

		const htmlMap = fs.openSync('z_htmlMap.html', 'w');

		/*
		fs.writeSync(htmlMap, `<html><head><title>Visual Map</title><style type="text/css">body { background: black; margin: 0; padding: 0; } .offset { top: 9px; } .box { position: relative; border-radius: 50%; margin: 0 1px 1px 0; width: ${VIS_TILE_SIZE}px; height: ${VIS_TILE_SIZE}px; float: left; }</style></head><body>`);
		fs.writeSync(htmlMap, '<div class="map-container" style="padding: 40px 30px;">');

		this.grid.eachPoint((point, x, y, self) => {
			const metaPoint = self.getMetaPoint(x, y);
			let hex = '#224499';

			if(point) {
				hex = '#a0d070';

				if(metaPoint.edge) {
					hex = '#f09030'
				}
			}

			const clear = (x === 0) ? "clear: left; " : "";
			const offset = metaPoint.offset ? "offset" : "";
			fs.writeSync(htmlMap, `<div class="box ${offset}" style="${clear}background: ${hex}" data-coords="[${x},${y}]"></div>`);
		});

		fs.writeSync(htmlMap, '</div>');
		fs.writeSync(htmlMap, '</body></html>');
		fs.closeSync(htmlMap);
		*/

		fs.writeSync(htmlMap, `<html><header><title>Visual Map</title><style type="text/css">body { background: black; width: ${CALC_DOC_WIDTH}; } canvas { transform: scale(1, 0.85); } .box { width: ${VIS_TILE_SIZE}px; height: ${VIS_TILE_SIZE}px; float: left; }</style></header><body>`);
		fs.writeSync(htmlMap, `<canvas id="canvas" width="${CALC_DOC_WIDTH}" height="${CALC_DOC_HEIGHT}"></canvas>`);
		fs.writeSync(htmlMap, '<script type="text/javascript">');

		let varData = '';

		this.grid.eachPoint((point, x, y, self) => {
			const metaPoint = self.getMetaPoint(x, y);
			let hex = '#3354a9';

			if(point) {
				hex = '#a0d070';

				if(metaPoint.edge) {
					hex = '#f09030'
				}
			} else {
				const dataPoint = self.getDataPoint(x, y);

				switch(dataPoint.elevation.value) {
					case -1:
						hex = '#234494';
						break;
					case -2:
						hex = '#183688';
						break;
					case -3:
						hex = '#122d81';
						break;
					case -4:
						hex = '#082071';
						break;
					case -5:
						hex = '#041766';
						break;
					default:
						break;
				}
			}

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

			corner.y += halfTizeSize;
			if(datum.x % 2 == 1) {
				corner.y -= halfTizeSize;
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
