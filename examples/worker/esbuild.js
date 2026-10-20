import { build } from 'esbuild';
import { esbuild } from 'tempura/plugins';

await build({
	bundle: true,
	entryPoints: ['src/index.js'],
	outfile: 'output/esbuild.js',
	format: 'esm',
	plugins: [
		esbuild.transform({
			// Options
		}),
	],
});
