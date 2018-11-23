const {getGameData} = require('../../data/game-data');

module.exports = class BodyImage {
	constructor() {

	}

	static getTexture(imageName) {
		const textures = getGameData('textures');
		let image = textures[imageName];

		if( image ) {
			return image;
		}

		const sheet = getGameData('images', imageName, 'sheet');
		const src = getGameData('sheets', sheet);

		image = textures[imageName] = new Image();
		image.src = src;

		updateGameData('textures', textures);

		return image;
	}

	static tile(img = {width: 0, height: 0, name: '', x: 0, y: 0}, bounds, context) {
		const image = this.constructor.getTexture(img.name);
		const [boundA, boundB] = this.bounds.aabb;

		for(const x = boundA.x, xMax = boundB.x; x < xMax; x += img.width) {
			for(const y = boundA.y, yMax = boundB.y; y < yMax; y += img.height) {
				const xOverflow	= x + img.width;
				const yOverflow	= y + img.height;
				const xSlice	= (xOverflow > xMax) ? (xOverflow - xMax) : 0;
				const ySlice	= (yOverflow > yMax) ? (yOverflow - yMax) : 0;

				context.drawImage(
					image,
					img.x,
					img.y,
					img.width - xSlice,
					img.height - ySlice,
					x,
					y,
					img.width - xSlice,
					img.height - ySlice
				);
			}
		}
	}
};
