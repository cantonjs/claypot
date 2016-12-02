
import forever from 'forever-monitor';
import pkg from '../package.json';
import config from './utils/getConfig';
import { relative, join } from 'path';

let proc;

export default () => new Promise((resolve) => {
	const args = [];
	const getCommand = (command, args) => [command].concat(args).join(' ');

	const {
		port, debug, env,
		watch: { enable, directory, ignorePatterns, ignoreDotFiles },
	} = config;

	if (debug.enable) { args.push(`--debug=${debug.port}`); }

	const cwd = process.cwd();
	const serverFile = join(relative(cwd, __dirname), './app.js');

	proc = forever
		.start(serverFile, {
			uid: pkg.name,
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
