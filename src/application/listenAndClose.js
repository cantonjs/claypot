import http from 'http';
import https from 'https';
import getCertOption from '../utils/getCertOption';

function listenToServer(netServer, port, host) {
	return new Promise((resolve, reject) => {
		netServer.once('error', reject);
		const args = [port, host, resolve].filter(Boolean);
		netServer.listen(...args);
	});
}

function closeServer(netServer) {
	return new Promise((resolve, reject) => {
		netServer.close((err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}

export default function listenAndClose(app) {
	const { baseDir, port, host, ssl } = app.__config;
	app.koaListen = app.listen.bind(app);
	app.listen = async function listen() {
		const servers = [http.createServer(app.callback())];
		const listens = [listenToServer(servers[0], port, host)];

		if (ssl && ssl.enable !== false) {
			const { port: httpsPort, key, cert } = ssl;
			const options = getCertOption(baseDir, key, cert);
			const httpsServer = https.createServer(options, app.callback());
			servers.push(httpsServer);
			listens.push(listenToServer(httpsServer, httpsPort, host));
		}
		app.__netServers = servers;
	};
	app.close = async function close() {
		const { __netServers } = app;
		if (!__netServers) return [];
		return Promise.all(__netServers.map(closeServer));
	};
	return app;
}
