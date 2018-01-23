import mount from 'koa-mount';

export default function interceptApp(app, middlewares) {
	const use = app.use.bind(app);

	app.applyMiddlewares = function applyMiddlewares(middleware) {
		if (Array.isArray(middleware)) {
			middleware.forEach(app.applyMiddlewares);
		}
		else {
			use(middleware);
		}
	};

	app.mount = (path, ...args) => {
		const middleware = mount(path, ...args);
		middleware.displayName = `mount("${path}")`;
		return app.use(middleware);
	};
	app.use = (...args) => {
		middlewares.push(...args);
		return app;
	};
}
