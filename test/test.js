
import { start, stop } from './utils';

afterEach(stop);

test('should works', (done) => {
	const kapok = start(['start']);

	kapok.on('data', ({ ansiMessage }) => {
		console.log(ansiMessage);
	});

	kapok.on('line', ({ ansiMessage, message }) => {
		if (message.startsWith('Error')) {
			done.fail(new Error(message));
		}
	});

	// kapok.on('data', ({ ansi }) => {
	// 	console.log(ansi);
	// 	expect(true).toBe(true);
	// });

	// kapok.on('error', (err) => {
	// 	// stop(() => {
	// 	// 	console.log('done');
	// 	// 	done.fail(err);
	// 	// });

	// 	// kapok.child.kill();
	// 	// done.fail(err);

	// 	// console.log('.');
	// 	// console.log('=======================error', err);
	// 	done.fail(err);
	// 	// setTimeout(() => done.fail(err), 1000);
	// });
});
