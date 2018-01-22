import crypto from 'crypto';

export default class HttpError {
	middleware(app) {
		app.use(async (ctx) => {
			ctx.type = 'text/html';
			ctx.body = crypto.randomBytes(1024);
		});
	}
}
