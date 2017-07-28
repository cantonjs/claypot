
const argsKeyBlackList = [
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
