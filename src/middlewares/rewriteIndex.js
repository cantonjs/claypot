
export default function rewriteIndex(app, options) {
	return app.use(function * (next) {
		if (this.path.endsWith('/')) {
			this.path += options.index || 'index.html';
		}
		yield next;
	});
}
