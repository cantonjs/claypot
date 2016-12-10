
import respawn from 'respawn';
import IPC from './utils/IPC';

const ipc = new IPC(process);

const start = ({ script, options }) => {
	const { name } = options;
	const { command, ...respawnOptions } = options;

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

	monitor.on('exit', (code, signal) => {
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
};

ipc.on('start', (payload) => {
	ipc.send('pid', process.pid);
	start(payload);
});
