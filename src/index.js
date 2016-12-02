
import { isProd, isDev } from './utils/env';
import config from './utils/getConfig';
import exec from './utils/exec';
import outputHost from 'output-host';

const procs = [];

export const start = async () => {
	const bootstrap = require(`./bootstrap.${isProd ? 'prod' : 'dev'}`).default;
	const { pre, post } = config.scripts;

	for (const script of pre) {
		const { proc } = await exec(script);
		procs.push(proc);
	}

	const { proc, port } = await bootstrap();
	procs.push(proc);

	for (const script of post) {
		const { proc } = await exec(script);
		procs.push(proc);
	}

	isDev && outputHost(port);
};

export const stop = () => procs.forEach((proc) => proc.kill());
