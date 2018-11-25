const Border = require('./border');
const Sprite = require('./sprite');
const Text = require('./text');

module.exports = class Display {
	constructor(args = {}, body) {
		this.border = args.border ? new Border(args.border, body) : false;
		this.sprite = args.sprite ? new Sprite(args.sprite, body) : false;
		this.text = args.text ? new Text(args.text, body) : false;
		this.layer = args.layer || '';
	}

	render(context, vportPosition, vportSize, vportViewBounds) {
		if(this.border) {
			this.border.render(context, vportPosition, vportSize, vportViewBounds);
		}

		if(this.sprite) {
			this.sprite.render(context, vportPosition, vportSize, vportViewBounds);
		}

		if(this.text) {
			this.text.render(context, vportPosition, vportSize, vportViewBounds);
		}
	}

	//updateText() {}
};
