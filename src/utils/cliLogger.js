
import chalk from 'chalk';

export default {
	info(...args) {
		console.log(...args);
	},
	warn(...args) {
		console.warn(chalk.red('[WARNING]', ...args));
	},
	error(...args) {
		console.error(chalk.bold.red('[ERROR]', ...args));
	},
};
