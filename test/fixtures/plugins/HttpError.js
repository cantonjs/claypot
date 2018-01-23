export default class HttpError {
	middleware(app) {
		app.use(async function httpError(ctx) {
			ctx.throw(500);
		});
	}
}
