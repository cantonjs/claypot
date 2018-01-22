const blackList = ['$0', 'dev', 'help', 'version'];

export default function stripArgs(args) {
	Object.keys(args).forEach((key) => {
		if (blackList.includes(key) || key.length < 2) {
			Reflect.deleteProperty(args, key);
		}
	});
}
