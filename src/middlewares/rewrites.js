import rewrite from 'koa-rewrite';

export default function rewrites(app, rules) {
	if (Array.isArray(rules)) {
		const [src, dist] = rules;
		rules = { [src]: dist };
	}
	for (const src in rules) {
		if (!rules.hasOwnProperty(src)) continue;
		const dist = rules[src];
		if (!dist) continue;
		app.use(rewrite(src, dist));
	}
}
