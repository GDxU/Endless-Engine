const tools = {};

tools.randomFromTo = (min, max) => {
	return (Math.random() * (max - min) ) + min;
};

module.exports = tools;
