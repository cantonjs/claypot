
import './redis';
import koa from 'koa';
import useMiddlewares from '../utils/useMiddlewares';
import { init, isDev } from '../config';
import { appLogger } from '../utils/logger';
import outputHost from 'output-host';

process.on('message', (buf) => {
	const config = init(JSON.parse(buf.toString()));

	const { port, name } = config;

	const app = koa();

	useMiddlewares(app);
	// app.use(function * () {
	// 	this.body = 'hello claypot';
	// });

	app.listen(port, outputHost.curry({
		name,
		useCopy: isDev,
		logger: appLogger.info.bind(appLogger),
	})).on('error', (err) => {
		appLogger.error(err);
	});

});
