
export default (app) => app.use(async (ctx, next) => {
	const start = new Date();

	await next();

	const delta = new Date() - start;
	ctx.set('X-Response-Time', `${delta}ms`);
});
