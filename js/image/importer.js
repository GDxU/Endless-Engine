const {FONT_CHARACTERS} = require('../constants');

module.exports = (dataSet, font) => {
	for(const i in FONT_CHARACTERS) {
		let character = FONT_CHARACTERS[i];

		if( character == '.' ) {
			character = 'escaped_dot';
		}

		const xPosition = i % font.charsPerLine * font.width;
		const yPosition = Math.floor(i / font.charsPerLine) * font.height;

		dataSet[font.sheet + '-' + character] = {
			sheet: font.sheet,
			x: xPosition,
			y: yPosition,
			w: font.width,
			h: font.height
		};
	}
};
