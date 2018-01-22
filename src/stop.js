import { stop as stopPot } from 'pot-js';
import workspace from './utils/workspace';

export default async function stop(options = {}) {
	return stopPot({
		...options,
		workspace,
	});
}
