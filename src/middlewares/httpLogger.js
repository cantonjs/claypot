import { isDev } from '../config';
import { ensureLogger } from 'pot-logger';

const logger = ensureLogger('http', (ref) => {
	return !ref.daemon ?
		ref.defaultConsoleAppender :
		{
			type: 'dateFile',
			filename: 'access',
			pattern: '-dd.log',
			layout: {
				type: 'pattern',
				pattern: '[%d{ISO8601}] %m',
			},
		};
});

export default (app) => {
	return app.use(async function httpLogger(ctx, next) {
		const start = Date.now();

		await next();

		const { url, method } = ctx;
		const responseTime = `${Date.now() - start}ms`;

		if (isDev) {
			return logger.info(`${method} ${url} ${responseTime}`);
		}

		const { status, header, req } = ctx;
		const HTTPVersion = `HTTP/${req.httpVersionMajor}.${req.httpVersionMinor}`;
		const userAgent = header['user-agent'] || '-';
		const referer = header['referer'] || '-';
		const remoteAddress = header['x-forwarded-for'] || '-';

		/* eslint-disable max-len */
		logger.info(
			`${method} ${url} ${status} ${HTTPVersion} ${responseTime} ${referer} "${userAgent}" ${remoteAddress}`,
		);
	});
};
