const {COLLIDER} = require('./constants');

module.exports = class Collider {
	static getBodyPartitions(body) {
		const lower = {
			x: Math.floor(body.bounds[0].x / COLLIDER.PARTITION_SIZE),
			y: Math.floor(body.bounds[0].y / COLLIDER.PARTITION_SIZE)
		};
		const upper = {
			x: Math.floor(body.bounds[1].x / COLLIDER.PARTITION_SIZE),
			y: Math.floor(body.bounds[1].y / COLLIDER.PARTITION_SIZE)
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
			const partitions = this.constructor.getBodyPartitions(body);

			partitions.forEach((partition) => {
				const key = `${partition.x}${partition.y}`;

				if(!buckets[key]) {
					buckets[key] = [];
				}

				buckets[key].push(body);
			});
		});

		return buckets;
	}

	static resolvePartition(partition) {
		// check body pairs
	}

	resolve(world) {
		const partitions = this.constructor.getBuckets(world.getBodies());

		partitions.forEach((partition) => {
			this.constructor.resolvePartition(partition);
		});
	}
}
