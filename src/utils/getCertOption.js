import { readFileSync } from 'fs';
import { resolve } from 'path';
import logger from 'pot-logger';

const makeTryReadFile = (baseDir) => (file) => {
	const filename = resolve(baseDir, file);
	try {
		return readFileSync(filename);
	}
	catch (err) {
		logger.error(`Failed to read file "${filename}".`);
		logger.debug(err);
	}
};

export default function getCertOption(baseDir, sslKey, sslCert) {
	const tryReadFile = makeTryReadFile(baseDir);
	const key = tryReadFile(sslKey);
	const cert = tryReadFile(sslCert);
	if (!key || !cert) {
		return {};
	}
	else {
		return { key, cert };
	}
}
