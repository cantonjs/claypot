
export default function rewriteIndex(app, options) {
	return app.use(async (ctx, next) => {
		if (ctx.path.endsWith('/')) {
			ctx.path += options.index || 'index.html';
		}
		await next();
	});
}
