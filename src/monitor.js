
import respawn from 'respawn';
import { unlink } from 'fs-promise';
import IPC from './utils/IPC';

const ipc = new IPC(process);

const start = ({ script, options }) => {
	const { name } = options;
	const { command, pidFile, ...respawnOptions } = options;

	const monitor = respawn([command, script], {
		...respawnOptions,
		stdio: ['ignore', 'inherit', 'inherit']
	});

	monitor.on('start', () => {
		console.log(`${name} started.`);
		ipc.send('start');
	});

	monitor.on('stop', () => {
		console.log(`${name} stopped.`);
	});

	monitor.on('crash', () => {
		console.log(`${name} crashed.`);
	});

	monitor.on('sleep', () => {
		console.log(`${name} sleeped.`);
	});

	monitor.on('exit', async (code, signal) => {
		await unlink(pidFile);
		console.log(`${name} exit with code "${code}", signal "${signal}".`);
	});

	monitor.on('stdout', (data) => {
		console.log(`${name} stdout: ${data}`);
	});

	monitor.on('stderr', (data) => {
		console.error(`${name} stderr: ${data}`);
	});

	monitor.on('warn', (data) => {
		console.warn(`${name} warn: ${data}`);
	});

	monitor.start();

	const exit = () => {
		monitor.stop(() => {
			process.exit();
		});
	};

	process.on('SIGINT', exit);
	process.on('SIGTERM', exit);
};

ipc.on('start', (payload) => {
	ipc.send('pid', process.pid);
	start(payload);
});
