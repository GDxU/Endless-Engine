const BodyImage = require('./body-image');
const {getTexture} = require('../util/tools');

module.exports = class Text extends BodyImage {
	constructor(args, argsActive, body) {
		super();

		this.body = body;
		this.active = false;
		this.height = 0;
		this.width = 0;
		this.position = {x: 0, y: 0};
		this.scroll = {x: 0, y: 0};	// current amount text is scrolled
		this.textHeight = 0;				// pixel height of text block
		this.kerning = 0;					// negative right margin applied when rendering and calculating line widths
		this.scrollingID = false;		// text scrolling setInterval ID
		this.text = {};					// size, family, color, opacity
		this.printedChars = 0;
		this.varsCache = {};				// Cache any text "vars". Changes to the values trigger reconfiguration

		this.configure(args, argsActive);
	}

	render(context) {
		this.updateVarsCache();
		this.renderImageText(context);
	}

	/**
	 * Applies one or two configuration objects to determine the displays settings and contents.
	 *
	 * @method		configure
	 * @private
	 * @param		{object}		config	A configuration object defining "Normal" state settings
	 * @param		{object}		fallback	An optional secondary configuration object defining "Active" state settings
	 */
	configure(config = {}, fallback = {}) {
		this.font		= (config.font || fallback.font) || 'thintel';
		this.color		= (config.color || fallback.color) || 'white';
		this.font		= `${this.font}-${this.color}`;
		this.alignment	= (config.alignment || fallback.alignment) || 'left';
		this.padding	= (config.padding || fallback.padding) || {h: 0, v: 0};
		this.opacity	= (config.opacity || fallback.opacity) || 1.0;
		this.offset		= (config.offset || fallback.offset) || {x: 0, y: 0};
		this.vars		= (config.vars || fallback.vars) || {};
		this.mode		= (config.mode || config.mode) || 'source-over';
		this.print		= (config.print || config.print) || false;

		this.kerning = (Data.fonts[this.font]) ? Data.fonts[this.font].kerning : 0;

		const fontWidth	= (Data.fonts[this.font]) ? Data.fonts[this.font].width : 1;
		const fontHeight	= (Data.fonts[this.font]) ? Data.fonts[this.font].height : 1;

		this.content = this.convertImageTextToLines((config.content || fallback.content), fontWidth, width - this.padding.h * 2 - this.padding.h * 2, this.kerning) || [];

		this.textHeight = this.content.length * fontHeight;
	}


	set active(status = false) {
		this.active = Boolean(status);

		if(this.active) {
			this.configure(activeConfig, config);
		} else {
			this.configure(config);
		}
	}

	/**
	 * Applies a y-offset to the Display's text while ensuring the text stays visible.
	 *
	 * @param		{integer}		yScroll	Amount to scroll text in y-direction
	 */
	scrollText(yScroll = 0) {
		const newY = this.scroll.y + Math.floor(yScroll);

		if(newY <= 0) {
			const boxHeight = this.height - (2 * this.padding.h);

			if(boxHeight + Math.abs(newY) <= this.textHeight) {
				this.scroll.y = newY;
			}
		}
	}

	/**
	 * Sets up a repeating scroll event and clears out any old scroll events.
	 */
	startScrollingText(yScroll) {
		if(this.scrollingID) {
			this.stopScrollingText();
		}

		this.scrollingID = setInterval(() => {
			this.scrollText(yScroll);
		}, 15);
	}

	/**
	 * Cancels the current scroll event.
	 */
	stopScrollingText() {
		window.clearTimeout(this.scrollingID);
	}

	updateVarsCache() {
		let refresh = false;

		for(const key in this.vars) {
			const replacement = this.vars[key]();

			if( this.varsCache[key] != replacement ) {
				refresh = true;
				this.varsCache[key] = replacement;
			}

		}

		// If var values changed, reconfigure to recalculate line breaks
		if(refresh) {
			if(this.active) {
				this.configure(activeConfig, config);
			} else {
				this.configure(config);
			}
		}
	}

	renderImageText(context) {
		var printing = 0;

		this.printedChars++;

		if( this.text.mode != 'source-over' ) {
			context.globalCompositeOperation = this.text.mode;
		}
		if( this.text.opacity < 1.0 ) {
			context.globalAlpha = this.text.opacity;
		}

		var fontData = Data.fonts[this.text.font];

		context.beginPath();
		context.save();
		context.rect(
			this.position.x + this.offset.x + this.padding.h,
			this.position.y + this.offset.y + this.padding.h,
			this.width - (this.padding.h * 2),
			this.height - (this.padding.h * 2)
		);
		context.clip();

		linesLoop:
		for(var index in this.text.content) {
			var line					= this.text.content[index];
			var lineCharacters	= line.characters;
			var lineWidth			= line.width;
			var lineOffset			= index * fontData.height;
			var lineAlignOffset	= 0;

			if( this.text.alignment == 'center' ) {
				lineAlignOffset = (this.width - lineWidth) * 0.5;
			}

			var textPosition	= {
				x:	this.text.offset.x + this.position.x + this.offset.x + this.text.padding.h + this.padding.h + this.scroll.x + lineAlignOffset,
				y:	this.text.offset.y + this.position.y + this.offset.y + this.text.padding.v + this.padding.h + this.scroll.y + lineOffset
			};

			for(var key in this.varsCache) {
				var keyIndex = lineCharacters.indexOf(key);

				if( keyIndex != -1 ) {
					var replacement = this.varsCache[key];

					lineCharacters = lineCharacters.replace(key, replacement);
				}
			}

			charactersLoop:
			for(var i in lineCharacters) {
				if( this.text.print ) {
					switch(this.text.print) {
						case 'slow':
							printing += 3;
							break;
						case 'medium':
							printing += 2;
							break;
						case 'fast':
							printing += 1;
						default:
							break;
					}

					if( printing >= this.printedChars ) {
						break charactersLoop;
					}
				}

				var character	= lineCharacters[i];
				var imageName	= this.text.font + '-' + character;
				var escaped	= imageName.replace('.', 'escapedthis.dot'); // NEDB does not allow "." in data object properties
				var imageData	= Data.images[escaped];
				var texture	= getTexture(Game.Textures, escaped);

				context.drawImage(
					texture,
					imageData.x,
					imageData.y,
					imageData.w,
					imageData.h,
					textPosition.x + ( i * (fontData.width + this.kerning) ),
					textPosition.y,
					imageData.w,
					imageData.h
				);
			}
		}

		context.restore(); // remove the clipping region
		context.closePath();

		context.globalCompositeOperation = 'source-over';

		if( this.opacity < 1.0 ) {
			context.globalAlpha = 1.0;
		}
	}

	convertImageTextToLines(text = false, fontSize = 16, containerWidth = false, kerning = 0) {
		const SEPARATOR = ' ';
		const FONT_SIZE = fontSize + kerning;

		if( !containerWidth || !text ) {
			return [];
		}
		if( typeof(text) == 'string' ) {
			text = [text];
		}

		const lines = [];

		// Wrap each text piece separately and maintain linebreaks
		for(const piece of text) {
			// Make "vars" replacements before measuring, for accurate measurements
			for(const key in _varsCache) {
				const keyIndex = piece.indexOf(key);

				if( keyIndex != -1 ) {
					const replacement = _varsCache[key];

					piece = piece.replace(key, replacement);
				}
			}

			const words		= piece.split(SEPARATOR);
			let line		= '';
			let testWidth	= 0;

			for(const word of words) {
				const measured = (word.length + 1) * FONT_SIZE;

				if( testWidth + measured < containerWidth ) {
					testWidth += measured;
				} else {
					// Store current line
					lines.push({characters: line, width: testWidth});

					// Start a new line
					line = '';

					// Line width becomes word width
					testWidth = measured;
				}

				line += word + SEPARATOR;
			}

			lines.push({characters: line, width: testWidth});
		}

		return lines;
	}
};
