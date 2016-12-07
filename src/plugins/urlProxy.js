
import url from 'url';
import proxy from './proxy';

const atob = (base64String = '') =>
	(new Buffer(base64String, 'base64')).toString('utf-8')
;

export default () => proxy((ctx) => {
	const pathname = url.parse(ctx.req.url).pathname.slice(1);
	const target = decodeURI(atob(pathname));
	delete ctx.req.headers.referer;
	return {
		target,
		changeOrigin: true,
	};
});
