import { readFile } from 'node:fs/promises';
import * as tempura from 'tempura';

function settings(options) {
	let { filter, values, minify, ...config } = options || {};

	if (values && typeof values !== 'function') {
		throw new Error('Must be a function: `options.values`');
	}

	if (minify && typeof minify !== 'function') {
		throw new Error('Must be a function: `options.minify`');
	}

	return { filter: filter || /\.hbs$/, values, minify, config };
}

async function render(source, file, values, minify, config) {
	let input = values && await values(file);
	let result = await tempura.compile(source, config)(input || {});
	return minify ? minify(result) : result;
}

function toErrors(err) {
	return [{
		detail: err,
		text: err.message,
		// TODO: parse lines
		// location: { file },
	}];
}

export const esbuild = {
	transform(options) {
		let { filter, config } = settings(options);

		return {
			name: 'tempura',
			setup(build) {
				build.onLoad({ filter }, async (args) => {
					let source = await readFile(args.path, 'utf8');
					let output = { loader: 'js' };

					try {
						output.contents = tempura.transform(source, config);
					} catch (err) {
						output.errors = toErrors(err); // args.path
					}

					return output;
				});
			}
		};
	},

	compile(options) {
		let { filter, values, minify, config } = settings(options);

		return {
			name: 'tempura',
			setup(build) {
				build.onLoad({ filter }, async (args) => {
					let source = await readFile(args.path, 'utf8');
					let output = { loader: 'text' };

					try {
						output.contents = await render(source, args.path, values, minify, config);
					} catch (err) {
						output.errors = toErrors(err); // args.path
					}

					return output;
				});
			}
		};
	},
};

export const rolldown = {
	transform(options) {
		let { filter, config } = settings(options);

		return {
			name: 'tempura',
			transform: {
				filter: { id: filter },
				handler(source) {
					return { code: tempura.transform(source, config), moduleType: 'js' };
				},
			},
		};
	},

	compile(options) {
		let { filter, values, minify, config } = settings(options);

		return {
			name: 'tempura',
			transform: {
				filter: { id: filter },
				async handler(source, file) {
					let result = await render(source, file, values, minify, config);
					return { code: 'export default ' + JSON.stringify(result), moduleType: 'js' };
				},
			},
		};
	},
};

export const vite = {
	transform(options) {
		return { ...rolldown.transform(options), enforce: 'pre' };
	},

	compile(options) {
		return { ...rolldown.compile(options), enforce: 'pre' };
	},
};
