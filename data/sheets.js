const data = {
	'test-sheet-1': 'test-sheet-1.png',
	'test-sheet-2': 'test-sheet-2.png',
	'thintel-white': 'thintel-white.png',
	'test-orange-hex': 'test-orange-hex.png',
	'test-orange-hex-depth': 'test-orange-hex-depth.png',
	'test-orange-hex-water': 'test-orange-hex-water.png',
	'hex-cell-44-top': 'hex-cell-44-top.png',
	'hex-cell-44-height': 'hex-cell-44-height.png',
	'hex-cell-44-water-top': 'hex-cell-44-water-top.png'
};

for(let i = 1; i <= 9; i++) {
	data[`hex-cell-44-seafloor-${i}-top`] = `hex-cell-44-seafloor-${i}-top.png`;
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

	data[`hex-cell-44-${terrain}-top`] = `hex-cell-44-${terrain}-top.png`;
}
for(let i = 0; i < terrainWalls.length; i++) {
	const terrainWall = terrainWalls[i];

	data[`hex-cell-44-${terrainWall}-wall`] = `hex-cell-44-${terrainWall}-wall.png`;
}

module.exports = data;
