import { list as listPot } from 'pot-js';
import workspace from './utils/workspace';

export default async function list(options = {}) {
	return listPot({
		...options,
		workspace,
		head: [
			'Name',
			'Status',
			'Crashes',
			'Memory',
			'CPU',
			'Started',
			'Port',
			'Pid',
		],
		setTable(info) {
			return [
				info.data.name,
				info.styledStatus,
				info.crashes,
				info.memoryUsage.formattedString,
				info.cpuUsage.percent,
				info.startedLocal,
				info.data.port,
				info.data.parentPid,
			];
		},
	});
}
