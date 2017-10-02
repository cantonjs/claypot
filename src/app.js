
import http from 'http';
import https from 'https';
import Koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { initAppConfig } from './config';
import { setLoggers, createLogger, logger } from 'pot-logger';
import mount from 'koa-mount';
import Plugins from './utils/plugins';
import getCertOption from './utils/getCertOption';
import initDbs from './dbs';
import { once } from 'lodash';
import chalk from 'chalk';
import { name, version } from '../package.json';

const serverLogger = createLogger('server', 'yellow');

(async function main() {
	try {
		const config = initAppConfig(process.env.CLAYPOT_CONFIG);
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

		const handleError = (server) => {
			server.on('error', serverLogger.error);
		};

		const handleReady = once(async () => {
			serverLogger.info(chalk.green('ready'));
			Plugins.sync('serverDidStart', app);
		});

		const createListenArgs = (port) => {
			return [port, host, handleReady].filter(Boolean);
		};

		host && serverLogger.trace('HTTP host', chalk.magenta(host));
		serverLogger.trace('HTTP port', chalk.magenta(port));

		if (ssl && ssl.enable !== false) {
			const { port: httpsPort, key, cert } = ssl;
			const options = getCertOption(baseDir, key, cert);
			handleError(
				http.createServer(app.callback()).listen(...createListenArgs(port))
			);
			handleError(
				https
					.createServer(options, app.callback())
					.listen(...createListenArgs(httpsPort))
			);
			serverLogger.trace('HTTPS port', chalk.magenta(httpsPort));
		}
		else {
			handleError(app.listen(...createListenArgs(port)));
		}
	}
	catch (err) {
		serverLogger.fatal(`failed to start server:`, err);
	}
}());
