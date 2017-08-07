
export default (app) => app.use(async (ctx, next) => {
	const start = Date.now();

	const getResponseTime = () => ({
		key: 'X-Response-Time',
		value: Math.ceil(Date.now() - start) + 'ms',
	});

	ctx.res._getResponseTime = getResponseTime;

	await next();

	if (ctx.respond !== false) {
		const { key, value } = getResponseTime();
		ctx.set(key, value);
	}
});
