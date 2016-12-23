
import findPortSync from 'find-port-sync';
import { merge } from 'lodash';

const {
	NODE_ENV = 'development',
	CLAYPOT_CONFIG,
	POT_CONFIG,
} = process.env;

export const isProd = NODE_ENV === 'production';
export const isDev = NODE_ENV === 'development';

const claypotConfig = JSON.parse(CLAYPOT_CONFIG) || {};
const potConfig = JSON.parse(POT_CONFIG) || {};

const { port } = claypotConfig;

const config = merge({
	port: +port || findPortSync(),
	maxRestarts: isDev ? 0 : -1,
	staticDir: 'static',
	middlewares: [
		'responseTime',
		'logger',
		'error',
		isProd && 'helmet',
		isProd && 'compress',
		'plugins',
		'rewtireIndex',
		'static',
		'notFound',
	].filter(Boolean),
	plugins: [],
	redis: {
		enable: false,
		port: 6379,
		host: '127.0.0.1',
		prefix: `${potConfig.name}:`,
		defaultExpiresIn: 60,
	},
}, potConfig, claypotConfig);

export default config;
