
import httpProxy from '../utils/httpProxy';
import { forEach } from 'lodash';

export default function proxy(app, options) {
	forEach(options, (proxyConfig, pathname) => {
		const proxyMiddleware = httpProxy(proxyConfig);
		proxyMiddleware && app.mount(pathname, proxyMiddleware);
	});
}
