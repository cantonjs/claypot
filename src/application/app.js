import Koa from 'koa';
import http from 'http';
import https from 'https';
import getCertOption from '../utils/getCertOption';
import koaMount from 'koa-mount';
import supertest from 'supertest';

const serversWeakMap = new WeakMap();

export class App extends Koa {
	constructor(config) {
		super();

		this.__config = config;
		this.__servers = [];
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
		if (!options.keepAlive) {
			// hack to close server after tested
			const getAddress = server.address.bind(server);
			server.address = () => {
				server.address = getAddress;
			};
		}
		return supertest(server);
	}
}

export const createApp = (config) => new App(config);
