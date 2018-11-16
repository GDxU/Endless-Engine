const Bounds = require('../bounds');
const List = require('../list');
const Sprite = require('../sprite');
const {getGameData} = require('../../data/game-data');
const {incrementGameState} = require('../state');

module.exports = class Body {
	constructor(args) {
		//this.category
		//this.mask
		this.id = incrementGameState('lastBodyID');
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

	addMouseInput(eventName, {callback = () => {}, key = false, scroll = false}) {
		this.world.viewports.eachItem((viewport) => {
			if(viewport.mouseListener) {
				viewport.mouseListener.addBody(this, eventName);
			}
		});

		this.inputs.addItem({callback, scroll}, `${eventName}-${key}`);
	}

	addKeyInput(eventName, {callback = () => {}, key = false}) {
		this.world.viewports.eachItem((viewport) => {
			if(viewport.keyListener) {
				viewport.keyListener.addBody(this, eventName);
			}
		});

		this.inputs.addItem({callback, scroll}, `${eventName}-${key}`);
	}

	hasMouseInput(eventName, key, scroll = false) {
		const input = this.inputs.getItem(`${eventName}-${key}`);

		if( input && input.scroll == scroll ) {
			return input;
		}

		return {};
	}

	hasKeyInput(eventName, key) {
		const input = this.inputs.getItem(`${eventName}-${key}`);

		if(input) {
			return input;
		}

		return {};
	}

	/*
	addInput(eventName, {callback = () => {}, key = false, scroll = false}) {
		this.world.viewports.eachItem((viewport) => {
			viewport.listener.addBody(this, eventName);
		});

		this.inputs.addItem({callback, scroll}, `${eventName}-${key}`);
	}

	hasInputKey(eventName, key, scroll = false) {
		const input = this.inputs.getItem(`${eventName}-${key}`);

		if( input && input.scroll == scroll ) {
			return input;
		}

		return {};
	}
	*/
}
