
import importFile from 'import-file';
import { isAbsolute } from 'path';

export default function importConfigFile(configFile, configWalk) {
	const useFindUp = configWalk && !isAbsolute(configFile);
	return importFile(configFile, { useFindUp });
}
