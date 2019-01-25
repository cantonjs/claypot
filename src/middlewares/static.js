export default function serve(app, options) {
	if (!Array.isArray(options)) options = [options];
	app.use(async function serveStatic(ctx, next) {
		for (const option of options) {
			const done = await ctx.serveStatic(option);
			if (done) return;
		}
		await next();
	});
}
