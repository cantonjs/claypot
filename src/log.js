
import { log as logPot } from 'pot-js';
import workspace from './utils/workspace';

export default async function log(options = {}) {
	return logPot({
		...options,
		workspace,
	});
}
