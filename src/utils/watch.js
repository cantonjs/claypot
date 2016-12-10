
import chokidar from 'chokidar';

export default function watch({ enable, dirs, ...options }, handler) {
	if (!enable) { return; }

	chokidar.watch(dirs, {
		...options,
		usePolling: true,
		ignoreInitial: true,
		ignored: /(^|[\/\\])\../,
	}).on('all', handler);
}
