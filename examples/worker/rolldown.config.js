import { defineConfig } from 'rolldown';
import { rolldown } from 'tempura/plugins';

export default defineConfig({
	input: 'src/index.js',
	output: {
		format: 'esm',
		file: 'output/rolldown.js',
	},
	plugins: [
		rolldown.transform({
			// Options
		}),
	],
});
