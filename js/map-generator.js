const fs = require('fs');
const HexGrid = require('./data-structures/hex-grid');
const {getGameData} = require('../data/game-data');
const {TEMPERATURES} = getGameData('tile');
const {FROZEN, COLD, COOL, TEMPERATE, WARM, HOT} = TEMPERATURES;

const elevColorKey = {

};
const tempColorKey = {
	[FROZEN]: '#ccf5f2',
	[COLD]: '#99f0d0',
	[COOL]: '#60c0b0',
	[TEMPERATE]: '#92d084',
	[WARM]: '#ccee66',
	[HOT]: '#ffee99'
	//[SCORCHING]: '#ffb585'
};
const DIRECTIONS = ['n', 'ne', 'se', 's', 'sw', 'nw'];
const createDataExemplar = () => {
	return {
		depth: 0,
		land: false,
		elevation: {
			bodies: [],
			value: 0
		},
		//events?
		//city
		//structure may need to be array
		structure: {
			body: false,
			value: ""
		},
		temperature: {
			value: TEMPERATE
		},
		terrain: {
			body: false,
			value: ""
		},
		// reference army group?
		unit: {
			body: false
		},
		// litoral coast, sea, river, ocean
		water: {
			body: false,
			value: ""
		},
		weather: {
			body: false,
			value: ""
		}
	};
};

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
		}, createDataExemplar);

		this.seedContinents();

		let landDepth = 1;
		while(true) {
			if( !this.setLandDepth(landDepth) ) {
				break;
			}

			landDepth++;
		}
		for(let d = 1; d < 6; d++) {
			this.setWaterDepth(d);
		}
		this.setTemperatures();
		this.setElevations();
		// NOTE: for 2-wide sea shelf, do half increments, then once finished go back and either round down/up them or round them at random

		this.print();

		return this.grid;
	}
	seedContinents() {
		// Ice Caps
		{
			const path = this.grid.getThreadPath(Math.floor(this.width / 2), 0, 4700);
			const path2 = this.grid.getThreadPath(Math.floor(this.width / 2), this.height - 1, 4700);

			[...path, ...path2].forEach(({x, y}) => {
				this.grid.setPoint(x, y, 1);
			});
		}
		// Continents
		const BIG_SIZES = [4000, 4000, 3500, 3000, 2500];
		for(let i = 0; i < BIG_SIZES.length; i++) {
			const randStart = this.grid.getRandomPoint({x: 0, y: Math.ceil(this.height * 0.32)}, {x: this.width - 1, y: Math.floor(this.height * 0.68)});
			const path = this.grid.getThreadPath(randStart.x, randStart.y, BIG_SIZES[i]);

			path.forEach(({x, y}) => {
				this.grid.setPoint(x, y, 1);
			});
		}

		const SIZES = [2000, 1600, 1200, 900, 900, 700, 500, 300, 300, 300, 300, 300, 200, 200];
		for(let i = 0; i < SIZES.length; i++) {
			const randStart = this.grid.getRandomPoint({x: 0, y: Math.ceil(this.height * 0.1)}, {x: this.width - 1, y: Math.floor(this.height * 0.9)});
			const path = this.grid.getThreadPath(randStart.x, randStart.y, SIZES[i]);

			path.forEach(({x, y}) => {
				this.grid.setPoint(x, y, 1);
			});
		}
		this.grid.refresh().grow().refresh().fill().refresh();
		this.grid.eachPoint((point, x, y, self) => {
			if(point) {
				self.setDataPoint(x, y, {
					elevation: {
						bodies: [],
						value: 1
					},
					land: true
				})
			}
		});
	}
	setTemperatures() {
		const temperatureList = Object.values(TEMPERATURES);
		const temperatureWeights = [1, 2, 3, 3, 3, 2];
		const totalWeight = temperatureWeights.reduce((agg, val) => {
			agg += val;

			return agg;
		}, 0);
		const bandWidth = this.height * 0.5 / totalWeight;

		this.grid.eachPoint((point, x, y, self) => {
			let pointSet;
			let northLat = 0;

			for(let i = 0; i < temperatureList.length; i++) {
				northLat += bandWidth * temperatureWeights[i];

				const southLat = this.height - northLat - 1;

				if(point) {
					if( y < northLat || y > southLat ) {
						self.setDataPoint(x, y, {
							temperature: {
								value: temperatureList[i]
							}
						});

						pointSet = true;

						break;
					}
				}
			}

			if(!pointSet) {
				self.setDataPoint(x, y, {
					temperature: {
						value: temperatureList[temperatureList.length - 1]
					}
				});
			}
		});
	}
	setLandDepth(depth) {
		const sinkPoints = [];

		this.grid.eachDataPoint((dataPoint, x, y, self) => {
			if(!dataPoint.land) {
				return;
			}
			if(dataPoint.depth === depth - 1) {
				let valid = true;
				const metaPoint = self.getMetaPoint(x, y);

				for(let i = 0, len = DIRECTIONS.length; i < len; i++) {
					const dir = DIRECTIONS[i];
					const nghbrCoords = metaPoint[dir];

					if(nghbrCoords) {
						const nghbrData = self.getDataPoint(nghbrCoords.x, nghbrCoords.y);

						if(!nghbrData.land || nghbrData.depth !== depth - 1) {
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
				depth
			})
		});

		return sinkPoints.length;
	}
	setWaterDepth(depth) {
		const sinkPoints = [];

		this.grid.eachDataPoint((dataPoint, x, y, self) => {
			if(dataPoint.land) {
				return;
			}
			if(dataPoint.depth === depth - 1) {
				let valid = true;
				const metaPoint = self.getMetaPoint(x, y);

				for(let i = 0, len = DIRECTIONS.length; i < len; i++) {
					const dir = DIRECTIONS[i];
					const nghbrCoords = metaPoint[dir];

					if(nghbrCoords) {
						const nghbrData = self.getDataPoint(nghbrCoords.x, nghbrCoords.y);

						if(nghbrData.land || nghbrData.depth !== depth - 1) {
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
				depth
			})
		});
	}
	setElevations() {
		const waterDepthElevationKey = [
			-1,
			-2,
			-3,
			-4,
			-5,
			-6
		];

		this.grid.eachDataPoint((dataPoint, x, y, self) => {
			if(!dataPoint.land) {
				self.setDataPoint(x, y, {
					elevation: {
						bodies: [],
						value: waterDepthElevationKey[dataPoint.depth]
					}
				});
			}
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

		fs.writeSync(htmlMap, `<html><header><title>Visual Map</title><style type="text/css">body { background: black; width: ${CALC_DOC_WIDTH}; } canvas { margin-top: calc(${CALC_DOC_HEIGHT}px * -0.19); transform: scale(1, 0.62); } .box { width: ${VIS_TILE_SIZE}px; height: ${VIS_TILE_SIZE}px; float: left; }</style></header><body>`);
		fs.writeSync(htmlMap, `<canvas id="canvas" width="${CALC_DOC_WIDTH}" height="${CALC_DOC_HEIGHT}"></canvas>`);
		fs.writeSync(htmlMap, '<script type="text/javascript">');

		let varData = '';

		this.grid.eachPoint((point, x, y, self) => {
			const metaPoint = self.getMetaPoint(x, y);
			const dataPoint = self.getDataPoint(x, y);
			let hex = '#3354a9';

			if(point) {
				hex = tempColorKey[dataPoint.temperature.value];

				if(dataPoint.depth === 0) {
					hex = '#ff7799';
				}
				/*
				if(dataPoint.depth === 1) {
					hex = '#ffff99';
				}
				if(dataPoint.depth === 2) {
					hex = '#cc7755';
				}
				if(dataPoint.depth === 3) {
					hex = '#00ff66';
				}
				if(dataPoint.depth === 4) {
					hex = '#aa4444';
				}
				if(dataPoint.depth === 5) {
					hex = '#401111';
				}
				if(dataPoint.depth === 6) {
					hex = '#403366';
				}
				if(dataPoint.depth === 7) {
					hex = '#507711';
				}
				*/
				if(dataPoint.depth > 0) {
					if(dataPoint.depth % 2 === 0) {
						if(dataPoint.depth > 7) {
							hex = '#cccc44';
						} else {
							hex = '#cccccc';
						}
					} else {
						if(dataPoint.depth > 7) {
							hex = '#55cccc';
						} else {
							hex = '#333333';
						}
					}
				}
				/*
				hex = '#a0d070';

				if(metaPoint.edge) {
					hex = '#f09030'
				}
				if(dataPoint.temperature.value === 0) {
					hex = '#ddffdd';
				}
				*/
			} else {
				const dataPoint = self.getDataPoint(x, y);

				switch(dataPoint.elevation.value) {
					case -1:
						hex = '#3354a9';
						break;
					case -2:
						hex = '#234494';
						break;
					case -3:
						hex = '#183688';
						break;
					case -4:
						hex = '#122d81';
						break;
					case -5:
						hex = '#082071';
						break;
					case -6:
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
