
import http from 'http';
import https from 'https';
import Koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { init } from './config';
import { setConfig as setLogger, createLogger } from 'pot-logger';
import mount from 'koa-mount';
import { initPlugins, applyInitServer } from './utils/plugins';
import getCertOption from './utils/getCertOption';
import initDbs from './dbs';
import { once } from 'lodash';

const logger = createLogger('server', 'yellow');

(async function main() {
	try {
		const config = init(JSON.parse(process.env.CLAYPOT_CONFIG));
		setLogger(config);

		initPlugins(config);

		const { port, root, ssl } = config;


		await initDbs(config);

		const app = new Koa();

		app.mount = (...args) => app.use(mount(...args));

		await applyInitServer(app);

		useMiddlewares(app);

		const handleError = (server) => {
			server.on('error', logger.error.bind(logger));
		};

		const readyLogger = once((port) => logger.info('server is ready'));
		const createListener = (port) => () => readyLogger(port);

		if (ssl && ssl.enable !== false) {
			const { port: httpsPort, key, cert } = ssl;
			const options = getCertOption(root, key, cert);
			handleError(
				http.createServer(app.callback()).listen(createListener(port))
			);
			handleError(
				https
					.createServer(options, app.callback())
					.listen(createListener(httpsPort))
			);
		}
		else {
			handleError(app.listen(createListener(port)));
		}
	}
	catch (err) {
		logger.fatal(`failed to start server:`, err);
	}
}());
