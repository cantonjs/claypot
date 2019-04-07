import send from 'koa-send';
import ms from 'ms';
import { isString } from 'lodash';
import multimatch from 'multimatch';

export default async function sendFile(ctx, path, options = {}) {
	if (options.index !== false) {
		options.index = options.index || 'index.html';
	}

	const pattern = options.test || options.match;

	if (pattern && !multimatch(path, pattern).length) {
		return false;
	}

	return send(ctx, path, {
		...options,
		gzip: false, // use `compress` middleware instead
		maxage: (maxAge) => (isString(maxAge) ? ms(maxAge) : maxAge || 0),
	}).catch((err) => {
		if (err.status !== 404) {
			throw err;
		}
		return false;
	});
}
