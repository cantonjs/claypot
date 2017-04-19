
import { isProd } from '../config';
import { httpLogger } from '../utils/logger';

export default (app) => app.use(async (ctx, next) => {
	const start = Date.now();

	await next();

	const { url, method } = ctx;
	const responseTime = `${Date.now() - start}ms`;

	if (isProd) {
		const { status, header, req } = ctx;
		const HTTPVersion = `HTTP/${req.httpVersionMajor}.${req.httpVersionMinor}`;
		const userAgent = header['user-agent'] || '-';
		const referer = header['referer'] || '-';
		const remoteAddress = header['x-forwarded-for'] || '-';

		/* eslint-disable */
		httpLogger.info(
			`${method} ${url} ${status} ${HTTPVersion} ${responseTime} ${referer} "${userAgent}" ${remoteAddress}`
		);
		/* eslint-enable */
	}
	else {
		httpLogger.info(`${method} ${url} ${responseTime}`);
	}
});
