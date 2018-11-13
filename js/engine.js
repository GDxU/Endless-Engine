require('./util/array');
require('./util/object');
const Body = require('./body/body');
const Bounds = require('./bounds');
const Canvas = require('./canvas');
const Collider = require('./collider');
//const EventEmitter = require('./event-emitter');
const List = require('./list');
const Listener = require('./listener');
const Renderer = require('./renderer');
const Viewport = require('./viewport');
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

		// TEMPORARY
		const testBodyOne = new Body({
			x: 0,
			y: 0,
			height: 10,
			width: 10
		});
		const testBodyTwo = new Body({
			x: 15,
			y: 15,
			height: 10,
			width: 10
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
				x: 88,
				y: 30
			},
			world: testWorldOne
		});

		// addWorld()
		// world.addBody()
		this.worlds.addItem(testWorldOne);

		testWorldOne.addBodies(testBodyOne, testBodyTwo);

		this.viewports.addItem(testViewportOne);
		this.viewports.addItem(testViewportTwo);


		testBodyTwo.addInput('mousemove', {callback: function() {
			console.log('hovered body two');
		}});
		testBodyTwo.addInput('keydown', {callback: function() {
			console.log('pressed e');
		}, key: 'e'});

		//testViewportTwo.listener.disable();
	}

	addViewport() {

	}

	removeViewport() {

	}

	addWorld() {

	}

	removeWorld() {

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
		// this.tickBodies();
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
