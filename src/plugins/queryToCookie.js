
import Koa from 'koa';
import Router from 'koa-router';
import url from 'url';
import qs from 'qs';
import { isFunction } from 'lodash';

export default (getOptions) => {
	const app = new Koa();
	const router = new Router();

	router.get('*', async (ctx, next) => {
		const options = isFunction(getOptions) ? getOptions(ctx) : getOptions;

		const {
			keys = [
				'access_token',
			],
		} = options;

		const {
			request: { query, originalUrl },
			cookies,
		} = ctx;

		const { matchedKeys, map } = keys
			.filter((key) => query[key])
			.reduce((result, key) => {
				result.map = { ...result.map, [key]: query[key] };
				result.matchedKeys.push(key);
				return result;
			}, { map: {}, matchedKeys: [] })
		;

		if (!matchedKeys.length) {
			return await next();
		}

		const {
			cookiePrefix = '',
			cookieSuffix = '',
			path = '/',
			domain,
			expiresInKey = 'expires_in',
			expiresAtKey = 'expires_at',
			parseExpiresIn,
			parseExpiresAt,
			defaultExpiresIn = 720, // (s) defaults to 2 hours
		} = options;

		let expires;

		if (query[expiresAtKey]) {
			if (isFunction(parseExpiresAt)) {
				expires = parseExpiresAt(query[expiresAtKey]);
			}
			else {

				// TODO: use padEnd() instead
				const expiresAt = query[expiresAtKey] * 1000;

				delete query[expiresAtKey];
				expires = new Date(expiresAt);
			}
		}
		else {
			const expiresInFromQuery = query[expiresInKey];

			if (expiresInFromQuery && isFunction(parseExpiresIn)) {
				expires = parseExpiresIn(expiresInFromQuery);
			}
			else {
				const expiresIn = expiresInFromQuery || defaultExpiresIn;
				const delta = expiresIn * 1000;
				const now = Date.now();
				delete query[expiresInKey];
				expires = new Date(now + delta);
			}
		}

		matchedKeys.forEach((key) => {
			const value = map[key];
			delete query[key];
			cookies.set(cookiePrefix + key + cookieSuffix, value, {
				httpOnly: false,
				path,
				domain,
				expires,
			});
		});

		const { pathname } = url.parse(originalUrl);
		const queryStr = qs.stringify(query);
		const redirectUrl = pathname + (queryStr ? `?${queryStr}` : '');
		ctx.redirect(redirectUrl);
	});

	return app.use(router.middleware());
};
