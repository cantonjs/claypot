
import { start, stop } from './utils';

afterEach(stop);

test('should works', (done) => {
	const proc = start(['start']);

	proc.on('data', (data) => {
		console.log('data', data);
		expect(true).toBe(true);
	});

	proc.on('error', (err) => {
		// stop(() => {
		// 	console.log('done');
		// 	done.fail(err);
		// });

		// proc.child.kill();
		// done.fail(err);

		// console.log('.');
		// console.log('=======================error', err);
		done.fail(err);
		// setTimeout(() => done.fail(err), 1000);
	});
});
