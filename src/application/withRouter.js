import compose from 'koa-compose';
import methods from 'methods';
import pathToRegexp from 'path-to-regexp';

export default function withRouter(App) {
	const handleRoute = (app, method, pathRegexp, keys, middlewares) => {
		const composed = compose(middlewares);
		return app.use(async (ctx, next) => {
			if (ctx.method.toLowerCase() !== method) return next();
			const { path } = ctx;
			const matches = pathRegexp.exec(path);
			if (!matches) return next();
			const params = {};
			keys.forEach(({ name }, index) => {
				params[name] = matches[index + 1];
			});
			ctx.params = params;
			await composed(ctx);
		});
	};

	methods.forEach((method) => {
		App.prototype[method] = function (path, ...middlewares) {
			const keys = [];
			const pathRegexp = pathToRegexp(path, keys);
			return handleRoute(this, method, pathRegexp, keys, middlewares);
		};
	});

	return App;
}
