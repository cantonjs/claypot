
import { start } from './daemon';
// import forever from 'forever';
// import foreverMonitor from 'forever-monitor';
import config from './utils/getConfig';
import { relative, join } from 'path';

let proc;

export default () => new Promise((resolve) => {
	const {
		name, daemon, env, script: { command },
		watch: { enable, directory, ignorePatterns, ignoreDotFiles },
	} = config;

	const cwd = process.cwd();
	const serverFile = join(relative(cwd, __dirname), './app.js');

	// const start = daemon ? forever.startDaemon : foreverMonitor.start;
	// const start = daemon ? forever.startDaemon : forever.start;

	proc = start(serverFile, {
		command,
		daemon,
		name,
		maxRestarts: 1,
		watch: enable,
		watchIgnoreDotFiles: ignoreDotFiles,
		watchDirectory: directory,
		watchIgnorePatterns: ignorePatterns,
		env,
	})
	.on('start', () => {
		resolve(proc);
	})
	.on('watch:error', (err) => {
		console.log('WATCH ERROR', err);
	})
	.on('exit', (...args) => {
		console.log('exit', args);
	});

});
