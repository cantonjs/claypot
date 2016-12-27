
import { list as listPot } from 'pot-js';
import workspace from './utils/workspace';

export default async function list(options = {}) {
	return listPot({
		...options,
		workspace,
		head: [
			'Name', 'Status', 'Crashes', 'Memory', 'Started', 'Port', 'Pid',
		],
		setTable(info) {
			return [
				info.name,
				info.styledStatus,
				info.crashes,
				info.memoryUsage.formattedString,
				info.startedLocal,
				info.data.port,
				info.data.parentPid,
			];
		},
	});
}
