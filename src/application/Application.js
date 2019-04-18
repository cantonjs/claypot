import Koa from 'koa';
import http from 'http';
import https from 'https';
import methods from 'methods';
import getCertOption from '../utils/getCertOption';
import { ensureStaticRoot } from '../utils/sendFile';
import koaMount from 'koa-mount';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import supertest from 'supertest';
import { isString } from 'lodash';
import withRouter from './withRouter';
import extendContext from './extendContext';
import Rewriter from './Rewriter';

const serversWeakMap = new WeakMap();

@withRouter
export default class App extends Koa {
	constructor() {
		super();
		this.__servers = [];
		this.__staticRoot = process.cwd();
		this.use(extendContext);
	}

	setStaticRoot(staticRoot) {
		this.__staticRoot = staticRoot;
		return this;
	}

	async serve(...options) {
		const newServers = options.map((option) => {
			const { port, host, tls } = option;
			let server;
			if (tls) {
				const { key, cert } = tls;
				if (key && cert) {
					const certOptions = getCertOption(key, cert);
					server = https.createServer(certOptions, super.callback());
				}
			}
			if (!server) {
				server = http.createServer(super.callback());
			}
			serversWeakMap.set(server, { port, host });
			return server;
		});
		this.__servers.push(...newServers);
		return Promise.all(
			newServers.map(
				(server) =>
					new Promise((resolve, reject) => {
						const serverConfig = serversWeakMap.get(server);
						if (!serverConfig) reject(new Error('fail to get server config'));
						const { port, host } = serverConfig;
						server.once('error', reject);
						const args = [port, host, resolve].filter(Boolean);
						server.listen(...args);
					}),
			),
		);
	}

	async close() {
		const res = await Promise.all(
			this.__servers.map(
				(server) =>
					new Promise((resolve, reject) => {
						server.close((err) => {
							if (err) reject(err);
							else resolve();
						});
					}),
			),
		);
		this.__servers = [];
		return res;
	}

	mount(path, ...args) {
		const middleware = koaMount(path, ...args);
		middleware.keyName = `mount("${path}")`;
		return this.use(middleware);
	}

	test(options = {}) {
		const servers = this.__servers;
		let server;
		if (servers.length) server = servers[0];
		else {
			server = super.listen();
			servers.push(server);
		}
		const testServer = supertest(server);
		if (options.keepAlive) return testServer;

		// hack to close server after tested
		return new Proxy(testServer, {
			...Reflect,
			get(target, prop) {
				const val = target[prop];
				if (methods.includes(prop)) {
					return (...args) => {
						const test = val(...args);
						if (!test._server) {
							if (!server._handle) server._handle = true;
							test._server = server;
						}
						return test;
					};
				}
				return val;
			},
		});
	}

	static(config = {}, logger) {
		if (isString(config)) config = { root: config };
		const { rules = [], ...restOpts } = config;

		logger && logger.trace('static', restOpts);

		if (!Array.isArray(rules)) {
			logger &&
				logger.error(
					'expected servieStatic option "rules" to be an array,',
					`but received "${typeof rules}"`,
				);
			return this;
		}

		const rulesOpts = rules.map((opt) => ({
			...restOpts,
			isEnabled: true,
			...opt,
		}));

		const list = [...rulesOpts, restOpts].filter((options) => {
			const isEnabled = options && options.isEnabled !== false;
			if (isEnabled && logger) {
				const staticRoot = ensureStaticRoot(this, options);
				logger.debug('static directory', staticRoot);
			}
			return isEnabled;
		});

		if (!list.length) return this;

		return this.use(async (ctx, next) => {
			const { path, method } = ctx;
			if (method !== 'HEAD' && method !== 'GET') return next();

			for (const options of list) {
				const done = await ctx.sendFile(path, options);
				if (done) return;
			}
			return next();
		});
	}

	rewrite(src, dist, logger) {
		const rewriter = new Rewriter(src, dist);
		return this.use(async (ctx, next) => {
			const { url } = ctx;
			const rewritedURL = rewriter.rewrite(url);
			if (rewritedURL) {
				ctx.url = rewritedURL;
				logger && logger.debug(`${url} -> ${ctx.url}`);
				ctx.rewriteOriginalURL = url;
			}
			await next();
			if (ctx.rewriteOriginalURL) ctx.url = url;
		});
	}

	bodyParser(options) {
		return this.use(bodyParser(options));
	}

	cors(options) {
		return this.use(cors(options));
	}
}
