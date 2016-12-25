
import { resolve } from 'path';
import { isString } from 'lodash';

export const resolveES6 = (path) => {
	const module = require(path);
	return module.default || module;
};

export const resolveFromPaths = (paths) => {
	let error;

	const tryResolve = (path) => {
		try { return require.resolve(path); }
		catch (err) { error = err; }
	};

	const resolvedPath = paths.find(tryResolve);

	if (resolvedPath) { return resolvedPath; }
	else { throw error; }
};

const resolveModules = (type) => (root, module) => {
	if (!isString(module)) { return module; }

	const paths = [
		`../${type}/${module}`,
		resolve(root, module),
		module,
	];

	const resolvedPath = resolveFromPaths(paths);
	return resolveES6(resolvedPath);
};

export const resolvePlugin = resolveModules('plugins');
export const resolveMiddleware = resolveModules('middlewares');
