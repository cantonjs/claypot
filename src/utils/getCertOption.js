
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { appLogger } from '../utils/logger';

const makeTryReadFile = (root) => (file) => {
	const filename = resolve(root, file);
	try {
		return readFileSync(filename);
	}
	catch (err) {
		appLogger.error(`Failed to read file "${filename}".`);
		appLogger.debug(err);
	}
};

export default function getCertOption(root, sslKey, sslCert) {
	const tryReadFile = makeTryReadFile(root);
	const key = tryReadFile(sslKey);
	const cert = tryReadFile(sslCert);
	if (!key || !cert) { return {}; }
	else { return { key, cert }; }
}
