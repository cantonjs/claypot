
import httpProxy from 'http-proxy';
import { isFunction, isString } from 'lodash';
import url from 'url';
import config from '../config';
import getCertOption from './getCertOption';
import { appLogger } from '../utils/logger';

const ensureSSL = (ssl) => {
	if (ssl && ssl.cert && ssl.key) {
		const { root } = config;
		return {
			...ssl,
			...getCertOption(root, ssl.key, ssl.cert),
		};
	}
	return ssl;

};

export default (options = {}, handleProxy) => {
	if (isString(options)) { options = { target: options }; }
	const { ssl, enable = true, target, forward } = options;

	if (!enable) { return; }


	ensureSSL(ssl);

	const proxy = httpProxy.createProxyServer({ ssl });
	const dest = target || forward;

	const proxyMiddleware = async (ctx) => {
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
			let host;
			if (isString(dest)) { host = url.parse(dest).host; }
			else { host = dest.host; }
			try { proxyReq.setHeader('host', host); }
			catch (err) { appLogger.warn(err); }
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
