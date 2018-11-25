const {getGameData, updateGameData} = require('../../data/game-data');

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

		image = new Image();
		image.src = src;
		textures[imageName] = image;

		updateGameData('textures', textures);

		return image;
	}

	static tile(img = {w: 0, h: 0, name: '', x: 0, y: 0}, body, context, vportPosition, vportSize, vportViewBounds) {
		const image = BodyImage.getTexture(img.name);
		const [boundA, boundB] = body.bounds.aabb;
		const [vportBoundA, vportBoundB] = vportViewBounds.aabb;

		for(let x = boundA.x, xMax = boundB.x; x < xMax; x += img.w) {
			for(let y = boundA.y, yMax = boundB.y; y < yMax; y += img.h) {
				const viewLeftSlice		= boundA.x < vportBoundA.x ? Math.abs(boundA.x - vportBoundA.x) : 0;
				const viewRightSlice		= boundB.x > vportBoundB.x ? boundB.x - vportBoundB.x : 0;
				const viewTopSlice		= boundA.y < vportBoundA.y ? Math.abs(boundA.y - vportBoundA.y) : 0;
				const viewBottomSlice	= boundB.y > vportBoundB.y ? boundB.y - vportBoundB.y : 0;
				const xOverflow	= x + img.w;
				const yOverflow	= y + img.h;
				const xSlice		= (xOverflow > xMax) ? (xOverflow - xMax) : 0;
				const ySlice		= (yOverflow > yMax) ? (yOverflow - yMax) : 0;

				context.drawImage(
					image,
					img.x + viewLeftSlice,
					img.y + viewTopSlice,
					img.w - xSlice - viewRightSlice - viewLeftSlice,
					img.h - ySlice - viewBottomSlice - viewTopSlice,
					x + vportPosition.x + viewLeftSlice,
					y + vportPosition.y + viewTopSlice,
					img.w - xSlice - viewRightSlice - viewLeftSlice,
					img.h - ySlice - viewBottomSlice - viewTopSlice
				);
			}
		}
	}
};
