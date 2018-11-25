const BodyImage = require('./body-image');
const {getGameData} = require('../../data/game-data');
const {SPRITE} = require('../constants');
const {FACINGS, MODES, MODE_FALLBACKS} = SPRITE;

module.exports = class Sprite extends BodyImage {
	constructor(name, body) {
		super();

		this.name = name;
		this.body = body;
		this.data = getGameData('sprites', name);
		this.tickCounter = 10000;
		this.loopDelayCounter = 0;
		this.frameIndex = 0;
		this.texture = '';
	}

	get mode() {
		return this.body.mode;
	}

	get facing() {
		return this.body.facing;
	}

	render(context, vportPosition, vportSize, vportViewBounds) {
		this.tick();

		if(this.data.tiled) {
			/*
			const image = {
				name:		_self.inside.image,
				width:	Data.images[_self.inside.image].w,
				height:	Data.images[_self.inside.image].h,
				x:			Data.images[_self.inside.image].x,
				y:			Data.images[_self.inside.image].y
			};
			*/
			const image = getGameData('images', this.texture);

			image.name = this.texture;

			Sprite.tile(image, this.body, context, vportPosition, vportSize, vportViewBounds);
		} else {
			const calcPosition = {
				x: this.body.position.x + vportPosition.x,
				y: this.body.position.y + vportPosition.y
			};

			context.fillStyle = 'pink';
			context.translate(calcPosition.x, calcPosition.y);
			context.fillRect(-this.body.width / 2, -this.body.height / 2, this.body.width, this.body.height);
			context.translate(-calcPosition.x, -calcPosition.y);
		}
	}

	tick() {
		const refresh = this.body.refreshSpriteFrame;
		let usableMode		= false;
		let usableFacing	= false;
		let spriteMode		= this.mode || 'normal';

		if( !this.data.frameData[spriteMode] ) {
			const attemptedModes	= spriteMode.split('-');
			const [primaryMode]	= attemptedModes;
			let fallbackMode		= false;

			fallbackLoop:
			for(const i in MODE_FALLBACKS[primaryMode]) {
				const testMode = MODE_FALLBACKS[primaryMode][i];

				if( frames[testMode] ) {
					fallbackMode = this.data.frameData[testMode];

					break fallbackLoop;
				}
			}

			// Attempt the primary mode as the fallback
			if( this.data.frameData[primaryMode] ) {
				fallbackMode = primaryMode;
			}

			spriteMode = (fallbackMode) ? fallbackMode : 'normal';
		}

		usableMode = spriteMode;

		for(const facing of FACINGS) {
			if(this.data.frameData[usableMode][facing]) {
				usableFacing = facing;
			}
		}

		if( ++this.tickCounter >= this.data.ticksPerFrame || refresh ) {
			this.tickCounter = 0;

			const currentSet = this.data.frameData[usableMode][usableFacing];

			if( !currentSet ) {
				return;
			}

			// Move frames forward or backward by one
			/*
			if( reversed ) {
				body.frames.frameIndex--;
			} else {
				body.frames.frameIndex++;
			}
			*/

			// Have sprite frames loop back to first frame
			if( this.frameIndex >= currentSet.frames.length || refresh ) {
				// If looping is disabled, leave sprite at its final frame
				if( !this.data.loop && !refresh ) {
					return;
				}

				// Add extra ticks onto the resetting of the frame index
				if( this.data.padding ) {
					if( ++this.loopDelayCounter > this.data.padding ) {
						this.loopDelayCounter = 0;
					} else {
						return;
					}
				}

				// Reset to first frame
				this.frameIndex = 0;
			} else if( this.frameIndex < 0 ) {
				// Advance to last frame
				this.frameIndex = currentSet.frames.length - 1;
			}

			//body.render.sprite.opacity	= frames[spriteMode].opacity;
			//body.render.sprite.mode		= frames[spriteMode].mode;
			this.texture = currentSet.frames[this.frameIndex];

			// If the facing has a zindex override, set it
			/*
			if( currentSet.zindex ) {
				body.zindexOverride = currentSet.zindex ;
			} else if( body.zindexOverride ) {
				body.zindexOverride = false;
			}
			*/

			//var effectData = frames[spriteMode].effects[currentSprite];

			//createEffect(body, effectData);
		}
	}
};
