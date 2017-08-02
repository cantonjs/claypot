
import http from 'http';
import https from 'https';
import Koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { initAppConfig } from './config';
import { setConfig as setLogger, createLogger } from 'pot-logger';
import mount from 'koa-mount';
import { initPlugins, applyInitServer } from './utils/plugins';
import getCertOption from './utils/getCertOption';
import initDbs from './dbs';
import { once } from 'lodash';
import chalk from 'chalk';

const logger = createLogger('server', 'yellow');

(async function main() {
	try {
		const config = initAppConfig(process.env.CLAYPOT_CONFIG);

		setLogger(config);
		initPlugins(config);

		const { port, root, ssl } = config;

		await initDbs(config);

		const app = new Koa();

		app.mount = (...args) => app.use(mount(...args));

		await applyInitServer(app);

		useMiddlewares(app);

		const handleError = (server) => {
			server.on('error', logger.error);
		};

		const handleReady = once(() => {
			logger.info(chalk.green('ready'));
		});

		logger.debug('HTTP server port', chalk.magenta(port));

		if (ssl && ssl.enable !== false) {
			const { port: httpsPort, key, cert } = ssl;
			const options = getCertOption(root, key, cert);
			handleError(
				http.createServer(app.callback()).listen(port, handleReady)
			);
			handleError(
				https
					.createServer(options, app.callback())
					.listen(httpsPort, handleReady)
			);
			logger.debug('HTTPS server port', chalk.magenta(httpsPort));
		}
		else {
			handleError(app.listen(port, handleReady));
		}
	}
	catch (err) {
		logger.fatal(`failed to start server:`, err);
	}
}());
