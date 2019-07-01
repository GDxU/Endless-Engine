const fonts = require('./fonts');
const importFont = require('../js/image/importer');

const images = {
	'test-image-1': {sheet: 'test-sheet-1', x: 0, y: 0, w: 16, h: 16},
	'test-image-2': {sheet: 'test-sheet-1', x: 16, y: 0, w: 16, h: 16},
	'test-image-3': {sheet: 'test-sheet-2', x: 0, y: 0, w: 10, h: 10},
	'test-orange-hex': {sheet: 'test-orange-hex', x: 0, y: 0, w: 21, h: 12},
	'test-orange-hex-depth': {sheet: 'test-orange-hex-depth', x: 0, y: 0, w: 21, h: 7},
	'test-orange-hex-water': {sheet: 'test-orange-hex-water', x: 0, y: 0, w: 21, h: 12},
	'hex-cell-44-top': {sheet: 'hex-cell-44-top', x: 0, y: 0, w: 44, h: 26},
	'hex-cell-44-height': {sheet: 'hex-cell-44-height', x: 0, y: 0, w: 44, h: 16},
	'hex-cell-44-water-top': {sheet: 'hex-cell-44-water-top', x: 0, y: 0, w: 44, h: 26}
};

for(let i = 1; i <= 9; i++) {
	images[`hex-cell-44-seafloor-${i}-top`] = {sheet: `hex-cell-44-seafloor-${i}-top`, x: 0, y: 0, w: 44, h: 26};
}

const terrains = [
	'boreal',
	'desert',
	'evergreen',
	'grassland',
	'hot-desert',
	'ice',
	'moonscape',
	'savanna',
	'scrubland',
	'shrubland',
	'temp-forest',
	'trop-forest',
	'tundra',
	'woodland'
];
const terrainWalls = [
	'boreal',
	'desert',
	'hot-desert',
	'ice',
	'moonscape',
	'savanna',
	'scrubland',
	'shrubland',
	'tundra'
];

for(let i = 0; i < terrains.length; i++) {
	const terrain = terrains[i];

	images[`hex-cell-44-${terrain}-top`] = {sheet: `hex-cell-44-${terrain}-top`, x: 0, y: 0, w: 44, h: 26};
}
for(let i = 0; i < terrainWalls.length; i++) {
	const terrainWall = terrainWalls[i];

	images[`hex-cell-44-${terrainWall}-wall`] = {sheet: `hex-cell-44-${terrainWall}-wall`, x: 0, y: 0, w: 44, h: 16};
}

Object.keys(fonts).forEach(name => {
	importFont(images, name, fonts[name]);
});

module.exports = images;
