import { getLogger } from 'pot-logger';
import claypotConfig, { isProd } from '../config';
import { resolve } from 'path';
import { isString } from 'lodash';
import ms from 'ms';

export default function serve(app, options) {
	const { baseDir } = claypotConfig;
	const logger = getLogger('server');

	if (!Array.isArray(options)) options = [options];

	options.forEach((option = {}) => {
		if (isString(option)) option = { dir: option };
		const { dir, root, maxAge } = option;
		if (root || dir) {
			const staticDir = root || resolve(baseDir, dir);
			if (!root) option.root = staticDir;
		}
		if (!maxAge && maxAge !== 0) {
			option.maxAge = isProd ? ms('1d') : 0;
		}
		app.static(option, logger);
	});
}
