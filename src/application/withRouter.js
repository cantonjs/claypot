import methods from 'methods';
import Routes from './Routes';

const ensureRoutes = function ensureRoutes(app) {
	return app._routes || (app._routes = new Routes());
};

export default function withRouter(App) {
	const handleRoute = (app, method, path, fns) => {
		const appRoutes = ensureRoutes(app);
		appRoutes.set(path, method, fns);
		return app.use(async (ctx, next) => {
			const route = appRoutes.get(path, ctx.method);
			if (!route) return next();
			if (route.code) {
				const { headers = {} } = route;
				for (const [key, val] of Object.entries(headers)) {
					ctx.set(key, val);
				}
				ctx.status = route.code;
				return;
			}
			const { keys, pathRegexp, middleware } = route;
			if (!pathRegexp) return next();
			const matches = pathRegexp.exec(ctx.path);
			if (!matches) return next();
			const params = {};
			keys.forEach(({ name }, index) => {
				params[name] = matches[index + 1];
			});
			ctx.params = params;
			await middleware(ctx);
		});
	};

	App.prototype.path = function path(path, routes = {}) {
		for (const [method, fns] of Object.entries(routes)) {
			handleRoute(this, method, path, fns);
		}
		return this;
	};

	methods.forEach((method) => {
		App.prototype[method] = function (path, ...middlewares) {
			return handleRoute(this, method, path, middlewares);
		};
		App.prototype.all = function all(path, ...middlewares) {
			return handleRoute(this, 'ALL', path, middlewares);
		};
	});

	return App;
}
