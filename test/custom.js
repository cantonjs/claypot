
import koa from 'koa';
import { logger } from '../src';

export default function server(opts, config) {
	// logger.info('config', config);
	return koa();
}
