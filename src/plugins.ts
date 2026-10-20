import { readFile } from 'node:fs/promises';

import * as tempura from './index.js';

import type { Message, OnLoadResult, Plugin as EsbuildPlugin } from 'esbuild';
import type { Plugin as RolldownPlugin } from 'rolldown';
import type { Plugin as VitePlugin } from 'vite';
import type { Options } from './types/index.d.ts';
import type { CompileOptions, TransformOptions } from './types/plugins.d.ts';

type Settings = Required<Pick<CompileOptions, 'filter'>> & Pick<CompileOptions, 'values' | 'minify'> & {
	config: Options;
};

function settings(options: CompileOptions = {}): Settings {
	let { filter, values, minify, ...config } = options;

	if (values && typeof values !== 'function') {
		throw new Error('Must be a function: `options.values`');
	}

	if (minify && typeof minify !== 'function') {
		throw new Error('Must be a function: `options.minify`');
	}

	return { filter: filter || /\.hbs$/, values, minify, config };
}

async function render(source: string, file: string, { values, minify, config }: Settings): Promise<string> {
	let input = values && await values(file);
	let result = await tempura.compile(source, config)(input || {});
	return minify ? minify(result) : result;
}

function toErrors(err: unknown): Partial<Message>[] {
	return [{
		detail: err,
		text: err instanceof Error ? err.message : String(err),
		// TODO: parse lines
		// location: { file },
	}];
}

export const esbuild = {
	transform(options?: TransformOptions): EsbuildPlugin {
		let { filter, config } = settings(options);

		return {
			name: 'tempura',
			setup(build) {
				build.onLoad({ filter }, async (args) => {
					let source = await readFile(args.path, 'utf8');
					let output: OnLoadResult = { loader: 'js' };

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

	compile(options?: CompileOptions): EsbuildPlugin {
		let found = settings(options);

		return {
			name: 'tempura',
			setup(build) {
				build.onLoad({ filter: found.filter }, async (args) => {
					let source = await readFile(args.path, 'utf8');
					let output: OnLoadResult = { loader: 'text' };

					try {
						output.contents = await render(source, args.path, found);
					} catch (err) {
						output.errors = toErrors(err); // args.path
					}

					return output;
				});
			}
		};
	},
};

// the rolldown and vite plugins share these hooks
function transformer(options?: TransformOptions) {
	let { filter, config } = settings(options);

	return {
		name: 'tempura',
		transform: {
			filter: { id: filter },
			handler(source: string) {
				return { code: tempura.transform(source, config), moduleType: 'js' as const };
			},
		},
	};
}

function compiler(options?: CompileOptions) {
	let found = settings(options);

	return {
		name: 'tempura',
		transform: {
			filter: { id: found.filter },
			async handler(source: string, file: string) {
				let result = await render(source, file, found);
				return { code: 'export default ' + JSON.stringify(result), moduleType: 'js' as const };
			},
		},
	};
}

export const rolldown = {
	transform(options?: TransformOptions): RolldownPlugin {
		return transformer(options);
	},

	compile(options?: CompileOptions): RolldownPlugin {
		return compiler(options);
	},
};

export const vite = {
	transform(options?: TransformOptions): VitePlugin {
		return { ...transformer(options), enforce: 'pre' };
	},

	compile(options?: CompileOptions): VitePlugin {
		return { ...compiler(options), enforce: 'pre' };
	},
};
