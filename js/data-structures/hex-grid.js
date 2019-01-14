class SquareHexGrid {
	constructor(width, height) {
		this.width = width;
		this.height = height;

		this.createGrid();
	}

	createGrid() {
		const rows = [];

		for(let y = 0; y < this.height; y++) {
			const row = [];

			for(let x = 0; x < this.width; x++) {
				row.push( new Cell() );
			}

			rows.push(row);
		}

		for(let y = 0; y < this.height; y++) {
			for(let x = 0; x < this.width; x++) {
				const xMod = x % 2;
				const even = (xMod == 0);
				const odd = (xMod == 1);

				if(even) {
					rows[y][x].offset = true;
				}

				// s
				if( y < this.height - 1 ) {
					rows[y][x].s = rows[y + 1][x];
				}
				// n
				if( y > 0 ) {
					rows[y][x].n = rows[y - 1][x];
				}
				if( x > 0 ) {
					// nw
					if( y > 0 || even ) {
						if( even ) {
							rows[y][x].nw = rows[y][x - 1];
						} else {
							rows[y][x].nw = rows[y - 1][x - 1];
						}
					}
					// sw
					if( y < this.height - 1 || odd ) {
						if( odd ) {
							rows[y][x].sw = rows[y][x - 1];
						} else {
							rows[y][x].sw = rows[y + 1][x - 1];
						}
					}
				}
				if( x < this.width - 1 ) {
					// ne
					if( y > 0 || even ) {
						if( even ) {
							rows[y][x].ne = rows[y][x + 1];
						} else {
							rows[y][x].ne = rows[y - 1][x + 1];
						}
					}
					// se
					if( y < this.height - 1 || odd ) {
						if( odd ) {
							rows[y][x].se = rows[y][x + 1];
						} else {
							rows[y][x].se = rows[y + 1][x + 1];
						}
					}
				}
			}
		}

		this.cells = rows;
	}

	eachCell(callback) {
		for(let y = 0; y < this.height; y++) {
			for(let x = 0; x < this.width; x++) {
				callback(this.cells[y][x], x, y);
			}
		}

		return this;
	}
}

class Cell {
	constructor() {
		this.nw = false;
		this.n = false;
		this.ne = false;
		this.sw = false;
		this.s = false;
		this.se = false;
		this.offset = false;
		this.data = false;
	}
}

module.exports = SquareHexGrid;
