
import * as memory from './memory';

const dbsPlugins = { memory };

export function registerDBPlugin(key, connect, cacheStore) {
	dbsPlugins[key] = { connect, cacheStore };
}

export function getByStore(store) {
	return dbsPlugins[store];
}
