
import { start, stop } from './utils';
import getPort from 'get-port';
import isPortReachable from 'is-port-reachable';

afterEach(stop);

test('claypot start', async () => {
	return start(['start'])
		.assertUntil(/claypot started/, {
			action() {
				console.log('server started');
			}
		})
		.done()
	;
});

// test('claypot start --port', async () => {
// 	const port = await getPort();
// 	return start(['start', '--port', port])
// 		.assertUntil(/claypot started/, {
// 			async action() {
// 				console.log('port', port);
// 				const reachable = await isPortReachable(port);
// 				console.log('reachable', reachable);
// 				expect(reachable).toBe(true);
// 			}
// 		})
// 		.done()
// 	;
// });
