
import http from 'http';
import https from 'https';
import Koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { init } from './config';
import { appLogger } from './utils/logger';
import mount from 'koa-mount';
import { initPlugins, applyInitServer } from './utils/plugins';
import getCertOption from './utils/getCertOption';
import initDbs from './dbs';

(async function main() {
	try {
		const config = init(JSON.parse(process.env.CLAYPOT_CONFIG));

		initPlugins(config);

		const {
			port, root,
			ssl: { enable: enableHttps, port: httpsPort, key, cert },
		} = config;

		await initDbs(config);

		const app = new Koa();

		app.mount = (...args) => app.use(mount(...args));

		await applyInitServer(app);

		useMiddlewares(app);

		const handleError = (server) => {
			server.on('error', appLogger.error.bind(appLogger));
		};

		if (enableHttps) {
			const options = getCertOption(root, key, cert);
			handleError(
				http.createServer(app.callback()).listen(port)
			);
			handleError(
				https.createServer(options, app.callback()).listen(httpsPort)
			);
		}
		else {
			handleError(app.listen(port));
		}
	}
	catch (err) {
		appLogger.fatal(`Failed to start server:`, err);
	}
}());
