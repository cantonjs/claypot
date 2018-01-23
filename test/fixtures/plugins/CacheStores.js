export default class CacheStores {
	willCreateCacheStores(stores) {
		for (const [key, options] of stores) {
			if (key === 'foo') {
				options.store = 'memory';
			}
		}
	}
}
