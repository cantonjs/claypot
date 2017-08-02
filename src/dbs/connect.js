
import { initCliConfig } from '../config';
import { initPlugins } from '../utils/plugins';
import initDbs from './index';

export default async function connectDbs(argv) {
	const config = await initCliConfig(argv);
	await initPlugins(config);
	return initDbs(config);
}
