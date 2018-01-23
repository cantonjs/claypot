export default class Models {
	willCreateModels(models) {
		for (const [key, Model] of models) {
			if (key === 'hello') {
				Model.prototype.bar = 'baz';
			}
		}
	}
}
