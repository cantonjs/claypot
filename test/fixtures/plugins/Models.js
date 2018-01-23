export default class Models {
	models(models) {
		for (const [key, Model] of models) {
			if (key === 'hello') {
				Model.prototype.bar = 'baz';
			}
		}
	}
}
