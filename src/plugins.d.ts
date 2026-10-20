import type { Plugin as EsbuildPlugin } from 'esbuild';
import type { Plugin as RollupPlugin } from 'rollup';
import type { Args, Options } from 'tempura';

export type TransformOptions = Options & {
	/**
	 * Pattern to match
	 * @default /\.hbs$/
	 */
	filter?: RegExp;
};

export type CompileOptions = TransformOptions & {
	/**
	 * The input argument(s) to provide each template.
	 * Function receives the template's file path.
	 */
	values?: (file: string) => Promise<Args|void> | Args | void;
	/**
	 * Optional minifier function.
	 * Runs *after* the template has been rendered.
	 */
	minify?: (result: string) => string;
};

export declare namespace esbuild {
	/**
	 * Load each template as a module whose default export renders it.
	 * @example esbuild.build({ plugins: [esbuild.transform()] })
	 */
	function transform(options?: TransformOptions): EsbuildPlugin;
	/**
	 * Render each template at build time, and load it as its HTML string.
	 * @example esbuild.build({ plugins: [esbuild.compile({ values: () => ({ title: 'Hello' }) })] })
	 */
	function compile(options?: CompileOptions): EsbuildPlugin;
}

export declare namespace rollup {
	/**
	 * Load each template as a module whose default export renders it.
	 * @example rollup({ plugins: [rollup.transform()] })
	 */
	function transform(options?: TransformOptions): RollupPlugin;
	/**
	 * Render each template at build time, and load it as its HTML string.
	 * @example rollup({ plugins: [rollup.compile({ values: () => ({ title: 'Hello' }) })] })
	 */
	function compile(options?: CompileOptions): RollupPlugin;
}
