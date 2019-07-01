const data = {
	'test-sprite-1': 	{
		ticksPerFrame: 55,
		sync: true,
		loop: true,
		tiled: true,
		padding: 0,
		layer: 'layer-1',
		frameData: {
			'normal': {
				'e': {
					frames: ['test-image-1', 'test-image-2'],
					//backfacing: true
				}
			}
		}
	},
	'test-sprite-2': 	{
		ticksPerFrame: 10,
		loop: false,
		tiled: false,
		padding: 0,
		layer: 'layer-2',
		frameData: {
			'normal': {
				'e': {
					frames: ['test-image-3']
				}
			}
		}
	},
	'test-orange-hex': 	{
		ticksPerFrame: 10,
		loop: false,
		tiled: false,
		padding: 0,
		layer: 'layer-2',
		frameData: {
			'normal': {
				'e': {
					frames: ['test-orange-hex']
				}
			}
		}
	},
	'test-orange-hex-depth': 	{
		ticksPerFrame: 10,
		loop: false,
		tiled: false,
		padding: 0,
		layer: 'layer-2',
		frameData: {
			'normal': {
				'e': {
					frames: ['test-orange-hex-depth']
				}
			}
		}
	},
	'test-orange-hex-water': 	{
		ticksPerFrame: 10,
		loop: false,
		tiled: false,
		padding: 0,
		layer: 'layer-2',
		frameData: {
			'normal': {
				'e': {
					frames: ['test-orange-hex-water']
				}
			}
		}
	},
	'hex-cell-44-top': 	{
		ticksPerFrame: 10,
		loop: false,
		tiled: false,
		padding: 0,
		layer: 'layer-2',
		frameData: {
			'normal': {
				'e': {
					frames: ['hex-cell-44-top']
				}
			}
		}
	},
	'hex-cell-44-height': 	{
		ticksPerFrame: 10,
		loop: false,
		tiled: false,
		padding: 0,
		layer: 'layer-2',
		frameData: {
			'normal': {
				'e': {
					frames: ['hex-cell-44-height']
				}
			}
		}
	},
	'hex-cell-44-water-top': {
		ticksPerFrame: 10,
		loop: false,
		tiled: false,
		padding: 0,
		layer: 'layer-2',
		frameData: {
			'normal': {
				'e': {
					frames: ['hex-cell-44-water-top']
				}
			}
		}
	}
};

for(let i = 1; i <= 9; i++) {
	data[`hex-cell-44-seafloor-${i}-top`] = {
		ticksPerFrame: 10,
		loop: false,
		tiled: false,
		padding: 0,
		layer: 'layer-2',
		frameData: {
			'normal': {
				'e': {
					frames: [`hex-cell-44-seafloor-${i}-top`]
				}
			}
		}
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
const terrainWalls = [
	'boreal',
	'desert',
	'hot-desert',
	'ice',
	'moonscape',
	'savanna',
	'scrubland',
	'shrubland',
	'tundra'
];

for(let i = 0; i < terrains.length; i++) {
	const terrain = terrains[i];

	data[`hex-cell-44-${terrain}-top`] = {
		ticksPerFrame: 10,
		loop: false,
		tiled: false,
		padding: 0,
		layer: 'layer-2',
		frameData: {
			'normal': {
				'e': {
					frames: [`hex-cell-44-${terrain}-top`]
				}
			}
		}
	};
}
for(let i = 0; i < terrainWalls.length; i++) {
	const terrainWall = terrainWalls[i];

	data[`hex-cell-44-${terrainWall}-wall`] = {
		ticksPerFrame: 10,
		loop: false,
		tiled: false,
		padding: 0,
		layer: 'layer-2',
		frameData: {
			'normal': {
				'e': {
					frames: [`hex-cell-44-${terrainWall}-wall`]
				}
			}
		}
	};
}

module.exports = data;
