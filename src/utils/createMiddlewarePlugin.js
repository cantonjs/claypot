export default function createMiddlewarePlugin(middleware) {
	return class MiddlewarePlugin {
		constructor(options) {
			this._options = options;
		}

		middleware(app) {
			middleware(app, this._options);
		}
	};
}
