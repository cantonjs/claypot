
import './redis';
import koa from 'koa';
import useMiddlewares from './utils/useMiddlewares';
import { init } from './config';
import { appLogger } from './utils/logger';

process.on('message', (buf) => {
	const config = init(JSON.parse(buf.toString()));
	// console.log('config', config);

	const { port, name } = config;

	const app = koa();

	useMiddlewares(app);
	// app.use(function * () {
	// 	this.body = 'hello claypot';
	// });

	app.listen(port, () => {
		appLogger.info(`${name} started.`);
	}).on('error', (err) => {
		appLogger.error(err);
	});

});
