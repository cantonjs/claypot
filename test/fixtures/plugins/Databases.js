export default class Databases {
	willConnectDatabases(dbs, app) {
		app.dbsKeys = [...dbs.keys()];
	}
}
