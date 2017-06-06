
import error from 'koa-error';
import { resolve } from 'path';
import { isBoolean } from 'lodash';

export default function httpError(app, options) {
	if (isBoolean(options)) { options = {}; }
	return app.use(error({
		template: resolve(__dirname, '../../assets/error.html'),
		...options,
	}));
};
