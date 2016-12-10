
import { start } from './daemon';
import config from './utils/getConfig';
import { relative, join } from 'path';

let proc;

export default () => new Promise(async (resolve, reject) => {
	const {
		name, daemon, env, rootDir, script: { command },
		watch: { enable, directory, ignorePatterns, ignoreDotFiles },
	} = config;

	const cwd = process.cwd();
	const serverFile = join(relative(cwd, __dirname), './app.js');

	try {
		proc = await start(serverFile, {
			command,
			daemon,
			name,
			rootDir,
			cwd,
			maxRestarts: 1,
			watch: enable,
			watchIgnoreDotFiles: ignoreDotFiles,
			watchDirectory: directory,
			watchIgnorePatterns: ignorePatterns,
			env,
		});

		proc
			.on('start', () => {
				resolve(proc);
			})
			.on('exit', (...args) => {
				console.log('exit', args);
			})
		;
	}
	catch (err) {
		reject(err);
	}
});
