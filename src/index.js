
import { isProd, isDev } from './utils/env';
import config from './utils/getConfig';
import exec from './utils/exec';
import outputHost from 'output-host';

const procs = [];

export const start = async () => {
	const bootstrap = require(`./bootstrap.${isProd ? 'prod' : 'dev'}`).default;
	const { pre, post, port } = config.script;

	pre && await procs.push(exec(pre));

	procs.push(await bootstrap());

	post && await procs.push(exec(post));

	isDev && outputHost(port);
};

export const stop = () => procs.forEach((proc) => proc.kill());
