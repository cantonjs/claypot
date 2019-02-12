/* NOTE: this module is highly inspired by https://github.com/koajs/rewrite */

import pathToRegExp from 'path-to-regexp';
import { ensureLogger } from 'pot-logger';

const distPattern = /\$(\d+)|(?::(\w+))/g;

const toMap = function toMap(params) {
	return params.reduce((map, param, index) => {
		param.index = index;
		map[param.name] = param;
		return map;
	}, {});
};

export default function rewrites(app, rules) {
	const logger = ensureLogger('rewrite');

	if (Array.isArray(rules)) {
		const [src, dist] = rules;
		rules = { [src]: dist };
	}
	for (const src in rules) {
		if (!rules.hasOwnProperty(src)) continue;
		const dist = rules[src];
		if (!dist) continue;
		app.use(async (ctx, next) => {
			const keys = [];
			const reg = pathToRegExp(src, keys);
			const map = toMap(keys);
			const { url } = ctx;
			const matched = reg.exec(url);
			if (matched) {
				ctx.url = dist.replace(distPattern, (_, n, name) => {
					if (name) return matched[map[name].index + 1] || '';
					return matched[n] || '';
				});
				logger.debug(`${url} -> ${ctx.url}`);
				ctx.rewriteOriginalURL = url;
			}
			await next();
			if (ctx.rewriteOriginalURL) {
				ctx.url = url;
			}
		});
	}
}
