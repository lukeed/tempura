import { readFile } from 'fs/promises';
import * as tempura from 'tempura';

function toErrors(err) {
	return [{
		detail: err,
		text: err.message,
		// TODO: parse lines
		// location: { file },
	}];
}

export function transform(options) {
	let { filter, format, ...config } = options || {};

	filter = filter || /\.hbs$/;

	return {
		name: 'tempura',
		setup(build) {
			// respect `format` or rely on `esbuild` config
			config.format = format || build.initialOptions.format;

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
		setup(build) {
			build.onLoad({ filter }, async (args) => {
				let source = await readFile(args.path, 'utf8');
				let output = { loader: 'text' };

				try {
					let input = values && await values(args.path);
					let render = tempura.compile(source, config);

					let result = await render(input || {});
					if (minify) result = minify(result);

					output.contents = result;
				} catch (err) {
					output.errors = toErrors(err); // args.path
				}

				return output;
			});
		}
	}
}
