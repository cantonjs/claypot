export default class ExtendsModels {
	registerDatabase(register) {
		register('fakeDb', {
			createModels(names) {
				return names.reduce((models, name) => {
					models[name] = {
						foo() {
							return name;
						},
					};
					return models;
				}, {});
			},
		});
	}
}
