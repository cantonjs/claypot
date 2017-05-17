
import error from 'koa-error';
import { resolve } from 'path';

export default (app, options) => app.use(error({
	template: resolve(__dirname, '../error.html'),
	...options,
}));
