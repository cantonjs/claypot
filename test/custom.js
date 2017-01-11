
import koa from 'koa';
import { logger, config } from '../src';

console.log('furk', config);

export default function server(opts, config) {
	// logger.info('config', config);
	logger.info('server started [logger]');
	console.log('server started [console]');
	return koa();
}
