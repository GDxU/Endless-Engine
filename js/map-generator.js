const fs = require('fs');
const {getGradiatedColors, hexToRgb} = require('./util/tools');
const HexGrid = require('./data-structures/hex-grid');
const {HEX_DIRECTIONS} = require('../data/strings');

const createDataExemplar = () => {
	return {
		depth: 0,
		//depthRays: {},
		elevation: 0,
		moisture: 0,
		land: false,
		temperature: 0,
		/*
		elevation: {
			bodies: [],
			value: 0
		},
		*/
		//events?
		//city
		//structure may need to be array
		structure: {
			body: false,
			value: ""
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
		// dust storm, hurricane, atmospheric storm, lightning, rain + clouds
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

		HEX_DIRECTIONS.forEach(dir => {
			const nghbr = cell[dir]
			if( nghbr.elevation >= minElev ) {
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

		/*
		const path = this.grid.getWindingPath(200, 100, 130);
		path.forEach(({x, y}) => {
			this.grid.setPoint(x, y, 1);
		});
		*/

		this.seedContinents();

		/*
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
		*/
		this.setTemperature();

		// TODO: potentially add test during ring generation so it can be interrupted
		this.grid.eachDataPoint((dataPoint, x, y, self) => {
			const landTest = dataPoint => {
				return (dataPoint.land === true);
			};
			const waterTest = dataPoint => {
				return (dataPoint.land === false);
			};
			const test = dataPoint.land ? landTest : waterTest;

			let radius = 1;

			ringLoop:
			while(true) {
				const ring = self.getRing(x, y, radius);
				let internalMapPoints = 0;

				for(let r = 0; r < ring.length; r++) {
					const nghbr = ring[r];
					const nghbrDataPoint = self.getDataPoint(nghbr.x, nghbr.y);

					if(nghbrDataPoint) {
						internalMapPoints++;

						if(!test(nghbrDataPoint)) {
							break ringLoop;
						}
					}
				}

				if(!internalMapPoints) {
					break ringLoop;
				}

				radius++;
			}

			self.setDataPoint(x, y, {
				depth: radius - 1,
			});
		});

		// NOTE: ridge line should dip in some places to form series of peaks
		/*
		let successes = 0;
		this.grid.eachPointRandom((point, randX, randY, self) => {
			const randDataPoint = self.getDataPoint(randX, randY);

			if(randDataPoint.land && randDataPoint.depth >= 12) {
				const rays = self.castRays(randX, randY, (x, y) => {
					const dataPoint = self.getDataPoint(x, y);

					return (dataPoint && dataPoint.land === true);
				});
				console.log("rays", rays);
				Object.values(rays).forEach(ray => {
					ray.forEach(({x, y}) => {
						self.setPoint(x, y, 1);
						self.setDataPoint(x, y, {special: true});
					});
				});
				const path = self.getWindingPath(randX, randY, {maxLength: 100, startDir: 'n'});

				path.forEach(({x, y}) => {
					//self.setPoint(x, y, 1);
					//self.setDataPoint(x, y, {special: true});
				});

				if( ++successes >= 5) {
					return true;
				}
			}
		});
		*/

		/*
		while(successes < 4) {
			const randPoint = this.grid.getRandomPoint();
			const randDataPoint = this.grid.getDataPoint(randPoint.x, randPoint.y);

			if(randDataPoint.land && randDataPoint.depth >= 14) {
				const path = this.grid.getWindingPath(randPoint.x, randPoint.y, 100);

				path.forEach(({x, y}) => {
					this.grid.setPoint(x, y, 1);
					this.grid.setDataPoint(x, y, {special: true});
				});

				//break;
				successes++;
			}
		}
		*/

		this.setElevation();
		this.setMoisture();


		this.print();

		return this.grid;
	}
	seedContinents() {
		// Ice Caps
		{
			const path = this.grid.getBlobShape(Math.floor(this.width / 2), 0, 4700);
			const path2 = this.grid.getBlobShape(Math.floor(this.width / 2), this.height - 1, 4700);

			[...path, ...path2].forEach(({x, y}) => {
				this.grid.setPoint(x, y, 1);
			});
		}
		// Continents
		const BIG_SIZES = [4000, 4000, 3500, 3200, 2600];
		for(let i = 0; i < BIG_SIZES.length; i++) {
			const randStart = this.grid.getRandomPoint({x: 0, y: Math.ceil(this.height * 0.32)}, {x: this.width - 1, y: Math.floor(this.height * 0.68)});
			const path = this.grid.getBlobShape(randStart.x, randStart.y, BIG_SIZES[i]);

			path.forEach(({x, y}) => {
				this.grid.setPoint(x, y, 1);
			});
		}

		const SIZES = [2500, 2000, 1600, 1200, 900, 900, 900, 900, 700, 500, 300, 300, 300, 300, 300, 200, 200];
		for(let i = 0; i < SIZES.length; i++) {
			const randStart = this.grid.getRandomPoint({x: 0, y: Math.ceil(this.height * 0.1)}, {x: this.width - 1, y: Math.floor(this.height * 0.9)});
			const path = this.grid.getBlobShape(randStart.x, randStart.y, SIZES[i]);

			path.forEach(({x, y}) => {
				this.grid.setPoint(x, y, 1);
			});
		}
		this.grid.refresh().grow().refresh().fill().refresh();
		this.grid.eachPoint((point, x, y, self) => {
			if(point) {
				self.setDataPoint(x, y, {
					elevation: 1,
					land: true
				})
			}
		});
	}
	setMoisture() {
		const halfGlobeWidth = this.height * 0.5;
		const poleWidth = halfGlobeWidth * 0.25;
		const innerWidth = halfGlobeWidth * 0.75 * 0.5;

		const band1 = poleWidth;
		const band2 = poleWidth + innerWidth;
		const band3 = poleWidth + innerWidth * 2;
		const band4 = poleWidth + innerWidth * 3;
		const band5 = poleWidth + innerWidth * 4;

		this.grid.eachDataPoint((dataPoint, x, y, self) => {
			let moisture = 100;

			switch(true) {
				case y > band5:
					break;
				case y > band4:
					moisture = Math.round(100 * (y - band4) / innerWidth);
					break;
				case y > band3:
					moisture = 100 - Math.round(100 * (y - band3) / innerWidth);
					break;
				case y > band2:
					moisture = Math.round(100 * (y - band2) / innerWidth);
					break;
				case y > band1:
					moisture = 100 - Math.round(100 * (y - band1) / innerWidth);
					break;
				default:
					break;
			}

			self.setDataPoint(x, y, {moisture});
		});
	}
	setTemperature() {
		const poleBuffer = 8;
		const halfHeight = this.height * 0.5;
		const slope = 100 / (halfHeight - poleBuffer);

		this.grid.eachDataPoint((dataPoint, x, y, self) => {
			let temperature;

			if(y > halfHeight) {
				temperature = 100 - Math.floor(slope * (y - halfHeight));
			} else {
				temperature = Math.ceil(slope * (y - poleBuffer));
			}
			if(temperature < 0) {
				temperature = 0;
			}
			if(temperature > 100) {
				temperature = 100;
			}

			self.setDataPoint(x, y, {temperature});
		});
		/*
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
		*/
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

				for(let i = 0, len = HEX_DIRECTIONS.length; i < len; i++) {
					const dir = HEX_DIRECTIONS[i];
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

				for(let i = 0, len = HEX_DIRECTIONS.length; i < len; i++) {
					const dir = HEX_DIRECTIONS[i];
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
	setElevation() {
		const waterDepthElevationKey = [
			-1,
			-2,
			-3,
			-4,
			-5,
			-6,
			-7
		];

		this.grid.eachDataPoint((dataPoint, x, y, self) => {
			if(!dataPoint.land) {
				const elevation = (dataPoint.depth >= waterDepthElevationKey.length) ? -6 : waterDepthElevationKey[dataPoint.depth];

				self.setDataPoint(x, y, {
					elevation
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
		const temperatureColorKey = getGradiatedColors('#335577', '#ee9977', 101);
		const moistureColorKey = getGradiatedColors('#eeaa77', '#55dd88', 101);

		fs.writeSync(htmlMap, `<html><header><title>Visual Map</title><style type="text/css">body { background: black; width: ${CALC_DOC_WIDTH}; } canvas { border-width: 0; border-style: solid; border-color: white; margin-top: calc(${CALC_DOC_HEIGHT}px * -0.19); transform: scale(1, 0.62); } .box { width: ${VIS_TILE_SIZE}px; height: ${VIS_TILE_SIZE}px; float: left; }</style></header><body>`);
		fs.writeSync(htmlMap, `<canvas id="canvas" width="${CALC_DOC_WIDTH}" height="${CALC_DOC_HEIGHT}"></canvas>`);
		fs.writeSync(htmlMap, '<script type="text/javascript">');

		let varData = '';

		this.grid.eachPoint((point, x, y, self) => {
			const metaPoint = self.getMetaPoint(x, y);
			const dataPoint = self.getDataPoint(x, y);
			let hex = '#3354a9';

			if(point) {
				if(dataPoint.depth === 0) {
					hex = '#ff7799';
				}
				if(dataPoint.depth > 0) {
					if(dataPoint.depth % 2 === 0) {
						if(dataPoint.depth > 7) {
							hex = '#cc7733';
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

				switch(dataPoint.elevation) {
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
					case -7:
						hex = '#001057';
						break;
					default:
						break;
				}
			}

			if(dataPoint.land) {
				//hex = moistureColorKey[dataPoint.moisture];
				//hex = temperatureColorKey[dataPoint.temperature];
			}
			if(dataPoint.special) {
				hex = '#77ff99';
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
