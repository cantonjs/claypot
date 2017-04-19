
import httpProxy from 'http-proxy';
import Koa from 'koa';
import Router from 'koa-router';
import { isFunction } from 'lodash';

export default (getOptions) => {
	const app = new Koa();
	const router = new Router();
	const proxy = httpProxy.createProxyServer({});

	router.all('*', function * () {
		var handleError;

		const options = isFunction(getOptions) ? getOptions(this) : getOptions;

		this.respond = false;
		this.status = 200; // prevent koa-error handling

		const removeListeners = () => {
			proxy.off('error', handleError);
			proxy.off('proxyRes', removeListeners);
		};

		handleError = (err) => {
			this.set('Content-Type', 'application/json');
			this.status = 500;

			this.res.end(JSON.stringify({
				message: err.message,
				code: err.code,
			}));

			removeListeners();
		};

		proxy.on('proxyRes', removeListeners);

		proxy.on('error', handleError);

		proxy.web(this.req, this.res, options);
	});

	return app.use(router.middleware());
};
