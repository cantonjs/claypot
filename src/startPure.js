// start without monitor

import startServer from './startServer';
import { initConfig, resetConfig } from './config';

export default async function startPure(config) {
	resetConfig();
	return startServer(initConfig(config));
}
