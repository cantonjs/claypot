
import redis from 'redis';
import { appLogger } from './utils/logger';
import { isObject, padStart } from 'lodash';
import config from './config';

const { defaultExpiresIn, enable, ...redisConfig } = config.redis;
const client = enable && redis.createClient(redisConfig);

if (client) {
	client.on('error', (err) => {
		appLogger.error('[REDIS CONNECTION ERROR]:', err.message);
	});

	client.on('connect', () => appLogger.info('redis connected.'));
}

export default client;

export const getCache = (key) => new Promise((resolve, reject) => {

	if (!client || !client.connected) { return resolve(null); }

	client.get(key, (err, reply) => {
		if (err) { return reject(err); }
		try { resolve(JSON.parse(reply)); }
		catch (error) { resolve(reply); }
	});
});

export const setCache = (key, value = '', expire = defaultExpiresIn) =>
	new Promise((resolve, reject) => {

		if (!client || !client.connected) { return resolve(null); }

		value = isObject(value) ? JSON.stringify(value) : value;
		client.set(key, value, (err) => {
			if (err) { reject(err); }
			else {
				let expireAt = +padStart(+expire, 13, '0');
				if (+new Date() < expireAt) {
					expireAt = Math.floor(expireAt / 1000);
					client.expireat(key, expireAt);
				}
				else {
					const expireIn = Math.floor(expire) || defaultExpiresIn;
					client.expire(key, expireIn);
				}
				resolve(value);
			}
		});
	})
;
