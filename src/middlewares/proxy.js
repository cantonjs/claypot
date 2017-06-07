
import httpProxy from '../utils/httpProxy';
import { forEach } from 'lodash';

export default function proxy(app, options) {
	forEach(options, (proxyConfig, pathname) => {
		// app.mount(pathname, httpProxy(proxyConfig));
		app.mount(pathname, httpProxy(proxyConfig));
	});
}
