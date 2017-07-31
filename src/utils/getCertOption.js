
import { readFileSync } from 'fs';
import { resolve } from 'path';
import logger from 'pot-logger';

const makeTryReadFile = (root) => (file) => {
	const filename = resolve(root, file);
	try {
		return readFileSync(filename);
	}
	catch (err) {
		logger.error(`Failed to read file "${filename}".`);
		logger.debug(err);
	}
};

export default function getCertOption(root, sslKey, sslCert) {
	const tryReadFile = makeTryReadFile(root);
	const key = tryReadFile(sslKey);
	const cert = tryReadFile(sslCert);
	if (!key || !cert) { return {}; }
	else { return { key, cert }; }
}
