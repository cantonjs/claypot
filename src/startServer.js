import http from 'http';
import https from 'https';
import Koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { setLoggers, logger } from 'pot-logger';
import mount from 'koa-mount';
import Plugins from './utils/plugins';
import getCertOption from './utils/getCertOption';
import listenToServer from './utils/listenToServer';
import initDbs from './dbs';
import { name, version } from '../package.json';

export default async function startServer(config) {
	const { host, port, baseDir, ssl, production } = config;

	setLoggers(config);

	logger.debug(`${name} version: v${version}`);
	logger.trace('production:', production);

	Plugins.init(config);

	await initDbs(config);

	const app = new Koa();

	app.mount = (...args) => app.use(mount(...args));

	await Plugins.sequence('initServer', app);

	useMiddlewares(app);

	Plugins.sync('serverWillStart', app);

	const servers = [];

	if (ssl && ssl.enable !== false) {
		const { port: httpsPort, key, cert } = ssl;
		const options = getCertOption(baseDir, key, cert);

		servers.push({ app: http.createServer(app.callback()), port });
		servers.push({
			app: https.createServer(options, app.callback()),
			port: httpsPort,
		});
	}
	else {
		servers.push({ app, port });
	}

	await Promise.all(
		servers.map(({ app, port }) => listenToServer(app, port, host)),
	);
	Plugins.sync('serverDidStart', app);

	return app;
}
