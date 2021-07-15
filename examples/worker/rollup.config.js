export default {
	input: 'src/index.js',
	output: {
		format: 'esm',
		file: 'output/rollup.js',
		sourcemap: false,
	},
	plugins: [
		require('@rollup/plugin-node-resolve').default(),
		require('tempura/rollup').transform({
			format: 'esm',
		})
	]
}
