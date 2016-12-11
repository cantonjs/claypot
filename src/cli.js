
import { argv } from './config/args';
import { monitorLogger } from './utils/logger';
import { start, stop } from '.';

if (!argv._.length) {
	start().catch((err) => monitorLogger.error(err));
}
else if (argv._[0] === 'stop') {
	stop().catch((err) => monitorLogger.error(err));
}
