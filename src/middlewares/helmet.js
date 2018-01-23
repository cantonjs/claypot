import helmet from 'koa-helmet';

export default (app, { hidePoweredBy, ...options }) => {
	const middleware = [
		helmet({ accessControlAllowOrigin: false, ...options }),
		helmet.hidePoweredBy({ setTo: 'PHP 5.4.0', ...hidePoweredBy }),
	];
	middleware.displayName = 'helmet';
	app.use(middleware);
};
