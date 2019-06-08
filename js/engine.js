require('./util/array');
require('./util/object');
const Body = require('./body/body');
const Canvas = require('./canvas');
const Collider = require('./collider');
//const EventEmitter = require('./event-emitter');
const List = require('./data-structures/list');
const Renderer = require('./renderer');
const Viewport = require('./viewport/viewport');
const World = require('./world');
const {decodeImages} = require('./image/converter');
//const loadImages = require('./image/loader');
const HexGrid = require('./data-structures/hex-grid');
const mapGenerator = require('./map-generator');
const MapInstantiator = require('./map-instantiator');

const {PATHS} = require('./constants');
const {getGameData} = require(`${PATHS.DATA_DIR}/game-data`);
const {incrementGameState, updateGameState} = require('./state');
const {randomFromTo} = require('./util/tools');

const TICK_ROLLOVER = 10000;

module.exports = class Engine {
	constructor() {
		this.canvas = new Canvas();
		this.collider = new Collider();
		this.renderer = new Renderer();
		this.viewports = new List();
		this.worlds = new List();
		this.killSwitch = false;

		const onComplete = () => {
			console.log('image loading complete'); // eslint-disable-line no-console
			this.start();
		};

		const mapData = mapGenerator.generate(500, 250);
		//const mapData = mapGenerator.generate(130, 130);

		decodeImages(onComplete);

		let highlightedElev = '-';

		const uiBodyOneData = {
			x: 10,
			y: 10,
			height: 45,
			width: 110,
			text: {
				font: 'thintel',
				color: 'white',
				content: [
					'Cell ID: 1$',
					'Elevation: 2$',
					'Terrain Type: 3$'
				],
				vars: {
					'1$': () => 'X',
					'2$': () => highlightedElev,
					'3$': () => 'Z'
				}
			},
			layer: 'layer-1',
			bitmask: 'ui'
		};
		const uiWorld = new World();
		this.worlds.addItem(uiWorld);
		uiWorld.addBodies(new Body(uiBodyOneData));
		this.addViewport('ui-test-viewport-1', uiWorld);

		// TEMPORARY
		const testBodyOne = new Body({
			x: -20,
			y: 26,
			height: 26,
			width: 26,
			velocity: {x: 0.4, y: 0},
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
			},
			bitmask: 'character'
		});
		const tetheredBodyOne = new Body({
			x: 50,
			y: 50,
			height: 10,
			width: 10,
			layer: 'layer-1',
			bitmask: 'ui'
		});
		const testBodyTwo = new Body({
			x: 197,
			y: 90,
			height: 30,
			width: 30,
			velocity: {x: -0.35, y: -0.25},
			sprite: 'test-sprite-2',
			layer: 'layer-2',
			bitmask: 'character'
		});
		const testBodyThree = new Body({
			x: 0,
			y: 104,
			height: 36,
			width: 80,
			text: {
				font: 'thintel',
				color: 'white',
				content: 'Lorem ipsum dolor phasellus bibendum mauris ut vivamus.'
			},
			layer: 'layer-2',
			bitmask: 'ui'
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
			layer: 'layer-2',
			bitmask: 'ui'
		});

		const testWorldOne = new World();

		// addWorld()
		// world.addBody()
		this.worlds.addItem(testWorldOne);

		testWorldOne.addBodies(testBodyOne, testBodyTwo, testBodyThree, testBodyFour, tetheredBodyOne);
		testBodyOne.tether(tetheredBodyOne, {x: 40, y: 5});
		this.addViewport('test-viewport-1', testWorldOne);
		this.addViewport('test-viewport-2', testWorldOne);

		const hexGridTest = new HexGrid(10, 10);
		hexGridTest.populate(60).setMetaRelationships();

		const mi = new MapInstantiator(mapData, testWorldOne); // viewport must be added before instantiation
		mi.update(0, 0);

		const testHexCellBodyData = {
			height: 12,
			width: 21,
			chamfer: 5,
			velocity: {x: 0, y: 0},
			sprite: 'test-orange-hex',
			layer: 'elev:0',
			bitmask: 'ui'
		};
		const testHexDepthBodyData = {
			height: 7,
			width: 21,
			velocity: {x: 0, y: 0},
			sprite: 'test-orange-hex-depth',
			layer: 'elev:0',
			bitmask: 'ui'
		};
		const testHexWaterBodyData = {
			height: 12,
			width: 21,
			velocity: {x: 0, y: 0},
			sprite: 'test-orange-hex-water',
			layer: `elev:${waterElev}`,
			bitmask: 'ui'
		};

		testBodyOne.addMouseInput('mousemove', {callback(self, e) {
			console.log('mouse moving 1');
		}});
		testBodyThree.addMouseInput('mousemove', {callback(self, e) {
			console.log('mouse moving 3');
		}});
		testBodyTwo.addKeyInput('keydown', {callback(self, key) {
			//console.log('pressed e', self, key);
		}, key: 'e'});
		testBodyTwo.addMouseInput('mousedown', {callback() {
			console.log('clicked body');
		}});
		const engine = this;
		testBodyThree.addKeyInput('keydown', {callback(self, key) {
			//console.log('pressed e', self, key);
			const vport = engine.viewports.getItem('test-viewport-2');
			vport.updateView({x: vport.view.position.x, y: vport.view.position.y + 1});
		}, key: 'e'});
		testBodyThree.addKeyInput('keydown', {callback(self, key) {
			//console.log('pressed e', self, key);
			const vport = engine.viewports.getItem('test-viewport-2');
			vport.updateView({x: vport.view.position.x, y: vport.view.position.y + 4});
		}, key: 'd'});

		//testViewportTwo.listener.disable();
	}

	addViewport(name, world) {
		const data = getGameData('viewports', name);

		data.world = world;

		this.viewports.addItem(new Viewport(data), name);
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
		this.worlds.getItems().forEach(world => this.collider.resolve(world));
	}

	tick() {
		// dispatch various events? depending on tick counter
			// Game.Events.dispatch("tick");
		this.resolvePositions();
		// this.tickBodies(); // tick sprites
		this.renderViewports();

		/*
		if( ++this.tickCounter >= TICK_ROLLOVER ) {
			this.tickCounter = 0;
		}
		*/

		if(incrementGameState('tickCounter') >= TICK_ROLLOVER) {
			updateGameState('tickCounter', 0);
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
