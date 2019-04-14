import { ensureLogger } from 'pot-logger';

export default function rewrites(app, rules) {
	const logger = ensureLogger('rewrite');

	if (Array.isArray(rules)) {
		const [src, dist] = rules;
		rules = { [src]: dist };
	}
	for (const [src, dist] of Object.entries(rules)) {
		if (!src || !dist || !rules.hasOwnProperty(src)) continue;
		app.rewrite(src, dist, logger);
	}
}
