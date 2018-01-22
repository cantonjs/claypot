import { dir as dirPot } from 'pot-js';
import workspace from './utils/workspace';

export default async function dir(options = {}) {
	return dirPot({
		...options,
		workspace,
	});
}
