const data = {
	images: {
		sheet: 'traffic-light-1', x: 0, y: 0, w: 276, h: 135
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

		return value;
	}
};
