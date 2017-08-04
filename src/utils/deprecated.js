
import logger from 'pot-logger';

const warned = {};

export function deprecatedProp(propType, explanation) {
	return function validate(props, propName, componentName, ...rest) {
		if (props[propName] != null) {

			// eslint-disable-next-line max-len
			const message = `"${propName}" property of "${componentName}" has been deprecated. ${explanation}`;

			if (!warned[message]) {
				logger.warn(message);
				warned[message] = true;
			}
		}

		return propType(props, propName, componentName, ...rest);
	};
}
