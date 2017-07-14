
import { start as startPot, resolveConfig } from 'pot-js';
import { resolve } from 'path';
import { init, defaultConfigFilename } from './config';
import workspace from './utils/workspace';
import { appLogger } from './utils/logger';
import outputHost from 'output-host';
import { isUndefined } from 'lodash';

export default async function start(options = {}) {
	const config = init(await resolveConfig({
		config: defaultConfigFilename,
		configWalk: true,
		...options,
		workspace,
		configToEnv: 'CLAYPOT_CONFIG',
		entry: resolve(__dirname, 'app.js'),
	}));

	await startPot(config);

	const enableHttps = config.ssl.enable;

	const logger = appLogger.info.bind(appLogger);

	if ((!config.outputHost && !isUndefined(config.outputHost)) ||
		config.production) {
		return;
	}

	outputHost({
		port: config.port,
		name: config.name,
		useCopy: !config.production && !enableHttps,
		logger,
	});

	if (enableHttps) {
		outputHost({
			port: config.ssl.port,
			name: `${config.name} HTTPS`,
			protocol: 'https',
			useCopy: !config.production,
			logger,
		});

	}
}
