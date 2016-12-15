
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

	socket.on('info', (data, sock) => {
		const emit = (data = {}) => socket.emit(sock, 'info', {
			memoryUsage: {
				percent: '-',
				formattedHeapUsed: '-',
			},
			...monitor.toJSON(),
			...data,
		});

		const { pid } = monitor;
		if (pid) {
			pidUsage.stat(pid, (err, { memory }) => {
				let resp = null;
				if (err) { monitorLogger.error(err); }
				else {
					const { heapTotal } = process.memoryUsage();
					resp = {
						memoryUsage: {
							percent: `${(memory / heapTotal / 100).toFixed(2)}%`,
							formattedHeapUsed: formatBytes(memory),
						},
					};
				}
				emit(resp);
			});
			pidUsage.unmonitor(pid);
		}
		else {
			emit();
		}

	});
};

const lifecycle = (monitor, name) => {
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
};

const start = ({ script, options }) => {
	const { name } = options;
	const { watch: watchOptions, port, logsDir, ...respawnOptions } = options;

	const monitor = respawn(script, {
		...respawnOptions,
		stdio: ['ignore', 'inherit', 'inherit'],
		data: {
			port,
			logsDir,
			pid: process.pid,
		},
	});

	lifecycle(monitor, name);

	startSocketServer(monitor, name);

	const exit = () => {
		stopServer();
		monitor.stop(::process.exit);
	};

	process.on('SIGINT', exit);
	process.on('SIGTERM', exit);
	process.on('uncaughtException', exit);

	watch(watchOptions, (file, stat) => {
		monitorLogger.debug('watch:restart', stat);

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
