
import { noop } from 'lodash';

const _callbackified = Symbol('callbackified');

const returnNoop = () => noop;

export default function koaContextCallbackify(ctx) {
	if (ctx[_callbackified]) { return ctx; }

	ctx[_callbackified] = true;
	ctx.respond = false;

	try {
		Object.defineProperties(ctx, {
			status: {
				get: () => 100,
				set: returnNoop,
			},
			set: {
				get: returnNoop,
				set: returnNoop,
			},
			response: {
				get: () => ({ status: 100 }),
				set: returnNoop,
			},
		});
	}
	catch (err) {}

	return ctx;
}
