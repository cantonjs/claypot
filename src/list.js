
import { list as listPot } from 'pot-js';
import workspace from './utils/workspace';

export default async function list(options = {}) {
	return listPot({
		...options,
		workspace,
	});
}
