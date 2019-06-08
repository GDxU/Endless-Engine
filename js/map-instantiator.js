const Body = require('./body/body');

const REGION_SIZE = 10;
const ACTIVE_AREA_WIDTH = 3;
const ACTIVE_AREA_HEIGHT = 3;
const HEX_TILE_WIDTH = 44;
const HEX_TILE_HEIGHT = 26;

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
	highlightedElev = self.hexCell.elevation;
};

module.exports = class MapInstantiator {
	constructor(mapData, world) {
		this.data = mapData;
		this.lastRegions = {};
		this.centerRegion = {};
		this.world = world;
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
					const testCoordsKey = `${testCoords.x}-${testCoords.y}`;

					if(!this.lastRegions[testCoordsKey]) {
						console.log("create region:", testCoordsKey);
						this.createRegion(testCoords.x, testCoords.y);
					}

					newRegions[testCoordsKey] = true;
				}
			}

			// check each lastRegion against new ones. For each mis-match, destroy that region

			this.lastRegions = newRegions;
		}
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

	createRegion(x, y) {
		const tileCoords = this.constructor.getRegionTiles(x, y);

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

			data.y += -elevation * 4;
			data.layer = `elev:${elevation}`;

			if(elevation <= waterElev) {
				const waterData = {
					...testHexWater44BodyData,
					x: x * testHexCell44BodyData.width + x + 80,
					y: y * testHexCell44BodyData.height + 40
				};
				waterData.y += (metaPoint.offset ? (testHexCell44BodyData.height / 2) : 0);
				waterData.x -= x * 13;
				waterData.y += -waterElev * 4;
				const waterBody = new Body(waterData);
				this.world.addBodies(waterBody);
			}

			const body = new Body(data);

			this.world.addBodies(body);

			body.addMouseInput('mousemove', {callback: cellMousemoveCallback});
			body.addMouseInput('mousedown', {callback: cellMousedownCallback, key: 'left'});
		});
	}

	destroyRegion() {

	}
};
