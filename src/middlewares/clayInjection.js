import { createClay } from '../clay';

export default (app) =>
	app.use(async function claypotInjection(ctx, next) {
		await createClay(ctx);
		await next();
	});
