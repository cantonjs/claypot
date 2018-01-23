import history from 'koa-connect-history-api-fallback';

export default (app, options) => {
	const middleware = history(options);
	middleware.displayName = 'historyAPIFallback';
	return app.use(middleware);
};
