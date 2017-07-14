
import { noop } from 'lodash';

const _callbackified = Symbol('callbackified');

const set = () => noop;

export default function koaContextCallbackify(ctx) {
	if (ctx[_callbackified]) { return ctx; }

	ctx[_callbackified] = true;
	ctx.respond = false;

	try {
		Object.defineProperties(ctx, {
			status: {
				get: () => 100,
				set,
			},
			set: {
				get: set,
				set,
			},
		});
	}
	catch (err) {}

	return ctx;
}
