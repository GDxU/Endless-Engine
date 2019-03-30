const DIRECTIONS = ['n', 'ne', 'se', 's', 'sw', 'nw'];
const RANGE = DIRECTIONS.length;

class HexCompass {
	constructor() {
		this.index = 0;
	}
	normalizeIndex(index) {
		let normalized = index;

		if(index >= RANGE) {
			normalized -= RANGE;
		} else if(index < 0) {
			normalized += RANGE;
		}

		return normalized;
	}
	get dir() {
		return DIRECTIONS[this.index];
	}
	set dir(direction) {
		if( DIRECTIONS.includes(direction) ) {
			this.index = DIRECTIONS.indexOf(direction);
		}
	}
	get adjacent() {
		const left = DIRECTIONS[this.normalizeIndex(this.index - 1)];
		const right = DIRECTIONS[this.normalizeIndex(this.index + 1)];

		return {left, right};
	}
	get opposite() {
		return DIRECTIONS[this.normalizeIndex(this.index + RANGE / 2)];
	}
	get left() {
		const {left} = this.adjacent;

		return left;
	}
	get right() {
		const {right} = this.adjacent;

		return right;
	}
	rotate(rotations = 1) {
		const adj = rotations > 0 ? 1 : -1;

		for(let i = 0, numRotations = Math.abs(rotations); i < numRotations; i++) {
			this.index += adj;

			if( this.index == DIRECTIONS.length ) {
				this.index = 0;
			}
			if( this.index < 0 ) {
				this.index = DIRECTIONS.length - 1;
			}
		}

		return this;
	}
	randomize() {
		this.index = Math.floor( Math.random() * RANGE );

		return this;
	}
}

module.exports = HexCompass;
