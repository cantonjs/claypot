import { toPairs } from 'lodash';

export function resolveDatabases(appConfig) {
	return new Map(toPairs(appConfig.dbs));
}
