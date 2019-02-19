import Koa from 'koa';
import listenAndClose from './listenAndClose';

export function createApplication(config) {
	const app = new Koa();
	app.__config = config;
	return listenAndClose(app);
}
