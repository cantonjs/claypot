
import forever from 'forever-monitor';
import config from './utils/getConfig';
import { relative, join } from 'path';

let proc;

export default () => new Promise((resolve) => {
	const {
		name, env, script: { command },
		watch: { enable, directory, ignorePatterns, ignoreDotFiles },
	} = config;

	const cwd = process.cwd();
	const serverFile = join(relative(cwd, __dirname), './app.js');

	proc = forever
		.start(serverFile, {
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
		.on('exit', () => {
			console.log('exit');
		})
	;

});
