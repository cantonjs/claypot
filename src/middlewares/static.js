
import koaStatic from 'koa-static';
import config, { isProd } from '../config';
import { isString } from 'lodash';
import { resolve } from 'path';
import { getLogger } from 'pot-logger';

const maxAge = 31536000000; // 365 * 24 * 60 * 60 * 1000

export default function serveStatic(app, options) {
	const logger = getLogger('server');

	if (isString(options)) {
		options = { dir: options };
	}

	const { dir, ...other } = options;
	const staticDir = resolve(config.baseDir, dir);

	logger.debug('static directory', staticDir);

	return app.use(koaStatic(staticDir), {
		maxAge: isProd ? maxAge : 0,
		gzip: isProd,
		...other,
	});
};
