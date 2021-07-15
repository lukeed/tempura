import * as tempura from 'tempura';

export function transform(options) {
	let { filter, format, ...config } = options || {};

	filter = filter || /\.hbs$/;

	return {
		name: 'tempura',
		transform(source, file) {
			if (!filter.test(file)) return;
			return tempura.transform(source, config);
		},
	}
}

export function compile(options) {
	let { filter, values, minify, ...config } = options || {};

	filter = filter || /\.hbs$/;

	if (values && typeof values !== 'function') {
		throw new Error('Must be a function: `options.values`');
	}

	if (minify && typeof minify !== 'function') {
		throw new Error('Must be a function: `options.minify`');
	}

	return {
		name: 'tempura',
		async transform(source, file) {
			if (!filter.test(file)) return;

			let input = values && await values(file);
			let render = tempura.compile(source, config);

			let result = await render(input || {});
			if (minify) result = minify(result);

			return 'export default ' + JSON.stringify(result);
		},
	}
}
