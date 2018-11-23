// require images
// require layers

const data = {
	images: {
		'test-image-1': {sheet: 'test-sheet-1', x: 0, y: 0, w: 16, h: 16},
		'test-image-2': {sheet: 'test-sheet-2', x: 0, y: 0, w: 10, h: 10}
	},
	layers: {
		//'layer-1-backfacing': 9,
		'layer-1': 10,
		//'layer-2-backfacing': 19,
		'layer-2': 20,
		//'layer-3-backfacing': 29,
		'layer-3': 30
	},
	sheets: {
		'test-sheet-1': 'test-sheet-1.png',
		'test-sheet-2': 'test-sheet-2.png',
	},
	sprites: {
		'test-sprite-1': 	{
			ticksPerFrame: 10,
			loop: false,
			padding: 0,
			layer: 'layer-1',
			frameData: {
				'normal': {
					'e': {
						frames: ['test-image-1'],
						//backfacing: true
					}
				}
			}
		},
		'test-sprite-2': 	{
			ticksPerFrame: 10,
			loop: false,
			//tiled: true,
			padding: 0,
			layer: 'layer-2',
			frameData: {
				'normal': {
					'e': {
						frames: ['test-image-2']
					}
				}
			}
		}
	},
	textures: {}
};

module.exports = {
	getGameData(...sections) {
		let value = data;

		for(const section of sections) {
			if(value.hasOwnProperty(section)) {
				value = value[section];
			}
		}

		return JSON.parse(JSON.stringify(value));
	},
	updateGameData(key, value) {
		if(data.hasOwnProperty(key)) {
			data[key] = value;
		}
	}
};
