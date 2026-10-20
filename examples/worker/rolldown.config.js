import { join } from 'node:path';
import { defineConfig } from 'rolldown';
import { rolldown } from '../../dist/plugins.js';

export default defineConfig({
	input: 'src/index.js',
	output: {
		format: 'esm',
		file: 'output/rolldown.js',
	},
	resolve: {
		alias: { tempura: join(import.meta.dirname, '../../dist/index.js') },
	},
	plugins: [
		rolldown.transform({
			// Options
		}),
	],
});
