export default (app) =>
	app.use(async function notFound(ctx, next) {
		await next();

		const body = ctx.body;
		const status = ctx.status || 404;
		const noContent = ~[204, 205, 304].indexOf(status);

		// ignore body
		if (noContent) {
			return;
		}

		// status body
		if (!body) {
			ctx.throw(status);
		}
	});
