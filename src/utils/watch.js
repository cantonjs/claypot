
import chokidar from 'chokidar';

export default function watch(options, handler) {
	const { enable, dirs, ignoreDotFiles, ...other } = options;

	if (!enable) { return; }

	if (ignoreDotFiles) {
		other.ignored = /(^|[\/\\])\../;
	}

	chokidar.watch(dirs, {
		...other,
		usePolling: true,
		ignoreInitial: true,
	}).on('all', handler);
}
