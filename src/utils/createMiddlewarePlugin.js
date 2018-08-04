export default function createMiddlewarePlugin(middleware) {
	return class MiddlewarePlugin {
		constructor(options) {
			this._options = options;
		}

		async middleware(app) {
			await middleware(app, this._options);
		}
	};
}
