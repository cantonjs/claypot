import Schema from 'skeeler';

const originalUse = Schema.use;

let originalTypes = Schema.getTypes();

Schema.use = function use(...args) {
	originalTypes = originalUse(...args).getTypes();
	return Schema;
};

export { Schema };

export const types = new Proxy(originalTypes, {
	get(_, key) {
		return originalTypes[key];
	},
	ownKeys() {
		return Reflect.ownKeys(originalTypes);
	},
});
