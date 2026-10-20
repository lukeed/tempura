import type { Plugin as EsbuildPlugin } from 'esbuild';
import type { Plugin as RolldownPlugin } from 'rolldown';
import type { Plugin as VitePlugin } from 'vite';
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

export declare namespace rolldown {
	/**
	 * Load each template as a module whose default export renders it.
	 * @example rolldown({ plugins: [rolldown.transform()] })
	 */
	function transform(options?: TransformOptions): RolldownPlugin;
	/**
	 * Render each template at build time, and load it as its HTML string.
	 * @example rolldown({ plugins: [rolldown.compile({ values: () => ({ title: 'Hello' }) })] })
	 */
	function compile(options?: CompileOptions): RolldownPlugin;
}

export declare namespace vite {
	/**
	 * Load each template as a module whose default export renders it.
	 * @example defineConfig({ plugins: [vite.transform()] })
	 */
	function transform(options?: TransformOptions): VitePlugin;
	/**
	 * Render each template at build time, and load it as its HTML string.
	 * @example defineConfig({ plugins: [vite.compile({ values: () => ({ title: 'Hello' }) })] })
	 */
	function compile(options?: CompileOptions): VitePlugin;
}
