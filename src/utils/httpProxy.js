
import httpProxy from 'http-proxy';
import { isFunction, isString } from 'lodash';
import url from 'url';

export default (options = {}, handleProxy) => {
	if (isString(options)) { options = { target: options }; }
	const { ssl, enable = true } = options;

	if (!enable) { return; }

	const proxy = httpProxy.createProxyServer({ ssl });

	const proxyMiddleware = async (ctx) => {
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
			const dest = target || forward;
			let host;
			if (isString(dest)) { host = url.parse(dest).host; }
			else { host = dest.host; }
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
