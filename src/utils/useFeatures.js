
import config from '../config';
import importModule from 'pot-js/lib/utils/importModule';
import { resolve } from 'path';
import { isObject } from 'lodash';
import { appLogger } from './logger';

const featuresWhiteList = [
	'responseTime',
	'logger',
	'helmet',
	'compress',
	'favicon',
	'plugins',
	'historyAPIFallback',
	'static',
	'notFound',
];

export default function useFeatures(app) {
	featuresWhiteList
		.filter((module) => config.features[module])
		.forEach((module) => {
			const { features, root } = config;
			const value = features[module];
			const options = isObject(value) ? value : {};
			try {
				const use = importModule(module, {
					root,
					prefer: resolve(__dirname, '../middlewares'),
				});
				use(app, options);
			}
			catch (err) {
				appLogger.error(err);
			}
		})
	;
}
