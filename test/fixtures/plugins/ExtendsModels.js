export default class ExtendsModels {
	registerDatabase(register) {
		register('test', {
			createModels(names) {
				return names.reduce((models, name) => {
					models[name] = {
						ext() {
							return name;
						},
					};
					return models;
				}, {});
			},
		});
	}
}
