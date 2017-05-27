
import { start, stop } from './utils';

afterEach(stop);

test('should works', (done) => {
	const kapok = start(['start']);

	kapok
		.until(/claypot started/)
		.assert(/claypot started/, {
			action() {
				console.log('server started');
				done();
			}
		})
		.done()
	;

});
