
import respawn from 'respawn';
import Ipcee from 'ipcee';
import watch from '../utils/watch';
import { monitorLogger } from '../utils/logger';
import { startServer, stopServer } from './unixDomainSocket';

const ipc = new Ipcee(process);

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

const startSocketServer = async (monitor, name) => {
	const socket = await startServer(name);
	socket.on('info', (data, sock) => {
		socket.emit(sock, 'info', monitor.toJSON());
	});
};

const start = ({ script, options }) => {
	const { name } = options;
	const { watch: watchOptions, ...respawnOptions } = options;

	const monitor = respawn(script, {
		...respawnOptions,
		stdio: ['ignore', 'inherit', 'inherit'],
	});

	lifecycle(monitor, name);

	const exit = () => {
		stopServer();
		monitor.stop(() => {
			process.exit();
		});
	};

	process.on('SIGINT', exit);
	process.on('SIGTERM', exit);

	startSocketServer(monitor, name);

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
