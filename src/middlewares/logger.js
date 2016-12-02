
import { isProd } from '../utils/env';

export default (app) => app.use(function * logger(next) {
	const start = new Date();

	yield next;

	const { url, method } = this;

	if (isProd) {
		/* eslint-disable */
		console.log(`[${new Date()}] "${method} ${url}" ${this.status} ${new Date() - start}ms (${this.header['referer'] || '-'}) (${this.header['user-agent'] || '-'}) ${this.header['x-forwarded-for'] || '-'}`);
		/* eslint-enable */
	}
	else {
		console.log(`${method} ${url} - ${new Date() - start}ms`);
	}
});
