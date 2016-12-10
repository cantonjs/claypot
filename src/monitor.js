
import respawn from 'respawn';
import IPC from './utils/IPC';
import watch from './utils/watch';

const ipc = new IPC(process);

const start = ({ script, options }) => {
	const { name } = options;
	const { watch: watchOptions, ...respawnOptions } = options;

	const monitor = respawn(script, {
		...respawnOptions,
		stdio: ['ignore', 'inherit', 'inherit'],
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

	watch(watchOptions, (file, stat) => {
		process.emit('watch:restart', { file, stat });
		monitor.stop();
		monitor.start();
	});
};

ipc.on('start', (payload) => {
	ipc.send('pid', process.pid);
	start(payload);
});
