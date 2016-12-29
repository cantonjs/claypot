
import './redis';
import koa from 'koa';
import useMiddlewares from '../utils/useMiddlewares';
import { init } from '../config';
import { appLogger } from '../utils/logger';

process.on('message', (buf) => {
	const config = init(JSON.parse(buf.toString()));

	const { port } = config;

	const app = koa();

	useMiddlewares(app);

	app.listen(port).on('error', (err) => {
		appLogger.error(err);
	});

});
