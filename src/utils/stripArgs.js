
const argsKeyBlackList = [
	'$0',
	'_',
	'c',
	'config-walk',
	'd',
	'dev',
	'f',
	'h',
	'help',
	'l',
	'log-level',
	'logs-dir',
	'max-restarts',
	'p',
	's',
	'version',
	'w',
	'watch-dirs',
	'watch-ignore-dot-files',
];

const configKeyBlackList = [
	'config',
	'configToEnv',
	'configWalk',
	'entry',
	'workspace',
];

const createStripFunc = (blackList) => (args) => {
	Object.keys(args).forEach((key) => {
		if (blackList.includes(key)) {
			Reflect.deleteProperty(args, key);
		}
	});
};

export const stripCliArgs = createStripFunc(argsKeyBlackList);
export const stripConfigArgs = createStripFunc(configKeyBlackList);
