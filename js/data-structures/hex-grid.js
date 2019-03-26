const getGameDataCell = () => {
	return {
		elevation: {
			bodies: [],
			value: 0
		},
		structure: {
			body: false,
			value: ""
		},
		terrain: {
			body: false,
			value: ""
		},
		unit: {

		},
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

class HexGrid {
	constructor(width, height, config = {}) {
		this.width = width;
		this.height = height;
		this.scratch = [];
		this.points = [];
		this.meta = [];
		this.data = [];
		this.pointFilter = false;
		this.wrap = Boolean( config.wrap );
		this.hasMeta = !( config.meta === false );
		this.hasScratch = !( config.scratch === false );
		this.hasData = !( config.data === false );

		// Setup this.points/scratch/meta/data as two-dimensional arrays
		for(let y = 0; y < this.height; y++) {
			const pointRow = [];
			const scratchRow = [];
			const metaRow = [];
			const dataRow = [];

			for(let x = 0; x < this.width; x++) {
				pointRow.push(0);
				scratchRow.push(0);
				dataRow.push(0);
				metaRow.push( this.constructor.createBlankMeta(x, y) );
			}

			this.points.push(pointRow);

			if( this.hasScratch ) {
				this.scratch.push(scratchRow);
			}
			if( this.hasMeta ) {
				this.meta.push(metaRow);
			}
			if( this.hasData ) {
				this.data.push(dataRow);
			}
		}

		this.eachPoint((point, x, y) => {
			const xMod = x % 2;
			const even = (xMod == 0);
			const odd = (xMod == 1);

			if(even) {
				this.setMetaPoint(x, y, {offset: true});
			}

			// s
			if( y < this.height - 1 ) {
				this.setMetaPoint(x, y, {
					s: this.getMetaPoint(x, y + 1)
				});
			}
			// n
			if( y > 0 ) {
				this.setMetaPoint(x, y, {
					n: this.getMetaPoint(x, y - 1)
				});
			}
			if( x > 0 ) {
				// nw
				if( y > 0 || even ) {
					if( even ) {
						this.setMetaPoint(x, y, {
							nw: this.getMetaPoint(x - 1, y)
						});
					} else {
						this.setMetaPoint(x, y, {
							nw: this.getMetaPoint(x - 1, y - 1)
						});
					}
				}
				// sw
				if( y < this.height - 1 || odd ) {
					if( odd ) {
						this.setMetaPoint(x, y, {
							sw: this.getMetaPoint(x - 1, y)
						});
					} else {
						this.setMetaPoint(x, y, {
							sw: this.getMetaPoint(x - 1, y + 1)
						});
					}
				}
			}
			if( x < this.width - 1 ) {
				// ne
				if( y > 0 || even ) {
					if( even ) {
						this.setMetaPoint(x, y, {
							ne: this.getMetaPoint(x + 1, y)
						});
					} else {
						this.setMetaPoint(x, y, {
							ne: this.getMetaPoint(x + 1, y - 1)
						});
					}
				}
				// se
				if( y < this.height - 1 || odd ) {
					if( odd ) {
						this.setMetaPoint(x, y, {
							se: this.getMetaPoint(x + 1, y)
						});
					} else {
						this.setMetaPoint(x, y, {
							se: this.getMetaPoint(x + 1, y + 1)
						});
					}
				}
			}
		});
	}

	static createBlankMeta(x = false, y = false) {
		return {
			edge: false,
			inside: false,
			//hex: 0,
			neighbors: {
				n: false,
				ne: false,
				se: false,
				s: false,
				sw: false,
				nw: false
			},
			numNeighbors: 0,
			offset: false,
			//rotations: 0,
			type: '',
			//variation: 0,
			x,
			y
		};
	}

	getDimensions() {
		return {
			height:	this.height,
			width:	this.width
		};
	}

	hasInternalPoint(x, y) {
		if( x >= 0 && x < this.width ) {
			if( y >= 0 && y < this.height ) {
				return true;
			}
		}

		return false;
	}

	empty() {
		this.eachPoint((point, x, y) => {
			this.setPoint(x, y, 0);
			this.setMetaPoint(x, y, this.constructor.createBlankMeta());
		});

		return this;
	}

	addFilter(filter = point => point) {
		this.pointFilter = filter;

		return this;
	}

	clearFilter() {
		this.pointFilter = false;

		return this;
	}

	filterPoint(point, x, y) {
		if( this.pointFilter ) {
			return this.pointFilter(point, x, y);
		}

		return point;
	}

	eachPoint(callback, clearFilter = true) {
		for(let y = 0; y < this.height; y++) {
			for(let x = 0; x < this.width; x++) {
				let point = this.points[y][x];

				point = this.filterPoint(point, x, y);

				if( callback(point, x, y, this) ) {
					return;
				}
			}
		}

		if( clearFilter && this.pointFilter ) {
			this.pointFilter = false;
		}
	}

	eachPointRandom(callback, clearFilter = true) {
		const allPoints = [];

		this.eachPoint((point, x, y) => {
			allPoints.push({x, y});
		});

		allPoints.randomize();

		for(let i = 0, len = allPoints.length; i < len; i++) {
			const {x, y} = allPoints[i];
			const point = this.filterPoint(this.getPoint(x, y), x, y);

			if( callback(point, x, y, this) ) {
				return;
			}
		}


		if( clearFilter && this.pointFilter ) {
			this.pointFilter = false;
		}
	}

	eachPointReverse(callback, clearFilter = true) {
		for(let y = this.height - 1; y >= 0; y--) {
			for(let x = this.width - 1; x >= 0; x--) {
				let point = this.points[y][x];

				point = this.filterPoint(point, x, y);

				if( callback(point, x, y, this) ) {
					return;
				}
			}
		}

		if( clearFilter && this.pointFilter ) {
			this.pointFilter = false;
		}
	}

	static getNeighbors(x, y) {

	}

	eachScratchPoint(callback, clearFilter = true) {
		if( !this.hasScratch ) {
			return;
		}

		for(let y = 0; y < this.height; y++) {
			for(let x = 0; x < this.width; x++) {
				const point = this.scratch[y][x];

				//point = this.filterPoint(point, x, y);

				if( callback(point, x, y, this) ) {
					return;
				}
			}
		}

		if( clearFilter && this.pointFilter ) {
			this.pointFilter = false;
		}
	}

	eachMetaPoint(callback, clearFilter = true) {
		if( !this.hasMeta ) {
			return;
		}

		for(let y = 0; y < this.height; y++) {
			for(let x = 0; x < this.width; x++) {
				let point = this.meta[y][x];

				point = this.filterPoint(point, x, y);

				if( callback(point, x, y, this) ) {
					return;
				}
			}
		}

		if( clearFilter && this.pointFilter ) {
			this.pointFilter = false;
		}
	}

	eachDataPoint(callback, clearFilter = true) {
		if( !this.hasData ) {
			return;
		}

		for(let y = 0; y < this.height; y++) {
			for(let x = 0; x < this.width; x++) {
				let point = this.data[y][x];

				point = this.filterPoint(point, x, y);

				if( callback(point, x, y, this) ) {
					return;
				}
			}
		}

		if( clearFilter && this.pointFilter ) {
			this.pointFilter = false;
		}
	}

	withPoints(points = [], callback) {
		for(const coord of points) {
			const point = this.getPoint(coord.x, coord.y);

			if( callback(point, coord.x, coord.y, this) ) {
				return;
			}
		}
	}

	copyToScratch() {
		this.eachPoint((point, x, y) => {
			this.setScratchPoint(x, y, point);
		}, false);

		return this;
	}

	copyFromScratch() {
		this.eachScratchPoint((point, x, y) => {
			this.setPoint(x, y, point);
		}, false);

		return this;
	}

	normalize(initX, initY) {
		let x = initX;
		let y = initY;

		if( typeof(x) != 'number' ) {
			throw new Error('Grid x-coordinate must be an integer');
		}
		if( typeof(y) != 'number' ) {
			throw new Error('Grid y-coordinate must be an integer');
		}

		let outOfBounds = false;

		// Offset each value by grid width/height until value is within grid boundaries.
		while( x < 0 ) {
			x += this.width;
			outOfBounds = true;
		}
		while( x >= this.width ) {
			x -= this.width;
			outOfBounds = true;
		}
		while( y < 0 ) {
			y += this.height;
			outOfBounds = true;
		}
		while( y >= this.height ) {
			//return false;
			y -= this.height;
			outOfBounds = true;
		}

		// Check if coordinate falls outside grid and this.wrap has not been enabled
		if( outOfBounds && !this.wrap ) {
			return false;
		}

		return {x, y};
	}

	normalizeBounds(bounds) {
		const normMinBounds = this.normalize(bounds.min.x, bounds.min.y) || {x: 0, y: 0};
		const normMaxBounds = this.normalize(bounds.max.x, bounds.max.y) || {x: this.width - 1, y: this.height - 1};

		return {
			min:	normMinBounds,
			max:	normMaxBounds
		};
	}

	getPoints() {
		return this.points;
	}

	getMetaPoints() {
		return this.meta;
	}

	getDataPoints() {
		return this.data;
	}

	getPoint(x, y, applyFilter = false) {
		const coords = this.normalize(x, y);
		let point;

		if( coords ) {
			point = this.points[coords.y][coords.x];

			if( applyFilter ) {
				point = this.filterPoint(point, coords.x, coords.y);
			}
		}

		return point;
	}

	getRandomPoint(minBound = {x: 0, y: 0}, maxBound = {x: this.width - 1, y: this.height - 1}) {
		const normMinBound = this.normalize(minBound.x, minBound.y);
		const normMaxBound = this.normalize(maxBound.x, maxBound.y);
		const randX = normMinBound.x + Math.floor( Math.random() * (normMaxBound.x - normMinBound.x) );
		const randY = normMinBound.y + Math.floor( Math.random() * (normMaxBound.y - normMinBound.y) );
		const randPoint = {
			x: randX,
			y: randY,
			value: this.getPoint(randX, randY)
		};

		return randPoint;
	}

	getScratchPoint(x, y) {
		if( !this.hasScratch ) {
			return;
		}

		const coords = this.normalize(x, y);

		if( coords ) {
			return this.scratch[coords.y][coords.x];
		}

		return false;
	}

	getMetaPoint(x, y, applyFilter = false) {
		if( !this.hasMeta ) {
			return;
		}

		const coords = this.normalize(x, y);

		if( coords ) {
			var meta = this.meta[coords.y][coords.x];

			// NOTE: meta filters not yet implemented
			/*
			if( applyFilter ) {
				meta = this.filterPoint(meta, coords.x, coords.y);
			}
			*/

			return meta;
		}

		return false;
	}

	getDataPoint(x, y) {
		if( !this.hasData ) {
			return;
		}

		const coords = this.normalize(x, y);

		if( coords ) {
			return this.data[coords.y][coords.x];
		}

		return false;
	}

	setPoint(x, y, value) {
		var normalized = this.normalize(x, y);

		if( normalized ) {
			this.points[normalized.y][normalized.x] = value;
		}
	}

	setScratchPoint(x, y, value) {
		if( !this.hasScratch ) {
			return;
		}

		const normalized = this.normalize(x, y);

		if( normalized ) {
			this.scratch[normalized.y][normalized.x] = value;
		}
	}

	setMetaPoint(x, y, values) {
		if( !this.hasMeta ) {
			return;
		}

		const normalized = this.normalize(x, y);

		if( normalized ) {
			const metaValues = this.meta[normalized.y][normalized.x];

			this.meta[normalized.y][normalized.x] = {
				...metaValues,
				...values
			};
		}
	}

	setDataPoint(x, y, values) {
		if( !this.hasData ) {
			return;
		}

		const normalized = this.normalize(x, y);

		if( normalized ) {
			const dataValues = this.data[normalized.y][normalized.x];

			this.data[normalized.y][normalized.x] = {
				...dataValues,
				...values
			};
		}
	}

	getEdge() {
		const points = [];

		this.eachMetaPoint((metapoint, x, y) => {
			if( metapoint.edge ) {
				points.push({x, y});
			}
		});

		return points;
	}

	getInside() {
		const points = [];

		this.eachMetaPoint((metapoint, x, y) => {
			if( metapoint.inside ) {
				points.push({x, y});
			}
		});

		return points;
	}

	setMetaRelationships() {
		const nghbrDirs = ['n', 'ne', 'se', 's', 'sw', 'nw'];

		this.eachPoint((point, x, y) => {
			let count = 0;

			if(point) {
				const metaPoint = this.getMetaPoint(x, y);

				nghbrDirs.forEach(dir => {
					const nghbrMeta = metaPoint[dir];

					if( nghbrMeta && this.getPoint(nghbrMeta.x, nghbrMeta.y) ) {
						count++;
					}
				});
			}

			this.setMetaPoint(x, y, {
				edge: (point && count != 6),
				inside: (point && count == 6),
				numNeighbors: count
			});
		});
	}

	grow() {

	}

	erode() {

	}

	fill(minNeighbors = 6) {
		this.eachMetaPoint((metapoint, x, y) => {
			if( metapoint.numNeighbors >= minNeighbors ) {
				this.setPoint(x, y, 1);
			}
		});

		return this;
	}

	winnow(minNeighbors = 1) {
		this.eachMetaPoint((metapoint, x, y) => {
			if( metapoint.numNeighbors < minNeighbors ) {
				this.setPoint(x, y, 0);
			}
		});

		return this;
	}

	populate(percent = 50) {
		let chance = (1 - (percent / 100)) || 0.5;

		if( percent == 100 ) {
			chance = 0;
		}

		this.eachPoint((point, x, y) => {
			if( Math.random() > chance ) {
				this.setPoint(x, y, 1);
			}
		});

		return this;
	}

	depopulate(percent = 50) {
		let chance = (1 - (percent / 100)) || 0.5;

		if( percent == 100 ) {
			chance = 0;
		}

		this.eachPoint((point, x, y) => {
			if( Math.random() > chance ) {
				this.setPoint(x, y, 0);
			}
		});

		return this;
	}
}

class GameDataCell {
	constructor() {
		this.data = {
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
			terrain: {
				//adjacent terrain values
				body: false,
				value: ""
			},
			unit: {
				// reference army group?
				//body: false
			},
			water: {
				body: false,
				value: ""// litoral coast, sea, river, ocean
			},
			weather: {
				body: false,
				value: ""
			}
		};
	}
}

module.exports = HexGrid;