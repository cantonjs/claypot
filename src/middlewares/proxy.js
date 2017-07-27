
import httpProxy from '../utils/httpProxy';
import { forEach, isObject } from 'lodash';

export default function proxy(app, options) {
	forEach(options, (config, pathname) => {
		const proxyConfig = isObject(config) ? { pathname, ...config } : config;
		const proxyMiddleware = httpProxy(proxyConfig);
		proxyMiddleware && app.mount(pathname, proxyMiddleware);
	});
}
