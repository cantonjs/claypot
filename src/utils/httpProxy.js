
import httpProxy from 'http-proxy';
import Koa from 'koa';
import Router from 'koa-router';
import { isFunction, isString } from 'lodash';

export default (getOptions) => {
	const app = new Koa();
	const router = new Router();
	const proxy = httpProxy.createProxyServer({});

	router.all('*', async (ctx) => {
		var handleError;

		let options = isFunction(getOptions) ? getOptions(ctx) : getOptions;
		if (isString(options)) { options = { target: options }; }

		ctx.respond = false;
		ctx.status = 200; // prevent koa-error handling

		const removeListeners = () => {
			proxy.off('error', handleError);
			proxy.off('proxyRes', removeListeners);
		};

		handleError = (err) => {
			ctx.set('Content-Type', 'application/json');
			ctx.status = 500;

			ctx.res.end(JSON.stringify({
				message: err.message,
				code: err.code,
			}));

			removeListeners();
		};

		proxy.on('proxyRes', removeListeners);

		proxy.on('error', handleError);

		proxy.web(ctx.req, ctx.res, options);
	});

	return app.use(router.middleware());
};
