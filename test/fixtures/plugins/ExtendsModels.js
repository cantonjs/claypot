export default class ExtendsModels {
	models(Models) {
		for (const [, Model] of Models) {
			Model.test = {
				foo() {
					return 'hello';
				},
			};
		}
	}
}
