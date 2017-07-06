
import globby from 'globby';
import { join, basename } from 'path';

export default async function mapModules(baseDir, root, ext = '.js') {
	const modules = await globby([`*${ext}`], {
		cwd: join(root, baseDir),
		absolute: true,
	});
	return modules.reduce((ret, modulePath) => {
		const result = require(modulePath);
		const name = basename(modulePath, ext);
		ret[name] = result.default || result;
		return ret;
	}, {});
}
