
import { resolveConfig } from 'pot-js';
import { defaultConfigFilename, init } from '../config';
import { initPlugins } from '../utils/plugins';
import workspace from '../utils/workspace';
import initDbs from './index';

export default async function connectDbs(options) {
	const config = init(await resolveConfig({
		config: defaultConfigFilename,
		configWalk: true,
		...options,
		workspace,
	}));

	await initPlugins(config);
	return initDbs(config);
}
