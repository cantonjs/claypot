
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
	// app.use(function * () {
	// 	this.body = 'hello claypot';
	// });

	appLogger.debug('start');

	app.listen(port).on('error', (err) => {
		appLogger.error(err);
	});

});
