import config from '../config';
import { readdirSync } from 'fs';
import path from 'path';

// Prevent caching of this module so module.parent is always accurate
const parentFile = module.parent.filename;

export default function importModules(dir, opts) {
	dir = path.resolve(config.baseDir, dir || '');
	opts = Object.assign({ camelize: true }, opts);

	let files;

	try {
		files = readdirSync(dir);
	}
	catch (err) {
		return {};
	}

	const done = new Set();
	const ret = {};

	// Adhere to the Node.js require algorithm by trying each extension in order
	for (const file of files) {
		const stem = path.basename(file).replace(/\.\w+$/, '');
		const fullPath = path.join(dir, file);

		if (
			done.has(stem) ||
			fullPath === parentFile ||
			path.extname(file) !== '.js' ||
			stem[0] === '_' ||
			stem[0] === '.'
		) {
			continue;
		}

		const exportKey = opts.camelize ?
			stem.replace(/-(\w)/g, (m, p1) => p1.toUpperCase()) :
			stem;

		ret[exportKey] = require(fullPath);
		done.add(stem);
	}

	return ret;
}
