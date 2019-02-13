// start without monitor

import boot from './boot';
import { initConfig, resetConfig } from './config';

export default async function startPure(config) {
	resetConfig();
	return boot(initConfig(config));
}
