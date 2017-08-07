
export default class HttpError {
	middleware(app) {
		app.use(async (ctx) => ctx.throw(500));
	}
}
