module.exports = {
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
	}
};
