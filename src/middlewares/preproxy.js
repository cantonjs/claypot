import createProxyMiddleware from '../utils/createProxyMiddleware';

// The `preproxy` middleware hook will be apply before `plugin` middleware
export default function preproxy(...args) {
	createProxyMiddleware(...args);
}
