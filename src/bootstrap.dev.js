
import forever from 'forever-monitor';
import config from './utils/getConfig';
import { relative, join } from 'path';

let proc;

export default () => new Promise((resolve) => {
	const getCommand = (command, args) => [command].concat(args).join(' ');

	const {
		port, name, debug, env,
		watch: { enable, directory, ignorePatterns, ignoreDotFiles },
	} = config;

	const args = [];

	if (debug.enable) { args.push(`--debug=${debug.port}`); }

	const cwd = process.cwd();
	const serverFile = join(relative(cwd, __dirname), './app.js');

	proc = forever
		.start(serverFile, {
			uid: name,
			max: 1,
			silent: false,
			command: getCommand('babel-node', args),
			watch: enable,
			watchIgnoreDotFiles: ignoreDotFiles,
			watchDirectory: directory,
			watchIgnorePatterns: ignorePatterns,
			env,
		})
		.on('start', () => {
			resolve({ port, proc });
		})
		.on('exit', () => {
			console.log('exit');
		})
	;

});
