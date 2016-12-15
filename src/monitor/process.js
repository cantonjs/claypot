
import respawn from 'respawn';
import ChildIPC from '../utils/ChildIPC';
import watch from '../utils/watch';
import formatBytes from '../utils/formatBytes';
import { monitorLogger } from '../utils/logger';
import { startServer, stopServer } from './unixDomainSocket';
import pidUsage from 'pidusage';

const ipc = new ChildIPC(process);

const startSocketServer = async (monitor, name) => {
	const socket = await startServer(name);
	const { pid } = monitor.child;
	socket.on('info', (data, sock) => {
		pidUsage.stat(pid, (err, { memory }) => {
			let resp = null;
			if (err) { monitorLogger.error(err); }
			else {
				resp = {
					...monitor.toJSON(),
					memoryUsage: {
						heapTotal: process.memoryUsage().heapTotal,
						heapUsed: memory,
						formattedHeapUsed: formatBytes(memory),
					},
				};
			}
			socket.emit(sock, 'info', resp);
		});
		pidUsage.unmonitor(process.pid);
	});
};

const lifecycle = (monitor, name) => {
	monitor.on('start', () => {
		startSocketServer(monitor, name);
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
		stopServer();
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
};

const start = ({ script, options }) => {
	const { name } = options;
	const { watch: watchOptions, port, logsDir, ...respawnOptions } = options;

	const monitor = respawn(script, {
		...respawnOptions,
		stdio: ['ignore', 'inherit', 'inherit'],
		data: { port, logsDir },
	});

	lifecycle(monitor, name);

	const exit = () => {
		monitor.stop(() => {
			process.exit();
		});
	};

	process.on('SIGINT', exit);
	process.on('SIGTERM', exit);
	process.on('uncaughtException', exit);

	watch(watchOptions, (file, stat) => {
		monitorLogger.info('watch:restart', stat);

		process.emit('watch:restart', { file, stat });

		return new Promise((resolve) => {
			monitor.stop(() => {
				monitor.start();
				resolve();
			});
		});
	});
};

ipc.on('start', (payload) => {
	const { pid } = process;
	monitorLogger.debug('pid', pid);
	ipc.send('pid', pid);
	start(payload);
});
