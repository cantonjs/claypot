import { readFileSync } from 'fs';
import { resolve } from 'path';
import logger from 'pot-logger';
import config from '../config';

const tryReadFile = (file) => {
	const filename = resolve(config.baseDir, file);
	try {
		return readFileSync(filename);
	}
	catch (err) {
		logger.error(`Failed to read file "${filename}".`);
		logger.debug(err);
	}
};

export default function getCertOption(sslKey, sslCert) {
	const key = tryReadFile(sslKey);
	const cert = tryReadFile(sslCert);
	if (!key || !cert) {
		return {};
	}
	else {
		return { key, cert };
	}
}
