import koaSend from 'koa-send';
import ms from 'ms';
import { isString } from 'lodash';
import multimatch from 'multimatch';

export const ensureStaticRoot = function ensureStaticRoot(app, options) {
	return options.root || app.__staticRoot;
};

export const send = async function send(ctx, path, options = {}) {
	if (options.index !== false) {
		options.index = options.index || 'index.html';
	}

	const pattern = options.test || options.match;

	if (pattern && !multimatch(path, pattern).length) {
		return false;
	}

	const { maxAge = 0 } = options;
	return koaSend(ctx, path, {
		...options,
		root: ensureStaticRoot(ctx.app, options),
		gzip: false, // use `compress` middleware instead
		maxage: isString(maxAge) ? ms(maxAge) : maxAge * 1000,
	}).catch((err) => {
		if (err.status !== 404) {
			throw err;
		}
		return false;
	});
};
