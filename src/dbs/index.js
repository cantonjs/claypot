export function resolveDatabases(appConfig) {
	const { dbs } = appConfig;
	const dbsMap = new Map();

	Object.keys(dbs).forEach((key) => {
		const { store, ...config } = dbs[key];
		Reflect.deleteProperty(config, 'cache');
		dbsMap.set(key, { store, config });
	});

	return dbsMap;
}
