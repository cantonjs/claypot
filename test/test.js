
// import { start, stop } from './utils';
// import delay from 'delay';
// import getPort from 'get-port';
// import fetch from 'node-fetch';

// afterEach(stop);

// test('claypot start', async () => {
// 	return start(['start'])
// 		.assertUntil(/started/, {
// 			action() {
// 				console.log('server started');
// 			}
// 		})
// 		.done()
// 	;
// });

// test('start server', async () => {
// 	const port = await getPort();
// 	return start(['start', '--port', port])
// 		.assertUntil(/started/, {
// 			async action() {
// 				await delay(3000);
// 				await fetch(`http://localhost:${port}`);
// 				await delay(1000);
// 			}
// 		})
// 		.done()
// 	;
// }, 10000);
