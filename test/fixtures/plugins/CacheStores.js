export default class CacheStores {
	cacheStores(stores) {
		for (const [key, options] of stores) {
			if (key === 'foo') {
				options.store = 'memory';
			}
		}
	}
}
