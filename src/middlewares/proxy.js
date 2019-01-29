import createProxyMiddleware from '../utils/createProxyMiddleware';

// The `proxy` middleware hook will be apply after `plugin` middleware, before `static` middleware
export default function proxy(...args) {
	createProxyMiddleware(...args);
}
