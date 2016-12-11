
import { exec } from 'child_process';
import { monitorLogger } from './logger';

export default (command, options = {}) => {
	const { timeout = 2000 } = options;
	let proc;

	const execMain = new Promise((resolve, reject) => {
		monitorLogger.info(`> ${command}\n`);

		proc = exec(command, (error, stdout, stderr) => {
			if (error || stderr) {
				reject(error || stderr);
			}
			else {
				resolve({ proc, stdout });
			}
		});
	});

	const execTimeout = new Promise((resolve) => {
		setTimeout(() => resolve({ signal: 'TIMEOUT', proc }), timeout);
	});

	return Promise.race([execMain, execTimeout]);
};
