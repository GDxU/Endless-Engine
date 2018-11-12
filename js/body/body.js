const Bounds = require('../bounds');
const List = require('../list');
const Sprite = require('../sprite');
const {getGameData} = require('../../data/game-data');
const {incrementGameState} = require('../state');

module.exports = class Body {
	constructor(args) {
		//this.category
		//this.mask
		this.id = incrementGameState('lastBodyId');
		this.world = null;
		this.position = {
			x: args.x || 0,
			y: args.y || 0
		};
		this.velocity = {x: 0, y: 0};

		// static/sleeping?
		// ghost (do not track collissions)
		// invis (do not track sprite/rendering)

		this.height = args.height || 0;
		this.width = args.width || 0;
		this.bounds = new Bounds(this.width, this.height, this.position);
		this.inputs = new List();
		this.sprite = new Sprite(getGameData('sprites', args.sprite), this);
	}

	addInput(eventName, {callback = () => {}, key = false, scroll = false}) {
		this.world.viewports.eachItem((viewport) => {
			viewport.listener.addBody(this, eventName);
		});

		this.inputs.addItem({callback, scroll}, key);
	}

	hasInputKey(key, scroll = false) {
		const input = this.inputs.getItem(key);

		if( input && input.scroll == scroll ) {
			return input;
		}

		return {};
	}
}
