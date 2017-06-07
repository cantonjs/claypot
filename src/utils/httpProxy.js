
import httpProxy from 'http-proxy';
import { isFunction, isString } from 'lodash';
import url from 'url';

export default (getOptions, handleProxy) => {
	const proxy = httpProxy.createProxyServer({});

	const proxyMiddleware = async (ctx) => {
		let options = isFunction(getOptions) ? getOptions(ctx) : getOptions;
		if (isString(options)) { options = { target: options }; }

		const { target, forward } = options;

		ctx.respond = false;
		ctx.status = 200; // prevent koa-error handling

		const removeListeners = () => {
			proxy.off('error');
			proxy.off('upgrade');
			proxy.off('proxyRes');
			proxy.off('proxyReq');
			proxy.off('proxyReqWs');
			proxy.off('open');
			proxy.off('close');
		};

		proxy.on('proxyReq', (proxyReq, req) => {
			const { host } = url.parse(target || forward);
			proxyReq.setHeader('host', host);
		});


		proxy.on('error', (err) => {
			ctx.set('Content-Type', 'application/json');
			ctx.status = 500;

			ctx.res.end(JSON.stringify({
				message: err.message,
				code: err.code,
			}));

			removeListeners();
		});

		proxy.on('proxyRes', removeListeners);

		if (isFunction(handleProxy)) { handleProxy(proxy); }

		proxy.web(ctx.req, ctx.res, options);
	};

	return proxyMiddleware;
};
