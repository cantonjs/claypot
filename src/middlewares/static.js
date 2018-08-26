import koaStatic from 'koa-static';
import config, { isProd } from '../config';
import { isString, isObject } from 'lodash';
import { resolve } from 'path';
import { getLogger } from 'pot-logger';
import ms from 'ms';
import send from 'koa-send';

const defaultMaxAge = ms('1 year');

const parseMaxAge = function parseMaxAge(maxAge) {
	const ensureMaxAgeValue = function ensureMaxAgeValue(maxAge) {
		if (!maxAge && maxAge !== 0) return isProd ? defaultMaxAge : 0;
		else if (isString(maxAge)) return ms(maxAge);
		return maxAge;
	};

	if (isObject(maxAge)) {
		const files = Object.keys(maxAge).reduce(
			(acc, key) => {
				acc[key] = ensureMaxAgeValue(maxAge[key]);
				return acc;
			},
			{ '*': ensureMaxAgeValue() },
		);
		const rest = files['*'];
		Reflect.deleteProperty(files, '*');
		return { rest, files };
	}
	return { files: {}, rest: ensureMaxAgeValue(maxAge) };
};

export default function serveStatic(app, options) {
	const logger = getLogger('server');
	const middlewares = [];

	middlewares.keyName = 'static';

	const push = (staticConfig) => {
		if (isString(staticConfig)) staticConfig = { dir: staticConfig };
		const { dir, maxAge, gzip, ...other } = staticConfig;
		const staticRoot = resolve(config.baseDir, dir);
		const { files, rest } = parseMaxAge(maxAge);

		logger.debug('static directory', staticRoot);

		const filePaths = Object.keys(files);

		if (filePaths.length) {
			middlewares.push(async function sendFiles(ctx, next) {
				let done = false;
				const { path } = ctx;
				if (
					(ctx.method === 'HEAD' || ctx.method === 'GET') &&
					filePaths.includes(path)
				) {
					try {
						done = await send(ctx, path, {
							root: staticRoot,
							...other,
							gzip: false, // use `compress` middleware instead
							maxage: files[path],
						});
					}
					catch (err) {
						if (err.status !== 404) {
							throw err;
						}
					}
				}

				if (!done) await next();
			});
		}

		middlewares.push(
			koaStatic(staticRoot, {
				maxAge: rest,
				...other,
				gzip: false, // use `compress` middleware instead
			}),
		);
	};

	if (Array.isArray(options)) {
		options.forEach(push);
	}
	else push(options);

	app.use(middlewares);
}
