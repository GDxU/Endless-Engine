const List = require('./list');
const {getGameState} = require('./state');
const {getGameData} = require('../data/game-data');

const {LISTENER} = require('./constants');
const {
	MOUSE_DOWN,
	MOUSE_UP,
	MOUSE_WHEEL,
	MOUSE_MOVE,
	MOUSE_DRAG,
	KEY_DOWN,
	KEY_UP
} = LISTENER.EVENT_TYPES;
const BODY_LISTS = [
	"allBodies",
	"keyboardPressBodies",
	"keyboardUpBodies",
	"mouseClickBodies",
	"mouseUnclickBodies",
	"mouseDragBodies",
	"mouseMoveBodies",
	"mouseWheelBodies"
];

module.exports = class Listener {
	constructor(viewport) {
		this.viewport					= viewport;
		this.cursorVportPosition	= {x: 0, y: 0};
		this.mouseDown					= false;
		this.mouseButton				= false;
		this.direction					= false;
		this.enabled					= true;

		BODY_LISTS.forEach((listName) => {
			this[listName] = new List();
		});

		window.addEventListener(MOUSE_DOWN,		this.mouseDownInput.bind(this));
		window.addEventListener(MOUSE_UP,		this.mouseUpInput.bind(this));
		window.addEventListener(MOUSE_WHEEL,	this.mouseWheelInput.bind(this));
		window.addEventListener(MOUSE_MOVE,		this.mouseMove.bind(this));
		window.addEventListener(KEY_DOWN,		this.keyboardInput.bind(this));
		window.addEventListener(KEY_UP,			this.keyboardInput.bind(this));
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}

	static getMouseEventButton(e) {
		let button;

		switch(e.button) {
			case 0:
				button = "left";
				break;
			case 1:
				button = "wheel";
				break;
			case 2:
				button = "right";
				break;
			default:
				button = false;
				break;
		}

		return button;
	}

	mouseDownInput(e) {
		e.preventDefault();

		const mouseButton	= this.constructor.getMouseEventButton(e);

		this.mouseDown		= true;
		this.mouseButton	= mouseButton;
		this.direction		= false;

		this.triggerEvent(MOUSE_DOWN, {point: this.cursorVportPosition});
	}

	mouseUpInput(e) {
		e.preventDefault();

		const mouseButton	= this.constructor.getMouseEventButton(e);

		this.triggerEvent(MOUSE_UP, {point: this.cursorVportPosition});

		this.mouseButton	= false;
		this.mouseDown		= false;
		this.direction		= false;
	}

	mouseWheelInput(e) {
		e.preventDefault();

		const mouseButton	= this.constructor.getMouseEventButton(e);

		this.direction		= (e.deltaY > 0) ? "down" : "up";
		this.mouseButton	= "wheel";

		this.triggerEvent(MOUSE_WHEEL, {point: this.cursorVportPosition});
	}

	mouseMove(e) {
		this.updateCursorPosition(e);

		if( this.mouseDown ) {
			this.mouseDrag(this.cursorVportPosition);
		} else {
			//this.mouseButton = false;
		}

		this.triggerEvent(MOUSE_MOVE, {point: this.cursorVportPosition});
	}

	mouseDrag(point) {
		this.triggerEvent(MOUSE_DRAG, point);
	}

	keyboardInput(e) {
		const {key} = e;

		e.preventDefault();

		if( e.type == "keyup" ) {
			this.triggerEvent(KEY_UP, {key});
		} else if( e.type == "keydown" ) {
			this.triggerEvent(KEY_DOWN, {key});
		}
	}

	updateCursorPosition(e) {
		const point = {
			x:	e.pageX,
			y:	e.pageY
		};

		// Convert browser coordinates into viewport coordinates
		point.x -= getGameState('canvasPosition', 'x');
		point.y -= getGameState('canvasPosition', 'y');
		point.x -= this.viewport.position.x;
		point.y -= this.viewport.position.y;
		point.x += this.viewport.view.position.x;
		point.y += this.viewport.view.position.y;

		point.x /= getGameState('pixelRatio');
		point.y /= getGameState('pixelRatio');

		this.cursorVportPosition = point;
	}

	updateCursorFromScroll(xAdjust = 0, yAdjust = 0) {
		if( !this.mouseDown ) {
			return;
		}

		// BUG: needs to only trigger move event somehow.
		this.triggerEvent(MOUSE_DOWN, {point: this.cursorVportPosition, scroll: true});
	}

	createEventObject() {
		return {
			position: this.cursorVportPosition,
			mouseButton: this.mouseButton,
			mouseDown: this.mouseDown,
			direction: this.direction
		};
	}

	testKeyEvent(bodyList = new List(), key) {
		bodyList.eachItem((body) => {
			const {callback} = body.hasInputKey(key);

			if( callback ) {
				callback();
			}
		});
	}

	testMouseEvent(
		bodyList = new List(),
		{
			point = {x: 0, y: 0},
			scroll = false,
			keyless = false
		}
	) {
		let highestIndex = 0;
		let highestCallback = null;

		bodyList.eachItem((body) => {
			const {callback} = body.hasInputKey(this.mouseButton, scroll);

			if( keyless || callback ) {
				/*
				const zIndex = getGameData('layers')[box.layer]; // TODO: update this

				if( zIndex > highestIndex ) {
					if( body.bounds.encompass(point) ) {
						highestIndex		= zIndex;
						highestCallback	= callback;
					}
				}
				*/

				if( body.bounds.encompass(point) ) {
					highestIndex		= zIndex;
					highestCallback	= callback;
				}
			}
		});

		if( highestCallback ) {
			highestCallback( this.createEventObject() );
		}
	}

	triggerEvent(eventName, {point, scroll, key}) {
		if(this.enabled) {
			switch(eventName) {
				case MOUSE_DOWN:
					this.testMouseEvent(this.mouseClickBodies, {point, scroll});
					break;
				case MOUSE_UP:
					this.testMouseEvent(this.mouseUnclickBodies, {point});
					break;
				case MOUSE_WHEEL:
					this.testMouseEvent(this.mouseWheelBodies, {point, scroll});
					break;
				case MOUSE_MOVE:
					this.testMouseEvent(this.mouseMoveBodies, {point, keyless: true});
					break;
				case MOUSE_DRAG:
					this.testMouseEvent(this.mouseDragBodies, {point});
					break;
				case KEY_DOWN:
					this.testKeyEvent(this.keyboardPressBodies, key);
					break;
				case KEY_UP:
					this.testKeyEvent(this.keyboardUpBodies, key);
					break;
				default:
					break;
			}
		}
	}

	addBody(body, eventName) {
		this.allBodies.addItem(body, body.id);

		switch(eventName) {
			case MOUSE_DOWN:
				this.mouseClickBodies.addItem(body, body.id);
				break;
			case MOUSE_UP:
				this.mouseUnclickBodies.addItem(body, body.id);
				break;
			case MOUSE_WHEEL:
				this.mouseWheelBodies.addItem(body, body.id);
				break;
			case MOUSE_MOVE:
				this.mouseMoveBodies.addItem(body, body.id);
				break;
			case MOUSE_DRAG:
				this.mouseDragBodies.addItem(body, body.id);
				break;
			case KEY_DOWN:
				this.keyboardPressBodies.addItem(body, body.id);
				break;
			case KEY_UP:
				this.keyboardUpBodies.addItem(body, body.id);
				break;
			default:
				break;
		}
	}

	removeBody(body) {
		BODY_LISTS.forEach((listName) => {
			this[listName].removeItem(body.id);
		});
	}
};
