
import url from 'url';
import httpProxy from '../utils/httpProxy';

const atob = (base64String = '') =>
	Buffer.from(base64String, 'base64').toString('utf-8')
;

export default () => httpProxy(async (ctx) => {
	const pathname = url.parse(ctx.req.url).pathname.slice(1);
	const target = decodeURI(atob(pathname));
	delete ctx.req.headers.referer;
	return {
		target,
		changeOrigin: true,
	};
});
