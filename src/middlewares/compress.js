
import gzip from 'koa-gzip';
import conditional from 'koa-conditional-get';

export default (app) => app
	.use(gzip())
	.use(conditional())
;
