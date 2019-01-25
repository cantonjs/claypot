import connectHistoryAPIFallback from 'connect-history-api-fallback';

function createHistoryAPIFallbackMiddleware(options) {
	const connect = connectHistoryAPIFallback(options);
	const noop = function () {};

	const historyAPIFallbackMiddleware = async (ctx, next) => {
		connect(ctx, null, noop);
		return next();
	};
	historyAPIFallbackMiddleware.keyName = 'historyAPIFallback';
	return historyAPIFallbackMiddleware;
}

export default (app, options) => {
	return app.use(createHistoryAPIFallbackMiddleware(options));
};
