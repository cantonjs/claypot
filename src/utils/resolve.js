
import { join } from 'path';
import { isString } from 'lodash';
import interpret from 'interpret';

export const cwd = process.cwd();
export const inProj = (...args) => join(cwd, ...args);

const resolveES6 = (path) => {
	const module = require(path);
	return module.default || module;
};

const resolveFromPaths = (paths) => {
	let error;

	const tryResolve = (path) => {
		try { return require.resolve(path); }
		catch (err) { error = err; }
	};

	const resolvedPath = paths.find(tryResolve);

	if (resolvedPath) { return resolvedPath; }
	else { throw error; }
};

const resolveModules = (type) => (module) => {
	if (!isString(module)) { return module; }

	const paths = [
		`../${type}/${module}`,
		inProj(module),
		module,
	];

	try {
		const resolvedPath = resolveFromPaths(paths);
		return resolveES6(resolvedPath);
	}
	catch (err) {
		throw new Error(`Cannot resolve ${type} ${module}`);
	}
};

export const resolveConfigFile = () => {

	const extensions = Object.keys(interpret.extensions).sort((a, b) =>
		a === '.js' ? -1 : b === '.js' ? 1 : a.length - b.length
	);

	const paths = [];
	const pathExtMap = {};

	['Claypotfile', 'claypot.config']
		.forEach((baseName) =>
			extensions.forEach((ext) => {
				const path = join(cwd, baseName + ext);
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
};

export const resolvePlugin = resolveModules('plugins');
export const resolveMiddleware = resolveModules('middlewares');
