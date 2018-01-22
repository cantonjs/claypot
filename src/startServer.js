import http from 'http';
import https from 'https';
import Koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { setLoggers, logger } from 'pot-logger';
import mount from 'koa-mount';
import Plugins from './utils/plugins';
import getCertOption from './utils/getCertOption';
import { listenToServer, closeServer } from './utils/listenToServer';
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

	const servers = [http.createServer(app.callback())];
	const listens = [listenToServer(servers[0], port, host)];

	if (ssl && ssl.enable !== false) {
		const { port: httpsPort, key, cert } = ssl;
		const options = getCertOption(baseDir, key, cert);
		const httpsServer = https.createServer(options, app.callback());
		servers.push(httpsServer);
		listens.push(listenToServer(httpsServer, httpsPort, host));
	}

	await Promise.all(listens);
	Plugins.sync('serverDidStart', app);

	app.close = () => Promise.all(servers.map(closeServer));

	return app;
}
