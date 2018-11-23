require('./util/array');
require('./util/object');
const Body = require('./body/body');
const Bounds = require('./bounds');
const Canvas = require('./canvas');
const Collider = require('./collider');
//const EventEmitter = require('./event-emitter');
const List = require('./util/list');
const Renderer = require('./renderer');
const Viewport = require('./viewport/viewport');
const World = require('./world');
const loadImages = require('./image/loader');

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
			console.log('image loading complete');
		};

		loadImages(onComplete);

		// TEMPORARY
		const testBodyOne = new Body({
			x: 0,
			y: 0,
			height: 16,
			width: 16,
			sprite: 'test-sprite-1',
			layer: 'layer-1'
		});
		const testBodyTwo = new Body({
			x: 15,
			y: 15,
			height: 10,
			width: 10,
			sprite: 'test-sprite-2',
			layer: 'layer-2'
		});
		const testWorldOne = new World();
		const testViewportOne = new Viewport({
			x: 130,
			y: 80,
			width: 120,
			height: 120,
			view: {
				x: 0,
				y: 0
			},
			world: testWorldOne
		});
		const testViewportTwo = new Viewport({
			x: 310,
			y: 140,
			width: 170,
			height: 170,
			view: {
				x: 86,
				y: 30
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

		testWorldOne.addBodies(testBodyOne, testBodyTwo);

		this.viewports.addItem(testViewportOne);
		this.viewports.addItem(testViewportTwo);


		testBodyTwo.addMouseInput('mousemove', {callback: function(self, e) {
			//console.log('mouse moving', self, e);
		}});
		testBodyTwo.addKeyInput('keydown', {callback: function(self, key) {
			//console.log('pressed e', self, key);
		}, key: 'e'});
		testBodyTwo.addMouseInput('mousedown', {callback: function() {
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
		//thhis.worlds.getItems().forEach((world) => _collider.resolve(world));
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
