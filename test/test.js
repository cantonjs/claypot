
import { start, stop, delay } from './utils';
import getPort from 'get-port';
import isPortReachable from 'is-port-reachable';
import fetch from 'node-fetch';

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

test('start server', async () => {
	const port = await getPort();
	return start(['start', '--port', port])
		.assertUntil(/claypot started/, {
			async action() {
				await delay(3000);
				await fetch(`http://localhost:${port}`);
				await delay(1000);
			}
		})
		.done()
	;
}, 10000);

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
