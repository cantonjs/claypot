export function resolveDatabases(databases, appConfig) {
	const { dbs } = appConfig;

	Object.keys(dbs).forEach((key) => {
		const { store, ...config } = dbs[key];
		Reflect.deleteProperty(config, 'cache');
		databases.set(key, { store, config });
	});

	return databases;
}
