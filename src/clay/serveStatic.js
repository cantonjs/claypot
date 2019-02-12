import { getLogger } from 'pot-logger';
import claypotConfig, { isProd } from '../config';
import { isString } from 'lodash';
import { resolve } from 'path';
import ms from 'ms';
import send from 'koa-send';
import multimatch from 'multimatch';

const defaultMaxAge = ms('2 days');

const { baseDir } = claypotConfig;

const getMaxAge = (maxAge) => {
	if (!maxAge && maxAge !== 0) return isProd ? defaultMaxAge : 0;
	return isString(maxAge) ? ms(maxAge) : maxAge;
};

export default (ctx) => {
	ctx.serveStatic = async function serveStatic(config) {
		const { path, method } = ctx;
		if (method !== 'HEAD' && method !== 'GET') return false;

		const logger = getLogger('server');

		if (isString(config)) config = { dir: config };
		const { dir, root: absoluteDir, rules, gzip, ...restOpts } = config;
		logger.trace('serve static', config);
		const root = absoluteDir || resolve(baseDir, dir);

		const validate = (rule) => {
			if (!rule || rule.isEnabled === false) return false;
			const pattern = rule.test || rule.match;
			return !pattern || multimatch(path, pattern).length;
		};

		const handleSend = async (option) => {
			try {
				const maxage = getMaxAge(option.maxAge);

				if (option.index !== false) {
					option.index = option.index || 'index.html';
				}

				return await send(ctx, path, {
					...option,
					root,
					gzip: false, // use `compress` middleware instead
					maxage,
				});
			}
			catch (err) {
				if (err.status !== 404) {
					throw err;
				}
			}
		};

		if (rules) {
			if (!Array.isArray(rules)) {
				logger.warn(
					'expected servieStatic option "rules" to be an array,',
					`but received "${typeof rules}"`,
				);
			}
			else {
				for (const rule of rules.filter(validate)) {
					const done = await handleSend({ ...restOpts, ...rule });
					if (done) return true;
				}
			}
		}

		return validate(restOpts) && handleSend(restOpts);
	};
};
