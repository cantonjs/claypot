
import './redis';
import http from 'http';
import https from 'https';
import koa from 'koa';
import { readFile } from 'fs-promise';
import { resolve } from 'path';
import useMiddlewares from '../utils/useMiddlewares';
import { init } from '../config';
import { appLogger } from '../utils/logger';

process.on('message', async (buf) => {
	const config = init(JSON.parse(buf.toString()));

	const {
		port, root,
		ssl: { enable: enableHttps, port: httpsPort, key, cert },
	} = config;

	const app = koa();

	useMiddlewares(app);

	if (enableHttps) {
		const options = {
			key: await readFile(resolve(root, key)),
			cert: await readFile(resolve(root, cert)),
		};
		http.createServer(app.callback()).listen(port);
		https.createServer(options, app.callback()).listen(httpsPort);
	}
	else {
		app.listen(port).on('error', (err) => {
			appLogger.error(err);
		});
	}
});
