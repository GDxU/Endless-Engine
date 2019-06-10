const Body = require('./body/body');

const REGION_SIZE = 9;
const ACTIVE_AREA_WIDTH = 3;
const ACTIVE_AREA_HEIGHT = 3;
const HEX_TILE_WIDTH = 44;
const HEX_TILE_INTERLOCK_WIDTH = 32;
const HEX_TILE_HEIGHT = 26;
const HALF_HEX_TILE_HEIGHT = 13;
const HEX_DEPTH_TILE_HEIGHT = 16;
const HEX_TILE_THICKNESS = 4;
const KEY_DELIMITER = ",";
const WATER_ELEV_OFFSET = 10;

const testHexCell44BodyData = {
	height: HEX_TILE_HEIGHT,
	width: HEX_TILE_WIDTH,
	chamfer: 12,
	velocity: {x: 0, y: 0},
	sprite: 'hex-cell-44-top',
	layer: 'elev:0',
	bitmask: 'ui'
};
const testHexCell44SeafloorData = {
	height: HEX_TILE_HEIGHT,
	width: HEX_TILE_WIDTH,
	chamfer: 12,
	velocity: {x: 0, y: 0},
	sprite: '',
	layer: 'elev:0',
	bitmask: 'ui'
};
const testHexDepth44BodyData = {
	height: HEX_DEPTH_TILE_HEIGHT,
	width: HEX_TILE_WIDTH,
	velocity: {x: 0, y: 0},
	sprite: 'hex-cell-44-height',
	layer: 'elev:0',
	bitmask: 'ui'
};
const testHexWater44BodyData = {
	height: HEX_TILE_HEIGHT,
	width: HEX_TILE_WIDTH,
	velocity: {x: 0, y: 0},
	sprite: 'hex-cell-44-water-top',
	layer: `elev:${WATER_ELEV_OFFSET}`,
	bitmask: 'ui'
};
const cellMousemoveCallback = (self, e) => {
	//console.log("move", self);
};
const cellMousedownCallback = (self, e) => {
	console.log("clicked cell", "elevation:", self.hexCell.elevation);
	//highlightedElev = self.hexCell.elevation;
};

const seafloorData = {};
const biomeData = {};

for(let i = 1; i <= 9; i++) {
	seafloorData[`elev-${i}`] = {
		...testHexCell44SeafloorData,
		sprite: `hex-cell-44-seafloor-${i}-top`
	};
}

const terrains = [
	'boreal',
	'desert',
	'evergreen',
	'grassland',
	'hot-desert',
	'ice',
	'moonscape',
	'savanna',
	'scrubland',
	'shrubland',
	'temp-forest',
	'trop-forest',
	'tundra',
	'woodland'
];
const terrainConversionKey = {
	'boreal forest': 'boreal',
	'evergreen forest': 'evergreen',
	'hot desert': 'hot-desert',
	'temperate rainforest': 'temp-forest',
	'tropical rainforest': 'trop-forest'
};

for(let i = 0; i < terrains.length; i++) {
	const terrain = terrains[i];

	biomeData[terrain] = {
		...testHexCell44BodyData,
		sprite: `hex-cell-44-${terrain}-top`
	};
}


module.exports = class MapInstantiator {
	constructor(mapData, world) {
		this.data = mapData;
		this.lastRegions = {};
		this.centerRegion = {};
		this.world = world;
		this.regionBodies = {};
	}

	update(x, y) {
		const {regionX, regionY} = this.constructor.convertPositionToRegion(x, y);

		if(regionX !== this.centerRegion.x || regionY !== this.centerRegion.y) {
			this.centerRegion = {
				x: regionX,
				y: regionY
			};

			const newRegions = {};
			const halfX = Math.floor(ACTIVE_AREA_WIDTH / 2);
			const halfY = Math.floor(ACTIVE_AREA_HEIGHT / 2);

			for(let rY = -halfY; rY <= halfY; rY++) {
				for(let rX = -halfX; rX <= halfX; rX++) {
					const testCoords = {
						x: this.centerRegion.x + rX,
						y: this.centerRegion.y + rY
					};
					const testCoordsKey = this.constructor.getRegionKey(testCoords.x, testCoords.y);

					if(!this.lastRegions[testCoordsKey]) {
						this.createRegion(testCoords.x, testCoords.y);
					}

					newRegions[testCoordsKey] = true;
				}
			}

			Object.keys(this.lastRegions).forEach(regionKey => {
				if(!newRegions[regionKey]) {
					const [destroyX, destroyY] = regionKey.split(KEY_DELIMITER);

					this.destroyRegion(parseInt(destroyX), parseInt(destroyY));
				}
			});

			this.lastRegions = newRegions;
		}
	}

	static getRegionKey(x, y) {
		return `${x}${KEY_DELIMITER}${y}`;
	}

	static getRegionTiles(x, y) {
		const coords = [];

		for(let tY = 0; tY < REGION_SIZE; tY++) {
			for(let tX = 0; tX < REGION_SIZE; tX++) {
				coords.push({
					x: REGION_SIZE * x + tX,
					y: REGION_SIZE * y + tY
				});
			}
		}

		return coords;
	}

	static convertPositionToRegion(x, y) {
		const tileX = Math.floor(x / HEX_TILE_INTERLOCK_WIDTH);
		const tileY = Math.floor(y / HEX_TILE_HEIGHT);
		const regionX = Math.floor(tileX / REGION_SIZE);
		const regionY = Math.floor(tileY / REGION_SIZE);

		return {
			regionX,
			regionY
		};
	}

	static findLowest(...vals) {
		if(!vals.length) {
			return false;
		}

		let lowest = vals[0];

		vals.forEach(val => {
			if(typeof(val) === "number" && val < lowest) {
				lowest = val;
			}
		});

		return lowest;
	}

	loadBody(body, regionKey) {
		this.world.addBodies(body);
		this.regionBodies[regionKey].push(body.id);
	}

	static getTopData(x, y, {biome, elevation, offset}) {
		const waterElevation = elevation + WATER_ELEV_OFFSET
		const depthAdj = -waterElevation * HEX_TILE_THICKNESS + (offset ? HALF_HEX_TILE_HEIGHT : 0);
		const offsetAdj = x * HALF_HEX_TILE_HEIGHT;

		return {
			...(elevation > 0 ? biomeData[`${terrainConversionKey[biome] || biome}`] : seafloorData[`elev-${Math.abs(elevation)}`]),
			x: x * testHexCell44BodyData.width + x - offsetAdj,
			y: y * testHexCell44BodyData.height + depthAdj,
			layer: `elev:${waterElevation}`
		};
	}

	static getDepthData(x, y, d, {offset}) {
		const yOffsetAdj = offset ? HALF_HEX_TILE_HEIGHT : 0;
		const yDepthAdj = d * HEX_TILE_THICKNESS;

		return {
			...testHexDepth44BodyData,
			x: x * testHexCell44BodyData.width + x - (x * HALF_HEX_TILE_HEIGHT),
			y: y * testHexCell44BodyData.height + testHexDepth44BodyData.height - 2 + yOffsetAdj - yDepthAdj,
			layer: `elev:${d - 1}`
		};
	}

	static getWaterData(x, y, {offset}) {
		return {
			...testHexWater44BodyData,
			x: x * testHexCell44BodyData.width + x - (x * HALF_HEX_TILE_HEIGHT),
			y: y * testHexCell44BodyData.height + (-WATER_ELEV_OFFSET * HEX_TILE_THICKNESS) + (offset ? HALF_HEX_TILE_HEIGHT : 0)
		};
	}

	createRegion(x, y) {
		const tileCoords = this.constructor.getRegionTiles(x, y);
		const regionKey = this.constructor.getRegionKey(x, y);

		if(!this.regionBodies[regionKey]) {
			this.regionBodies[regionKey] = [];
		}

		tileCoords.forEach(tileCoord => {
			const {x, y} = tileCoord;

			if(!tileCoord || !this.data.hasInternalPoint(x, y)) {
				return;
			}

			const cell = this.data.getDataPoint(x, y);
			const metaPoint = this.data.getMetaPoint(x, y);
			const elevation = cell.elevation + WATER_ELEV_OFFSET;
			const data = this.constructor.getTopData(x, y, {
				biome: cell.biome,
				elevation: cell.elevation,
				offset: metaPoint.offset
			});

			let southElevDiff = elevation;
			const {s, se, sw} = metaPoint;
			const lowestNeighborElev = this.constructor.findLowest(
				(s ? this.data.getDataPoint(s.x, s.y) : {}).elevation,
				(se ? this.data.getDataPoint(se.x, se.y) : {}).elevation,
				(sw ? this.data.getDataPoint(sw.x, sw.y) : {}).elevation,
			);

			if(lowestNeighborElev && s && sw.x < x && se.x > x) {
				southElevDiff = elevation - (lowestNeighborElev + WATER_ELEV_OFFSET);
				southElevDiff = southElevDiff < 0 ? 0 : southElevDiff;
			}

			for(let d = elevation, floor = elevation - southElevDiff; d > floor; d--) {
				// TODO: have blue depth pieces for sub-zero elevation (9 or 10 shades), but not if on bottom edge
				const depthData = this.constructor.getDepthData(x, y, d, {
					offset: metaPoint.offset
				});
				const depthBody = new Body(depthData);

				this.loadBody(depthBody, regionKey);
			}

			if(elevation <= WATER_ELEV_OFFSET) {
				const waterData = this.constructor.getWaterData(x, y, {
					offset: metaPoint.offset
				});
				const waterBody = new Body(waterData);

				this.loadBody(waterBody, regionKey);
			}

			const body = new Body(data);

			this.loadBody(body, regionKey);

			body.addMouseInput('mousemove', {callback: cellMousemoveCallback});
			body.addMouseInput('mousedown', {callback: cellMousedownCallback, key: 'left'});

			body.hexCell = cell;
		});
	}

	destroyRegion(x, y) {
		const regionKey = this.constructor.getRegionKey(x, y);

		this.regionBodies[regionKey].forEach(bodyId => {
			this.world.removeBodies(bodyId);
		});

		delete this.regionBodies[regionKey];
	}
};
