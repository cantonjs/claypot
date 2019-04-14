import pathToRegExp from 'path-to-regexp';

const distPattern = /\$(\d+)|(?::(\w+))/g;

export default class Rewriter {
	constructor(src, dist) {
		const keys = [];
		this._dist = dist;
		this._reg = pathToRegExp(src, keys);
		this._keysMap = keys.reduce((map, key, index) => {
			map.set(key.name, index + 1);
			return map;
		}, new Map());
	}

	rewrite(url) {
		const matched = this._reg.exec(url);
		if (matched) {
			return this._dist.replace(distPattern, (_, n, name) => {
				if (name) return matched[this._keysMap.get(name)] || '';
				return matched[n] || '';
			});
		}
	}
}
