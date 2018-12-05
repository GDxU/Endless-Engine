const {COLLIDER: {PARTITION_SIZE, EDGE_BUFFER}} = require('./constants');

module.exports = class Collider {
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

	static resolveBody(body, blockage, blocker) {
		if(!blockage) {
			body.position.x += body.velocity.x;
			body.position.y += body.velocity.y;
			body.bounds.update({width: body.width, height: body.height, x: Math.floor(body.position.x), y: Math.floor(body.position.y)});
		} else {
			// push body close to blocker and inform each of collision event
		}
	}

	static resolvePartition(bodies) {
		if(bodies.length == 1) {
			this.resolveBody(bodies[0]);
		} else {
			for(let a = 0; a < bodies.length; a++) {
				const bodyA = bodies[a];

				if(bodies[a + 1]) {
					for(let b = a + 1; b < bodies.length; b++) {
						const bodyB = bodies[b];

						// compare bodyA and bodyB for potential collisions
					}
				}
			}
		}
	}

	resolve(world) {
		const partitions = this.constructor.getBuckets(world.getBodies());

		for(const i in partitions) {
			//console.log(i, partitions[i]);
			this.constructor.resolvePartition(partitions[i]);
		}
	}
}
