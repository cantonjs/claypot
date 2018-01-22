// start without monitor

import startServer from './startServer';
import { initConfig } from './config';

export default async function startPure(config) {
	return startServer(initConfig(config));
}
