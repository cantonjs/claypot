import history from 'koa-connect-history-api-fallback';

export default (app, options) => {
	const middleware = history(options);
	middleware.keyName = 'historyAPIFallback';
	return app.use(middleware);
};
