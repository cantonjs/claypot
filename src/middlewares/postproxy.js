import createProxyMiddleware from '../utils/createProxyMiddleware';

// The `postproxy` middleware hook will be apply after `static` middleware
export default function postproxy(...args) {
	createProxyMiddleware(...args);
}
