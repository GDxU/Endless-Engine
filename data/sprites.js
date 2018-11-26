module.exports = {
	'test-sprite-1': 	{
		ticksPerFrame: 10,
		loop: false,
		tiled: true,
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
		tiled: true,
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
};
