const MaxRectsPacker = require('maxrects-packer');
const Datastore = require('nedb');
const {PATHS} = require('../constants');
const {getGameData, updateGameData} = require(`${PATHS.DATA_DIR}/game-data`);

module.exports = new function() {
	const _self 	= this;
	const _encoded	= {};
	const _images	= getGameData('images');
	const _sheets	= getGameData('sheets');
	let _db			= false;
	let _canvas		= false;
	let _context	= false;

	_self.decode = function(callback = function(){}) {
		_db = new Datastore({filename: `${PATHS.ASSETS_DIR}/encoded-img-data`, autoload: true});

		_db.findOne({}, function(err, doc) {
			if( doc ) {
				console.log('starting decode');
				_loadSheet(doc, 0, callback);
			}
		});
	};

	function _loadSheet(encoded, index, callback) {
		const key	= Object.keys(encoded.sheets)[index];
		const data	= encoded.sheets[key];
		const image = new Image();

		image.onload = function() {
			index++;

			if( index < Object.keys(encoded.sheets).length ) {
				_loadSheet(encoded, index, callback);
			} else {
				// Adjust image data
				for(const i in encoded.images) {
					var imgData = encoded.images[i];

					_images[i].x		= imgData.x;
					_images[i].y		= imgData.y;
					_images[i].sheet	= imgData.sheet;
				}

				// Adjust sheet data
				//Data.sheets = {};
				const imageSheets = {};

				for(const s in encoded.sheets) {
					//Data.sheets[s] = encoded.sheets[s];
					imageSheets[s] = encoded.sheets[s];
				}

				updateGameData('sheets', imageSheets);

				console.log('sheet loading done');

				callback();
			}
		}

		image.src = data;
	}

	/*
	function _loadImages(encoded, index, callback) {
		const key	= Object.keys(encoded.images)[index];
		const sheet	= encoded.images[key].sheet;
		const data	= encoded.sheets[sheet];
		const image = new Image();

		image.onload = function() {
			index++;

			Data.images[key].src	= data;
			Data.images[key].x		= encoded.images[key].x;
			Data.images[key].y		= encoded.images[key].y;

			if( index < Object.keys(_images).length ) {
				_loadImages(encoded, index, callback);
			} else {
				callback();
			}
		}

		image.src = data;
	}
	*/

	_self.encode = function() {
		fs.unlink(PATHS.ASSETS_DIR + '/encoded-img-data', function(err) {
			_canvas	= document.createElement('canvas');
			_context	= _canvas.getContext('2d');

			_db = new Datastore({filename: PATHS.ASSETS_DIR + '/encoded-img-data', autoload: true});

			if( Object.keys(_images).length > 0 ) {
				_binImages();
			}
		});
	};

	function _binImages() {
		const packer = new MaxRectsPacker(1024, 1024);
		const contents = [];

		for(var i in _images) {
			const image = _images[i];
			const shape = {width: image.w, height: image.h, data: i};

			contents.push(shape);
		}

		packer.addArray(contents);

		_pasteBin(packer, 0, function() {
			_db.insert({sheets: _encoded, images: _images}, function(err, newDoc) {

				if( err ) {
					console.log('Bin encoding problem occurred');
				} else {
					console.log('Bin encoding complete');
				}

				for(var s in _encoded) {
					var sheet	= _encoded[s];
					var data	= sheet.replace(/^data:image\/\w+;base64,/, '');
					var buffer = new Buffer(data, 'base64');

					fs.writeFile('assets/test-' + s + '.png', buffer, function(err){
						console.log('completed writing');
					});
				}
			});
		})
	}

	function _pasteBin(packer, binIndex = 0, binsComplete = function(){}) {
		console.log('Doing bin ' + binIndex);
		const bin = packer.bins[binIndex];

		_canvas.width	= bin.width;
		_canvas.height	= bin.height;

		_context.globalCompositeOperation = 'source-over';
		_context.fillStyle = 'transparent';
		_context.fillRect(0, 0, _canvas.width, _canvas.height);

		_pasteBinImages(packer, binIndex, 0, function() {
			// Dump canvas data
			_encoded[`spritesheet-${binIndex}`] = _canvas.toDataURL('image/png');

			binIndex++;

			if( binIndex < packer.bins.length ) {
				// Move on to the next bin
				_pasteBin(packer, binIndex, binsComplete);
			} else {
				binsComplete();
			}
		});
	}

	function _pasteBinImages(packer, binIndex = 0, rectIndex = 0, binComplete = function(){}) {
		const bin			= packer.bins[binIndex];
		const image			= new Image();
		const binImgData	= bin.rects[rectIndex];

		image.onload = function() {
			_context.drawImage(
				this,
				_images[binImgData.data].x,
				_images[binImgData.data].y,
				_images[binImgData.data].w,
				_images[binImgData.data].h,
				binImgData.x,
				binImgData.y,
				binImgData.width,
				binImgData.height
			);

			// Update the image data with their new sheets and positions within them
			_images[binImgData.data].x			= binImgData.x;
			_images[binImgData.data].y			= binImgData.y;
			_images[binImgData.data].sheet	= `spritesheet-${binIndex}`;


			rectIndex++;

			if( rectIndex < packer.bins[binIndex].rects.length ) {
				_pasteBinImages(packer, binIndex, rectIndex, binComplete);
			} else {
				binComplete();
			}
		}

		image.src = PATHS.IMG_DIR + _sheets[ _images[binImgData.data].sheet ];
	}
};
