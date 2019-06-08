const Body = require('./body/body');

const REGION_SIZE = 10;
const ACTIVE_AREA_WIDTH = 3;
const ACTIVE_AREA_HEIGHT = 3;
const HEX_TILE_WIDTH = 44;
const HEX_TILE_HEIGHT = 26;
const HEX_TILE_THICKNESS = 4;
const KEY_DELIMITER = ",";

const testHexCell44BodyData = {
	height: 26,
	width: 44,
	chamfer: 12,
	velocity: {x: 0, y: 0},
	sprite: 'hex-cell-44-top',
	layer: 'elev:0',
	bitmask: 'ui'
};
const testHexDepth44BodyData = {
	height: 16,
	width: 44,
	velocity: {x: 0, y: 0},
	sprite: 'hex-cell-44-height',
	layer: 'elev:0',
	bitmask: 'ui'
};
const waterElev = 10;
const testHexWater44BodyData = {
	height: 26,
	width: 44,
	velocity: {x: 0, y: 0},
	sprite: 'hex-cell-44-water-top',
	layer: `elev:${waterElev}`,
	bitmask: 'ui'
};
const cellMousemoveCallback = (self, e) => {
	//console.log("move", self);
};
const cellMousedownCallback = (self, e) => {
	console.log("clicked cell", "elevation:", self.hexCell.elevation);
	//highlightedElev = self.hexCell.elevation;
};

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
					const testCoordsKey = `${testCoords.x}${KEY_DELIMITER}${testCoords.y}`;

					if(!this.lastRegions[testCoordsKey]) {
						console.log(`created region: (${testCoords.x},${testCoords.y})`);
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
			console.log("new regions list", Object.keys(this.regionBodies));
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
		const tileX = Math.floor(x / HEX_TILE_WIDTH);
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
		this.regionBodies[regionKey].push(body.handle);
	}

	createRegion(x, y) {
		const tileCoords = this.constructor.getRegionTiles(x, y);
		const regionKey = this.constructor.getRegionKey(x, y);

		if(!this.regionBodies[regionKey]) {
			this.regionBodies[regionKey] = [];
		}

		tileCoords.forEach(({x, y}) => {
			if(!this.data.hasInternalPoint(x, y)) {
				return;
			}

			const cell = this.data.getDataPoint(x, y);
			const metaPoint = this.data.getMetaPoint(x, y);

			const data = {
				...testHexCell44BodyData,
				x: x * testHexCell44BodyData.width + x + 80,
				y: y * testHexCell44BodyData.height + 40
			};
			data.y += (metaPoint.offset ? (testHexCell44BodyData.height / 2) : 0);
			data.x -= x * 13;
			const elevation = cell.elevation + waterElev;

			data.y += -elevation * HEX_TILE_THICKNESS;
			data.layer = `elev:${elevation}`;

			let southElevDiff = 0;
			const {s, se, sw} = metaPoint;
			const lowestNeighborElev = this.constructor.findLowest(
				(this.data.getDataPoint(s.x, s.y) || {}).elevation,
				(this.data.getDataPoint(se.x, se.y) || {}).elevation,
				(this.data.getDataPoint(sw.x, sw.y) || {}).elevation
			);

			if(lowestNeighborElev) {
				southElevDiff = elevation - (lowestNeighborElev + waterElev);
				southElevDiff = southElevDiff < 0 ? 0 : southElevDiff;
			}

			for(let d = elevation, floor = elevation - southElevDiff; d > floor; d--) {
				const depthData = {
					...testHexDepth44BodyData,
					x: x * testHexCell44BodyData.width + x + 80 - (x * 13),
					y: y * testHexCell44BodyData.height + testHexDepth44BodyData.height + 40 - 2,
					layer: `elev:${d - 1}`
				};

				depthData.y += (metaPoint.offset ? (testHexCell44BodyData.height / 2) : 0);
				depthData.y -= d * HEX_TILE_THICKNESS;

				const depthBody = new Body(depthData);

				this.loadBody(depthBody, regionKey);
			}

			if(elevation <= waterElev) {
				const waterData = {
					...testHexWater44BodyData,
					x: x * testHexCell44BodyData.width + x + 80,
					y: y * testHexCell44BodyData.height + 40
				};
				waterData.y += (metaPoint.offset ? (testHexCell44BodyData.height / 2) : 0);
				waterData.x -= x * 13;
				waterData.y += -waterElev * HEX_TILE_THICKNESS;
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

		this.regionBodies[regionKey].forEach(bodyHandle => {
			this.world.removeBodies(bodyHandle);
		});

		delete this.regionBodies[regionKey];
	}
};
