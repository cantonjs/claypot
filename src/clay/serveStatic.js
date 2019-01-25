import { getLogger } from 'pot-logger';
import claypotConfig, { isProd } from '../config';
import { isString } from 'lodash';
import { resolve } from 'path';
import ms from 'ms';
import send from 'koa-send';
import multimatch from 'multimatch';

const defaultMaxAge = ms('1 year');

const { baseDir } = claypotConfig;

const getMaxAge = (maxAge, cacheHtmlFile, path) => {
	if (!cacheHtmlFile && path.endsWith('.html')) return 0;
	if (!maxAge && maxAge !== 0) return isProd ? defaultMaxAge : 0;
	return isString(maxAge) ? ms(maxAge) : maxAge;
};

export default (ctx) => {
	ctx.serveStatic = async function serveStatic(config) {
		const logger = getLogger('server');
		logger.debug('serve static', config);

		if (isString(config)) config = { dir: config };
		const { dir, match, maxAge, gzip, cacheHtmlFile, ...restOpts } = config;
		const root = resolve(baseDir, dir);

		dir && logger.debug('static directory', root);

		if (restOpts.index !== false) {
			restOpts.index = restOpts.index || 'index.html';
		}

		const { path, method } = ctx;
		if (
			(method === 'HEAD' || method === 'GET') &&
			(!match || multimatch(path, match).length)
		) {
			try {
				const maxage = getMaxAge(maxAge, cacheHtmlFile, path);
				return await send(ctx, path, {
					...restOpts,
					root,
					gzip: false, // use `compress` middleware instead
					maxage,
				});
			}
			catch (err) {
				if (err.status !== 404) {
					throw err;
				}
			}
		}
	};
};
