
const blackList = [
	'$0',
	'_',
	'c',
	'd',
	'dev',
	'f',
	'h',
	'help',
	'l',
	'p',
	's',
	'version',
	'w',

	// monitor
	'configFile',
	'configToEnv',
	'configWalk',
	'entry',
	'workspace',
];

export default function strip(config) {
	Object.keys(config).forEach((key) => {
		if (blackList.includes(key)) {
			Reflect.deleteProperty(config, key);
		}
	});
}
