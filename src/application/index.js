import Koa from 'koa';

export function createApplication() {
	const app = new Koa();
	return app;
}
