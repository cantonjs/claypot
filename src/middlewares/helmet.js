
import helmet from 'koa-helmet';

export default (app, { hidePoweredBy, ...options }) => app
	.use(helmet({ accessControlAllowOrigin: false, ...options }))
	.use(helmet.hidePoweredBy({ setTo: 'PHP 5.4.0', ...hidePoweredBy }))
;
