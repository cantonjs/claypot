import Koa from 'koa';
import http from 'http';
import https from 'https';
import getCertOption from '../utils/getCertOption';

const init = function init(app, config) {
	app.__config = config;
	app.__servers = [];
};

const registerServe = function registerServe(app) {
	app.serve = async function serve(...options) {
		const newServers = options.map((option) => {
			const { port, host, tls } = option;
			let server;
			if (tls) {
				const { key, cert } = tls;
				if (key && cert) {
					const certOptions = getCertOption(key, cert);
					server = https.createServer(certOptions, app.callback());
				}
			}
			if (!server) {
				server = http.createServer(app.callback());
			}
			return { server, port, host };
		});
		app.__servers.push(...newServers);
		return Promise.all(
			newServers.map(
				({ server, port, host }) =>
					new Promise((resolve, reject) => {
						server.once('error', reject);
						const args = [port, host, resolve].filter(Boolean);
						server.listen(...args);
					}),
			),
		);
	};
};

const registerClose = function registerClose(app) {
	app.close = async () => {
		const res = await Promise.all(
			app.__servers.map(
				({ server }) =>
					new Promise((resolve, reject) => {
						server.close((err) => {
							if (err) reject(err);
							else resolve();
						});
					}),
			),
		);
		app.__servers = [];
		return res;
	};
};

export function createApplication(config) {
	const app = new Koa();
	init(app, config);
	registerServe(app);
	registerClose(app);
	return app;
}
