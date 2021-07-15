import type { Args, Options } from 'tempura';
import type { Plugin } from 'rollup';

export function transform(options?: Options & {
	/**
	 * Pattern to match
	 * @default /\.hbs$/
	 */
	filter?: RegExp;
	/**
	 * Output format.
	 * Defaults to esbuild value.
	 */
	format?: 'esm' | 'cjs';
}): Plugin;

export function compile(options: Options & {
	/**
	 * Pattern to match
	 * @default /\.hbs$/
	 */
	filter?: RegExp;
	/**
	 * The input argument(s) to provide each template.
	 * Function receives the template's file path.
	 */
	values?: (file: string) => Promise<Args|void> | Args | void,
	/**
	 * Optional minifier function.
	 * Runs *after* the template has been rendered.
	 */
	minify?: (result: string) => string,
}): Plugin;
