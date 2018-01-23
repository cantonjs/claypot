export default class Databases {
	databases(dbs, app) {
		app.dbsKeys = [...dbs.keys()];
	}
}
