const fonts = require('./fonts');
const importFont = require('../js/image/importer');

const images = {
	'test-image-1': {sheet: 'test-sheet-1', x: 0, y: 0, w: 16, h: 16},
	'test-image-2': {sheet: 'test-sheet-1', x: 16, y: 0, w: 16, h: 16},
	'test-image-3': {sheet: 'test-sheet-2', x: 0, y: 0, w: 10, h: 10},
	'test-orange-hex': {sheet: 'test-orange-hex', x: 0, y: 0, w: 21, h: 11}
};

Object.keys(fonts).forEach(name => {
	importFont(images, name, fonts[name]);
});

module.exports = images;
