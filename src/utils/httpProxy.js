
import EventEmitter from 'events';
import httpProxy from 'http-proxy';
import { isFunction, isString, isNumber, isObject } from 'lodash';
import url from 'url';
import qs from 'qs';
import getBody from 'raw-body';
import config from '../config';
import getCertOption from './getCertOption';
import koaContextCallbackify from '../utils/koaContextCallbackify';
// import { appLogger } from '../utils/logger';

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

const MayHasBodyMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

export default (options = {}, handleProxyContext) => {
	if (isString(options)) { options = { target: options }; }

	const {
		enable = true,
		query: queryModifier,
		contentType,
		...opts,
	} = options;

	if (!enable) { return; }

	const { ssl, target, forward } = opts;

	const isFormContent = contentType === 'application/x-www-form-urlencoded';
	const isJsonContent = contentType === 'application/json';

	ensureSSL(ssl);

	const requests = new WeakMap();
	const proxy = httpProxy.createProxyServer({ ssl });
	const dest = target || forward;

	let host;
	if (isString(dest)) { host = url.parse(dest).host; }
	else { host = dest.host; }

	const done = (proxyContext, res) => {
		if (!res.headersSent && res._getResponseTime) {
			const { key, value } = res._getResponseTime();
			res.setHeader(key, value);
		}

		if (proxyContext.done) { proxyContext.done(); }
		requests.delete(res);
	};

	proxy.on('proxyReqWs', (proxyReq, req, res) => {
		if (requests.has(res)) {
			const proxyContext = requests.get(res);
			proxyContext.emit('proxyReqWs', proxyReq, req, res);
		}
	});

	proxy.on('proxyReq', (proxyReq, req, res) => {
		if (!res.headersSent) {
			proxyReq.setHeader('host', host);

			if (isJsonContent || isFormContent) {
				proxyReq.setHeader('Content-Type', contentType);
			}

			if (req._transformedBody) {
				const body = req._transformedBody;
				proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
				proxyReq.write(body);
			}
		}

		if (requests.has(res)) {
			const proxyContext = requests.get(res);
			proxyContext.emit('proxyReq', proxyReq, req, res);
		}
	});

	proxy.on('proxyRes', (proxyRes, req, res) => {
		if (requests.has(res)) {
			const proxyContext = requests.get(res);
			proxyContext.emit('proxyRes', proxyRes, req, res);
			done(proxyContext, res);
		}
	});

	proxy.on('error', (err, req, res) => {
		if (requests.has(res)) {
			const proxyContext = requests.get(res);

			if (!res.headersSent) {
				res.setHeader('Content-Type', 'application/json');
				res.statusCode = isNumber(err.status) ? err.status : 500;
				res.statusMessage = err.message || 'Internal Server Error';
			}

			proxyContext.emit('error', err, req, res);
			done(proxyContext, res);
		}
	});

	const modifyQuery = (ctx) => {
		if (!queryModifier) { return; }

		const urlObject = url.parse(ctx.req.url);
		let query = qs.parse(urlObject.query);
		let queryAlt = queryModifier;

		if (isFunction(queryAlt)) {
			query = queryAlt(query, ctx);
		}
		else {
			if (isString(queryAlt)) {
				queryAlt = qs.parse(queryAlt);
			}

			if (isObject(queryAlt)) {
				Object.assign(query, queryAlt);
			}
		}

		if (isObject(query)) { query = qs.stringify(query); }

		Reflect.deleteProperty(urlObject, 'search');
		Reflect.deleteProperty(urlObject, 'query');
		urlObject.query = query;
		if (query) { urlObject.search = `?${query}`; }

		ctx.req.url = url.format(urlObject);
	};

	const maybeTransformBody = async (ctx) => {
		if (!isFormContent && !isJsonContent) { return; }

		const originContentType = ctx.get('Content-Type');
		if (contentType === originContentType) { return; }

		if (!MayHasBodyMethods.includes(ctx.method.toUpperCase())) { return; }

		let body = await getBody(ctx.req);

		if (isFormContent) {
			body = qs.stringify(JSON.parse(body.toString()));
		}
		else if (isJsonContent) {
			body = JSON.stringify(qs.parse(body.toString()));
		}

		ctx.req._transformedBody = body;
	};

	const proxyMiddleware = async (ctx) => {

		await maybeTransformBody(ctx);

		modifyQuery(ctx);
		koaContextCallbackify(ctx);

		proxy.web(ctx.req, ctx.res, opts);

		await new Promise((resolve) => {
			var proxyContext = new EventEmitter();
			proxyContext.done = resolve;
			if (isFunction(handleProxyContext)) {
				handleProxyContext(proxyContext);
			}
			requests.set(ctx.res, proxyContext);
		});
	};

	return proxyMiddleware;
};
