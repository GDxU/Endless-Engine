const Bounds = require('./bounds');
const {COLLIDER: {PARTITION_SIZE, EDGE_BUFFER}} = require('./constants');

module.exports = class Collider {
	constructor() {
		this.moveable = {};
		this.blocked = {};
	}

	static getBodyPartitions(body) {
		const [boundA, boundB] = body.bounds.aabb;
		const lower = {
			x: Math.floor((boundA.x - EDGE_BUFFER) / PARTITION_SIZE),
			y: Math.floor((boundA.y - EDGE_BUFFER) / PARTITION_SIZE)
		};
		const upper = {
			x: Math.floor((boundB.x + EDGE_BUFFER) / PARTITION_SIZE),
			y: Math.floor((boundB.y + EDGE_BUFFER) / PARTITION_SIZE)
		};

		const partitions = [lower];

		if(lower.x != upper.x) {
			partitions.push({x: upper.x, y: lower.y});
		}
		if(lower.y != upper.y) {
			partitions.push({x: lower.x, y: upper.y});
		}
		if(lower.x != upper.x && lower.y != upper.y) {
			partitions.push(upper);
		}

		return partitions;
	}

	static getBuckets(bodies) {
		const buckets = {};

		bodies.forEach((body) => {
			const partitions = this.getBodyPartitions(body);

			partitions.forEach(({x, y}) => {
				const key = `${x}-${y}`;

				if(!buckets[key]) {
					buckets[key] = [];
				}

				buckets[key].push(body);
			});
		});

		return buckets;
	}

	static resolveBody(body, blocker) {
		if(!body.velocity.x && !body.velocity.y) {
			return;
		}
		if(!blocker) {
			body.position.x += body.velocity.x;
			body.position.y += body.velocity.y;
			body.bounds.update({width: body.width, height: body.height, x: Math.floor(body.position.x), y: Math.floor(body.position.y)});
		} else {
			// push A closer to B, or B closer to A depending on non-zero velocities
			// inform each body of collision event
		}
	}

	resolvePartition(bodies) {
		if(bodies.length == 1) {
			const [body] = bodies;

			if(!this.blocked[`${body.id}`]) {
				this.moveable[`${body.id}`] = body;
			}
		} else {
			for(let a = 0; a < bodies.length; a++) {
				const bodyA = bodies[a];
				const newBodyAPosition = {
					x: bodyA.position.x + bodyA.velocity.x,
					y: bodyA.position.y + bodyA.velocity.y
				};
				const newBodyABounds = new Bounds(bodyA.width, bodyA.height, newBodyAPosition);
				let clear = true;

				if(bodies[a + 1]) {
					bodyLoopB:
					for(let b = a + 1; b < bodies.length; b++) {
						const bodyB = bodies[b];
						const newBodyBPosition = {
							x: bodyB.position.x + bodyB.velocity.x,
							y: bodyB.position.y + bodyB.velocity.y
						};

						if(!bodyA.velocity.x && !bodyA.velocity.y && !bodyB.velocity.x && !bodyB.velocity.y) {
							continue bodyLoopB;
						}

						const newBodyBBounds = new Bounds(bodyB.width, bodyB.height, newBodyBPosition);

						if(newBodyABounds.intersect(newBodyBBounds)) {
							clear = false;
							this.blocked[`${bodyA.id}`] = bodyA;
							this.blocked[`${bodyB.id}`] = bodyB;

							if(this.moveable[`${bodyA.id}`]) {
								delete this.moveable[`${bodyA.id}`];
							}
							if(this.moveable[`${bodyB.id}`]) {
								delete this.moveable[`${bodyB.id}`];
							}
						}
					}
				}
				if(clear) {
					if(!this.blocked[`${bodyA.id}`]) {
						this.moveable[`${bodyA.id}`] = bodyA;
					}
				}
			}
		}
	}

	resolve(world) {
		const partitions = this.constructor.getBuckets(world.getBodies());

		for(const i in partitions) {
			this.resolvePartition(partitions[i]);
		}

		Object.values(this.moveable).forEach(body => {
			this.constructor.resolveBody(body);
		});
		Object.values(this.blocked).forEach(body => {
			//this.constructor.resolveBody(body);
		});

		this.moveable = {};
		this.blocked = {};
	}
}
