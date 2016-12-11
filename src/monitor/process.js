
import respawn from 'respawn';
import IPC from '../utils/IPC';
import watch from '../utils/watch';
import { monitorLogger } from '../utils/logger';

const ipc = new IPC(process);

const start = ({ script, options }) => {
	const { name } = options;
	const { watch: watchOptions, ...respawnOptions } = options;

	const monitor = respawn(script, {
		...respawnOptions,
		stdio: ['ignore', 'inherit', 'inherit'],
	});

	monitor.on('start', () => {
		monitorLogger.info(`${name} started.`);
		ipc.send('start');
	});

	monitor.on('stop', () => {
		monitorLogger.info(`${name} stopped.`);
	});

	monitor.on('crash', () => {
		monitorLogger.info(`${name} crashed.`);
	});

	monitor.on('sleep', () => {
		monitorLogger.info(`${name} sleeped.`);
	});

	monitor.on('exit', async (code, signal) => {
		monitorLogger.info(`${name} exit with code "${code}", signal "${signal}".`);
	});

	monitor.on('stdout', (data) => {
		monitorLogger.info(`${name} stdout: ${data}`);
	});

	monitor.on('stderr', (data) => {
		monitorLogger.error(`${name} stderr: ${data}`);
	});

	monitor.on('warn', (data) => {
		monitorLogger.warn(`${name} warn: ${data}`);
	});

	monitor.start();

	const exit = () => {
		monitor.stop(() => {
			process.exit();
		});
	};

	process.on('SIGINT', exit);
	process.on('SIGTERM', exit);

	watch(watchOptions, (file, stat) => {
		monitorLogger.trace('watch:restart', stat);

		process.emit('watch:restart', { file, stat });
		monitor.stop();
		monitor.start();
	});
};

ipc.on('start', (payload) => {
	const { pid } = process;
	monitorLogger.debug('pid', pid);
	ipc.send('pid', pid);
	start(payload);
});
