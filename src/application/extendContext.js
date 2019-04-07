import send from 'koa-send';

export default async function extendContext(ctx, next) {
	ctx.sendFile = function sendFile(path, options) {
		return send(ctx, path, {
			root: ctx.app.__staticRoot,
			...options,
		});
	};
	return next();
}
