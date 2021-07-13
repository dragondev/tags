const fs = require('fs');
const { join } = require('path');
const scan = require('./scan.js');
const { createHash } = require('crypto');
const { tagTypes: { CHAR, TAG, NODUPE, DELETE }, listActions: { INCLUDE, EXCLUDE }, listTypes: { CHANNEL, USER, ROLE } } = require('./constants');

module.exports = class Parser {
	constructor() {
		this.tags = new Map();
		this.cache = new Set();
		this.loadAll(join(__dirname, 'tags'));
	}

	async parse(source, context) {
		let output = '';
		let nodupe = false;
		let del = false;

		let lists = {
			include: [],
			exclude: []
		};

		const tokens = scan(source);
		const runTag = node => {
			let name;
			let value;
			if (node.child) {
				name = node.text.split(':')[0];
				value = runTag(node.child);
			} else {
				[name, value] = node.text.split(':');
			}

			const tag = this.tags.get(name);
			value = value || '';
			if (!tag) return `{${name}:${value}}`;
			try {
				const parsedTag = tag.run({ value, ...context }) || '';
				if (!Array.isArray(parsedTag)) return parsedTag;

				const [action, ...target] = parsedTag;
				if (action === INCLUDE) lists.include.push(target);
				if (action === EXCLUDE) lists.exclude.push(target);
				if (action === NODUPE) nodupe = true;
				if (action === DELETE) del = true;
				return '';

			} catch (error) {
				return `An error occurred while executing the tag ${name}: \`${error}\``;
			}
		};

		for (const token of tokens) {
			if (token.type === CHAR) output += token.text;
			else if (token.type === TAG) output += await runTag(token);
		}


		if (lists.include.length) {
			let matched = false;

			for (const target of lists.include) {
				const [type, id] = target;
				switch (type) {
					case USER:
						if (context.user.id === id) matched = true;
						break;
					case CHANNEL:
						if (context.channel.id === id) matched = true;
						break;
					case ROLE:
						if (context.member.roles.cache.has(id)) matched = true;
						break;
				}
			}

			if (!matched) output = '';
		}
		else if (lists.exclude.length) {
			for (const target of lists.exclude) {
				const [type, id] = target;
				switch (type) {
					case USER:
						if (context.user.id === id) output = '';
						break;
					case CHANNEL:
						if (context.channel.id === id) output = '';
						break;
					case ROLE:
						if (context.member.roles.cache.has(id)) output = '';
						break;
				}
			}
		}

		if (del && (output?.length > 0)) {
			context.trigger.delete();
		}

		if (nodupe) {
			const hash = createHash('sha1').update(output).digest('base64');
			const key = `${context.user.id}.${context.channel.id}.${hash}`;
			if (this.cache.has(key)) output = '';
			else this.cache.add(key);
		}

		return output;
	}

	remove(...tags) {
		for (const name of tags) {
			const tag = this.tags.get(name);
			if (tag.aliases) {
				for (const alias of tag.aliases) this.tags.delete(alias);
			}
			this.tags.delete(name);
		}
	}

	loadAll(dir) {
		const files = fs.readdirSync(dir);
		for (const file of files) this.load(require(`${dir}/${file}`));
	}

	load(tag) {
		this.tags.set(tag.name, tag);
		if (tag.aliases) {
			for (const alias of tag.aliases) this.tags.set(alias, tag);
		}
	}
};
