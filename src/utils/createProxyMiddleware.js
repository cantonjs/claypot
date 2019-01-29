import httpProxy from '../utils/httpProxy';
import { isObject } from 'lodash';

export default function createProxyMiddleware(app, proxies) {
	for (const pathname in proxies) {
		if (!proxies.hasOwnProperty(pathname)) continue;
		const config = proxies[pathname];
		const param = isObject(config) ? { pathname, ...config } : config;
		const proxyMiddleware = httpProxy(param);
		proxyMiddleware && app.mount(pathname, proxyMiddleware);
	}
}
