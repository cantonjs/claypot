
import url from 'url';
import httpProxy from '../utils/httpProxy';

const atob = (base64String = '') =>
	Buffer.from(base64String, 'base64').toString('utf-8')
;

export default class UrlProxy {
	constructor(options) {
		this._options = options;
	}

	middleware(parent) {
		const { path } = this._options;
		const app = httpProxy(async (ctx) => {
			const pathname = url.parse(ctx.req.url).pathname.slice(1);
			const target = decodeURI(atob(pathname));
			delete ctx.req.headers.referer;
			return {
				target,
				changeOrigin: true,
			};
		});
		parent.mount(path, app);
	}
}
