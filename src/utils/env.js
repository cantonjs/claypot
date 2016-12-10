
import { upperCase } from 'lodash';
import pkg from '../../package.json';

const prefix = upperCase(pkg.name);

const { env } = process;

const {
	NODE_ENV = 'development',
} = env;

export const name = env[`${prefix}_NAME`];
export const port = env[`${prefix}_PORT`];
export const command = env[`${prefix}_COMMAND`];
export const daemon =
	env[`${prefix}_DAEMON`] && env[`${prefix}_DAEMON`] !== 'false'
;

export const isProd = NODE_ENV === 'production';
export const isDev = NODE_ENV === 'development';
