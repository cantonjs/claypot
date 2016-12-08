
import { isDev } from './utils/env';
import config from './utils/getConfig';
import exec from './utils/exec';
import outputHost from 'output-host';
import bootstrap from './bootstrap';

const procs = [];

export const start = async () => {
	const { pre, post, port } = config.script;

	pre && await procs.push(exec(pre));

	procs.push(await bootstrap());

	post && await procs.push(exec(post));

	isDev && outputHost(port);
};

export const stop = () => procs.forEach((proc) => proc.kill());
