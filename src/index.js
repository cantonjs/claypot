
import { isDev } from './utils/env';
import config from './utils/getConfig';
import exec from './utils/exec';
import { relative, join } from 'path';
import outputHost from 'output-host';
import * as Daemon from './daemon';

const procs = [];

const bootstrap = () => new Promise(async (resolve, reject) => {
	const {
		script: { command }, ...options,
	} = config;

	const cwd = process.cwd();
	const serverFile = join(relative(cwd, __dirname), './app.js');

	try {
		const proc = await Daemon.start([command, serverFile], options);

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

export const start = async () => {
	const { pre, post, port } = config.script;

	pre && await procs.push(exec(pre));

	procs.push(await bootstrap());

	post && await procs.push(exec(post));

	isDev && outputHost(port);
};

export const stop = () => Daemon.stop(config);
