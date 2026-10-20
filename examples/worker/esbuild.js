import { join } from 'node:path';
import { build } from 'esbuild';
import { esbuild } from '../../dist/plugins.js';

await build({
	bundle: true,
	entryPoints: ['src/index.js'],
	outfile: 'output/esbuild.js',
	format: 'esm',
	alias: { tempura: join(import.meta.dirname, '../../dist/index.js') },
	plugins: [
		esbuild.transform({
			// Options
		}),
	],
});
