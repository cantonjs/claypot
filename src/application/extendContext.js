import { send } from '../utils/sendFile';

export default async function extendContext(ctx, next) {
	ctx.sendFile = function sendFile(path, options) {
		return send(ctx, path, options);
	};
	return next();
}
