
import { isDev } from './utils/env';
import config from './utils/getConfig';
import exec from './utils/exec';
import { monitorLogger } from './utils/logger';
import { join } from 'path';
import outputHost from 'output-host';
import { startMonitor, stopMonitor } from './monitor';

const procs = [];

const bootstrap = () => new Promise(async (resolve, reject) => {
	const {
		script: { command }, ...options,
	} = config;

	const serverFile = join(__dirname, 'app.js');

	try {
		const proc = await startMonitor([command, serverFile], options);

		proc
			.on('start', () => {
				monitorLogger.debug('proc start');
				resolve(proc);
			})
			.on('exit', (...args) => {
				monitorLogger.info('exit', args);
			})
		;
	}
	catch (err) {
		reject(err);
	}
});

export const start = async () => {
	const { pre, post, port } = config.script;

	pre && await procs.push(exec(pre));

	procs.push(await bootstrap());

	post && await procs.push(exec(post));

	isDev && outputHost(port);
};

export const stop = () => stopMonitor(config);
