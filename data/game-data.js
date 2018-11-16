const data = {
	images: {
		'traffic-light-1': {sheet: 'traffic-light-1', x: 0, y: 0, w: 276, h: 135}
	},
	sheets: {
		'traffic-light-1': 'traffic-light-1.png'
	},
	sprites: {}
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
		if(state[key]) {
			state[key] = value;
		}
	}
};
