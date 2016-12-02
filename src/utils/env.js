
const { env } = process;

const {
	NODE_ENV = 'development',
} = env;

export const isProd = NODE_ENV === 'production';
export const isDev = NODE_ENV === 'development';
