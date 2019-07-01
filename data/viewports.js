module.exports = {
	'test-viewport-1': {
		x: 10,
		y: 90,
		width: 100,
		height: 100,
		view: {
			x: 30,
			y: 0
		},
		layer: 3
	},
	'test-viewport-2': {
		//x: 250,
		//y: 70,
		//width: 220,
		//height: 190,
		x: 0,
		y: 0,
		width: 480,
		height: 270,
		view: {
			//x: 40,
			//y: 10
			x: 0,
			y: 0
		},
		listeners: {
			key: false,
			mouse: true
		},
		layer: 1
	},
	'ui-test-viewport-1': {
		x: 5,
		y: 190,
		width: 160,
		height: 70,
		view: {
			x: 0,
			y: 0
		},
		layer: 2
	}
};
