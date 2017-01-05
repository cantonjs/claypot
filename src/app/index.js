
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

	const handleError = (server) => {
		server.on('error', ::appLogger.error);
	};

	const tryReadFile = async (file) => {
		try {
			return await readFile(resolve(root, file));
		}
		catch (err) {
			appLogger.error(`Failed to read file "${file}".`);
			appLogger.debug(err);
		}
	};

	if (enableHttps) {
		const options = {
			key: await tryReadFile(key),
			cert: await tryReadFile(cert),
		};
		handleError(http.createServer(app.callback()).listen(port));
		handleError(https.createServer(options, app.callback()).listen(httpsPort));
	}
	else {
		handleError(app.listen(port));
	}
});
