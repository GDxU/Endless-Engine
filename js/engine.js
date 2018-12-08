require('./util/array');
require('./util/object');
const Body = require('./body/body');
const Canvas = require('./canvas');
const Collider = require('./collider');
//const EventEmitter = require('./event-emitter');
const List = require('./util/list');
const Renderer = require('./renderer');
const Viewport = require('./viewport/viewport');
const World = require('./world');
const {decodeImages} = require('./image/converter');
//const loadImages = require('./image/loader');

const {PATHS} = require('./constants');
const {getGameData} = require(`${PATHS.DATA_DIR}/game-data`);

const TICK_ROLLOVER = 10000;

module.exports = class Engine {
	constructor() {
		this.canvas = new Canvas();
		this.collider = new Collider();
		this.renderer = new Renderer();
		this.viewports = new List();
		this.worlds = new List();
		this.tickCounter = 0;
		this.killSwitch = false;

		const onComplete = () => {
			console.log('image loading complete'); // eslint-disable-line no-console
			this.start();
		};

		decodeImages(onComplete);

		// TEMPORARY
		const testBodyOne = new Body({
			x: -20,
			y: 26,
			height: 26,
			width: 26,
			velocity: {x: 0.5, y: 0},
			sprite: 'test-sprite-1',
			layer: 'layer-1',
			text: {
				font: 'thintel',
				color: 'white',
				content: 'aa1$ bb2$ cc dd',
				vars: {
					'1$': () => 'X',
					'2$': () => 'Y'
				}
			}
		});
		const testBodyTwo = new Body({
			x: 197,
			y: 90,
			height: 30,
			width: 30,
			velocity: {x: -0.35, y: -0.25},
			sprite: 'test-sprite-2',
			layer: 'layer-2'
		});
		const testBodyThree = new Body({
			x: 0,
			y: 0,
			height: 36,
			width: 80,
			text: {
				font: 'thintel',
				color: 'white',
				content: 'Lorem ipsum dolor.'
			},
			layer: 'layer-2'
		});
		const testBodyFour = new Body({
			x: 40,
			y: 160,
			height: 20,
			width: 20,
			velocity: {x: 0.5, y: -0.75},
			text: {
				font: 'thintel',
				color: 'white',
				content: 'Lorem ipsum dolor.'
			},
			layer: 'layer-2'
		});
		const testWorldOne = new World();
		const testViewportOne = new Viewport({
			x: 10,
			y: 20,
			width: 100,
			height: 100,
			view: {
				x: 0,
				y: 30
			},
			world: testWorldOne
		});
		const testViewportTwo = new Viewport({
			x: 250,
			y: 70,
			width: 170,
			height: 170,
			view: {
				x: 40,
				y: 10
			},
			world: testWorldOne,
			listeners: {
				key: false,
				mouse: true
			}
		});

		// addWorld()
		// world.addBody()
		this.worlds.addItem(testWorldOne);

		testWorldOne.addBodies(testBodyOne, testBodyTwo, testBodyFour);

		this.viewports.addItem(testViewportOne);
		this.viewports.addItem(testViewportTwo);


		testBodyTwo.addMouseInput('mousemove', {callback(self, e) {
			//console.log('mouse moving', self, e);
		}});
		testBodyTwo.addKeyInput('keydown', {callback(self, key) {
			//console.log('pressed e', self, key);
		}, key: 'e'});
		testBodyTwo.addMouseInput('mousedown', {callback() {
			console.log('clicked body');
		}, key: 'left'});

		//testViewportTwo.listener.disable();
	}

	addViewport(name, world) {
		// get viewport Data
		// add into viewports list
	}

	removeViewport(name) {
		this.viewports.removeItem(name);
	}

	addWorld(name) {
		// get world Data (from database?)
	}

	removeWorld(name) {
		//this.worlds.viewport.eachItem()
		this.worlds.removeItem(name);
	}

	renderViewports() {
		const vports = this.viewports.getItems();

		vports.sort((a, b) => {
			if(a.layer < b.layer) {
				return -1;
			} else if(a.layer > b.layer) {
				return 1;
			}

			return 0;
		});

		this.renderer.render(this.canvas, vports);
	}

	resolvePositions() {
		this.worlds.getItems().forEach((world) => this.collider.resolve(world));
	}

	tick() {
		// dispatch various events? depending on tick counter
			// Game.Events.dispatch("tick");
		this.resolvePositions();
		// this.tickBodies(); // tick sprites
		this.renderViewports();

		if( ++this.tickCounter >= TICK_ROLLOVER ) {
			this.tickCounter = 0;
		}

		if(!this.killSwitch) {
			window.requestAnimationFrame(this.tick);
		}
	}

	start() {
		this.tick = this.tick.bind(this);

		this.tick();
	}

	stop() {
		this.killSwitch = true;
	}
};
