
import { isString } from 'lodash';
import interpret from 'interpret';
import { argv } from './args';
import { resolveES6, resolveFromPaths } from '../utils/resolve';

export default function resolveConfigFile(inProj) {
	const { config } = argv;

	if (config) { return inProj(config); }

	const extensions = Object.keys(interpret.extensions).sort((a, b) =>
		a === '.js' ? -1 : b === '.js' ? 1 : a.length - b.length
	);

	const paths = [];
	const pathExtMap = {};

	['Claypotfile', 'claypot.config']
		.forEach((baseName) =>
			extensions.forEach((ext) => {
				const path = inProj(baseName + ext);
				paths.push(path);
				pathExtMap[path] = ext;
			})
		)
	;

	const registerCompiler = function registerCompiler(moduleDescriptor) {
		if (!moduleDescriptor) { return; }

		if (isString(moduleDescriptor)) {
			require(moduleDescriptor);
		} else if (!Array.isArray(moduleDescriptor)) {
			moduleDescriptor.register(require(moduleDescriptor.module));
		} else {
			for (const compiler of moduleDescriptor) {
				try {
					registerCompiler(compiler);
					break;
				} catch (err) {
					// noop
				}
			}
		}
	};

	try {
		const filePath = resolveFromPaths(paths);
		const ext = pathExtMap[filePath];
		const moduleDescriptor = interpret.extensions[ext];
		registerCompiler(moduleDescriptor);
		return resolveES6(filePath);
	}
	catch (err) {
		// noop
	}
}
