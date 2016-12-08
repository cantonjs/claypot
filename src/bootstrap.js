
import forever from 'forever';
import foreverMonitor from 'forever-monitor';
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

	// const run = daemon ? forever.startDaemon : foreverMonitor.start;
	const run = daemon ? forever.startDaemon : forever.start;

	proc = run(serverFile, {
		uid: name,
		max: 1,
		silent: false,
		command,
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
	.on('exit', () => {
		console.log('exit');
	});

});
